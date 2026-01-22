import logging
from typing import Optional

import httpx

from app.models.api.games.get_game_state import GameState, GetGameStateResponse
from app.models.api.games.initialize import InitializeCaptureResponse
from app.models.api.games.move_piece import MovePieceResponse
from app.models.game.base import Position
from app.models.game.engine import (GameBoard, GameEngine, Marking, Movement,
                                    Piece, VictoryState, parse_piece)
from app.services.database import DatabaseService
from app.utils.errors import (InvalidInitializationError, NotPlayerTurnError,
                              RoomNotFoundError)
from app.utils.game import is_player_turn

log = logging.getLogger(__name__)


class GamesService:
    async def initialize_capture(self, game_id: str) -> InitializeCaptureResponse:
        game_state: GetGameStateResponse = await self.get_game_state(game_id=game_id)
        raw_pieces = game_state.pieces
        curr_pieces: list[Piece] = [parse_piece(p) for p in raw_pieces]
        game_engine = GameEngine(pieces=curr_pieces)
        captured_pieces: list[Piece] = game_engine.process_initialization_capture()
        updated_pieces: list[Piece] = game_engine.game_board.get_pieces()
        return InitializeCaptureResponse(
            status_code=httpx.codes.OK,
            pieces=updated_pieces,
            captured_pieces=captured_pieces,
        )

    async def move_piece(
        self, game_id: str, piece: Piece, new_position: Position
    ) -> MovePieceResponse:
        client = await DatabaseService().get_client()
        game_state: GetGameStateResponse = await self.get_game_state(game_id=game_id)
        raw_pieces = game_state.pieces
        turn: int = game_state.turn
        if not is_player_turn(player=piece.player, turn=turn):
            raise NotPlayerTurnError(
                status_code=httpx.codes.BAD_REQUEST,
                detail=f"It's not {piece.player.value}'s turn",
            )

        curr_pieces: list[Piece] = [parse_piece(p) for p in raw_pieces]
        game_engine = GameEngine(pieces=curr_pieces)
        matching_piece = next((p for p in curr_pieces if p.id == piece.id), None)
        if matching_piece is None:
            raise ValueError(f"Piece with id {piece.id} not found in game")
        original_position: Position = matching_piece.position
        game_engine.move_piece(piece=matching_piece, new_position=new_position)
        captured_pieces: list[Piece] = game_engine.process_potential_capture(
            new_position=new_position
        )

        updated_pieces: list[Piece] = game_engine.game_board.get_pieces()
        turn += 1
        victory_state: Optional[VictoryState] = game_engine.process_potential_win()
        if victory_state:
            await client.table("rooms").update({"status": "completed"}).eq(
                "game_id", game_id
            ).execute()
        movement: Movement = Movement(
            previous_position=original_position,
            new_position=new_position,
        )
        await client.table("games").update(
            {
                "pieces": [p.model_dump() for p in updated_pieces],
                "captured_pieces": [p.model_dump() for p in captured_pieces],
                "turn": turn,
                "winner": victory_state.player if victory_state else None,
                "victory_type": victory_state.victory_type if victory_state else None,
                "movement": movement.model_dump(),
            }
        ).eq("game_id", game_id).execute()

        return MovePieceResponse.model_validate(
            {
                "status_code": httpx.codes.OK,
                "captured_pieces": captured_pieces,
                "victory_state": victory_state,
                "pieces": updated_pieces,
                "movement": movement,
                "turn": turn,
            }
        )

    async def get_game_state(self, game_id: str) -> GetGameStateResponse:
        client = await DatabaseService().get_client()
        response = (
            await client.table("games")
            .select(
                "pieces",
                "captured_pieces",
                "winner",
                "victory_type",
                "movement",
                "turn",
            )
            .eq("game_id", game_id)
            .execute()
        )
        if not response.data:
            raise RoomNotFoundError(
                status_code=httpx.codes.NOT_FOUND,
                detail=f"Room not found",
            )

        game_state = GameState.model_validate(response.data[0])
        return GetGameStateResponse(
            status_code=httpx.codes.OK,
            pieces=game_state.pieces,
            captured_pieces=game_state.captured_pieces,
            victory_state=(
                VictoryState(
                    player=game_state.winner, victory_type=game_state.victory_type
                )
                if game_state.winner and game_state.victory_type
                else None
            ),
            movement=game_state.movement,
            turn=game_state.turn,
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
                    "captured_pieces": [],
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
            game_engine = GameEngine(
                pieces=[parse_piece(p) for p in existing_pieces if isinstance(p, dict)]
            )
            captured_pieces: list[Piece] = game_engine.process_initialization_capture()
            updated_pieces: list[Piece] = game_engine.game_board.get_pieces()
            victory_state: Optional[VictoryState] = game_engine.process_potential_win()
            await client.table("games").update(
                {
                    "pieces": [p.model_dump() for p in updated_pieces],
                    "captured_pieces": [p.model_dump() for p in captured_pieces],
                    "winner": victory_state.player if victory_state else None,
                    "victory_type": (
                        victory_state.victory_type if victory_state else None
                    ),
                }
            ).eq("game_id", game_id).execute()
        else:
            await client.table("games").update({"pieces": existing_pieces}).eq(
                "game_id", game_id
            ).execute()

    async def toggle_marking(
        self, game_id: str, piece_id: str, marking: Marking
    ) -> None:
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
        if not isinstance(response.data[0], dict) or "pieces" not in response.data[0]:
            raise Exception(
                f"No 'pieces' key found in existing game data for game {game_id}"
            )
        existing_pieces = response.data[0]["pieces"]
        if not isinstance(existing_pieces, list):
            raise Exception(
                f"'pieces' key is not a list in existing game data for game {game_id}"
            )
        game_state: GetGameStateResponse = await self.get_game_state(game_id=game_id)
        raw_pieces = game_state.pieces
        curr_pieces: list[Piece] = [parse_piece(p) for p in raw_pieces]
        matching_piece = next((p for p in curr_pieces if p.id == piece_id), None)
        if matching_piece is None:
            raise ValueError(f"Piece with id {piece_id} not found in game")

        game_engine = GameEngine(pieces=curr_pieces)
        game_engine.toggle_marking(piece=matching_piece, marking=marking)
        updated_pieces: list[Piece] = game_engine.game_board.get_pieces()
        await client.table("games").update(
            {
                "pieces": [p.model_dump() for p in updated_pieces],
            }
        ).eq("game_id", game_id).execute()
