import logging
from typing import Optional

import httpx

from app.models.api.games.get_pieces import GetPiecesResponse
from app.models.api.games.move_piece import MovePieceResponse
from app.models.game.base import Player, Position
from app.models.game.engine import GameBoard, GameEngine, Piece, parse_piece
from app.services.database import DatabaseService
from app.utils.errors import (InvalidInitializationError, NotPlayerTurnError,
                              RoomNotFoundError)
from app.utils.game import is_player_turn

log = logging.getLogger(__name__)


class GamesService:
    async def move_piece(
        self, game_id: str, piece: Piece, new_position: Position
    ) -> MovePieceResponse:
        client = await DatabaseService().get_client()
        response = (
            await client.table("games").select("turn").eq("game_id", game_id).execute()
        )
        if not response.data:
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND,
                detail=f"Room not found",
            )
        if (
            not response.data[0]
            or not isinstance(response.data[0], dict)
            or "turn" not in response.data[0]
            or not isinstance(response.data[0]["turn"], int)
        ):
            raise Exception(
                f"No 'turn' key of type int found in existing game data for game {game_id}"
            )
        turn: int = response.data[0]["turn"]
        if not is_player_turn(player=piece.player, turn=turn):
            raise NotPlayerTurnError(
                status_code=httpx.codes.BAD_REQUEST,
                detail=f"It's not {piece.player.value}'s turn",
            )

        raw_pieces = (await self.get_pieces(game_id=game_id)).pieces
        curr_pieces: list[Piece] = [parse_piece(p) for p in raw_pieces]
        game_engine = GameEngine(pieces=curr_pieces)
        matching_piece = next((p for p in curr_pieces if p.id == piece.id), None)
        if matching_piece is None:
            raise ValueError(f"Piece with id {piece.id} not found in game")

        game_engine.move_piece(piece=matching_piece, new_position=new_position)
        captured_pieces: list[Piece] = game_engine.process_potential_capture(
            new_position=new_position
        )
        updated_pieces: list[Piece] = game_engine.game_board.get_pieces()
        turn += 1
        await client.table("games").update(
            {"pieces": [p.model_dump() for p in updated_pieces], "turn": turn}
        ).eq("game_id", game_id).execute()

        winner: Optional[Player] = game_engine.process_potential_win()
        if winner:
            await client.table("rooms").update({"status": "completed"}).eq(
                "game_id", game_id
            ).execute()

        return MovePieceResponse.model_validate(
            {
                "status_code": httpx.codes.OK,
                "captured_pieces": captured_pieces,
                "winner": winner.value if winner else None,
                "pieces": updated_pieces,
                "turn": turn,
            }
        )

    async def get_pieces(self, game_id: str) -> GetPiecesResponse:
        client = await DatabaseService().get_client()
        response = (
            await client.table("games")
            .select("pieces")
            .eq("game_id", game_id)
            .execute()
        )
        if not response.data:
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND,
                detail=f"Room not found",
            )
        if (
            not response.data[0]
            or not isinstance(response.data[0], dict)
            or "pieces" not in response.data[0]
        ):
            raise Exception(
                f"No 'pieces' key found in existing game data for game {game_id}"
            )
        if not isinstance(response.data[0]["pieces"], list):
            raise Exception(
                f"'pieces' key is not a list in existing game data for game {game_id}"
            )
        pieces = response.data[0]["pieces"]

        return GetPiecesResponse(
            status_code=httpx.codes.OK,
            pieces=pieces,
        )

    async def initialize(self, game_id: str, pieces: list[Piece]) -> None:
        game_board = GameBoard(pieces=pieces)
        if not game_board.are_pieces_valid_during_setup(pieces=pieces):
            raise InvalidInitializationError(
                status_code=httpx.codes.BAD_REQUEST,
                detail=f"Invalid board setup",
            )

        client = await DatabaseService().get_client()
        response = (
            await client.table("games")
            .select("pieces")
            .eq("game_id", game_id)
            .execute()
        )
        if not response.data:
            log.info("No existing pieces stored for game %s", game_id)
            await client.table("games").insert(
                {
                    "game_id": game_id,
                    "pieces": [piece.model_dump() for piece in pieces],
                }
            ).execute()
            return

        log.info("Found existing pieces for game %s", game_id)
        if not isinstance(response.data[0], dict) or "pieces" not in response.data[0]:
            raise Exception(
                f"No 'pieces' key found in existing game data for game {game_id}"
            )
        existing_pieces = response.data[0]["pieces"]
        if not isinstance(existing_pieces, list):
            raise Exception(
                f"'pieces' key is not a list in existing game data for game {game_id}"
            )
        existing_pieces += [piece.model_dump() for piece in pieces]
        log.debug("Updated pieces %s", existing_pieces)
        await client.table("games").update({"pieces": existing_pieces}).eq(
            "game_id", game_id
        ).execute()

        players_seen = set()
        for piece in existing_pieces:
            if isinstance(piece, dict):
                players_seen.add(piece.get("player", None))
            else:
                raise Exception(f"Piece in game {game_id} is not a dict: {piece!r}")
        if len(players_seen) == 2:
            await client.table("rooms").update({"status": "active"}).eq(
                "game_id", game_id
            ).execute()
