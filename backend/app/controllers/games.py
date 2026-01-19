import logging

import httpx
from fastapi import APIRouter
from starlette.responses import JSONResponse

from app.models.api.games.get_pieces import GetPiecesResponse
from app.models.api.games.initialize import InitializeRequest
from app.models.api.games.move_piece import MovePieceRequest, MovePieceResponse
from app.services.games import GamesService
from app.utils.errors import RoomNotFoundError

log = logging.getLogger(__name__)


class GamesController:
    def __init__(self, service: GamesService):
        self.router = APIRouter()
        self.service = service
        self.setup_routes()

    def setup_routes(self):
        router = self.router

        @router.post(
            "/initialize",
        )
        async def initialize(input: InitializeRequest) -> JSONResponse:
            try:
                log.info(
                    "Initializing pieces for player %s in game %s",
                    input.pieces[0].player,
                    input.game_id,
                )
                await self.service.initialize(
                    game_id=input.game_id,
                    pieces=input.pieces,  # pyright: ignore[reportArgumentType]
                )
                return JSONResponse(
                    content={
                        "message": "Pieces initialized successfully",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.OK,
                )
            except Exception as e:
                log.info(
                    "Error initializing pieces for %s in game %s: %s",
                    input.pieces[0].player,
                    input.game_id,
                    e,
                )
                return JSONResponse(
                    content={"message": "Error initializing pieces"},
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )

        @router.get(
            "/pieces",
        )
        async def get_pieces(game_id: str) -> GetPiecesResponse:
            try:
                log.info("Getting pieces for game %s", game_id)
                response = await self.service.get_pieces(game_id=game_id)
                log.info("Pieces retrieved successfully for game %s", game_id)
                return response
            except RoomNotFoundError as e:
                log.exception("Room not found for game %s", game_id)
                return GetPiecesResponse(
                    status_code=httpx.codes.NOT_FOUND,
                    pieces=[],
                )
            except Exception as e:
                log.exception("Error getting pieces for game %s: %s", game_id, e)
                return GetPiecesResponse(
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                    pieces=[],
                )

        @router.post(
            "/pieces/move",
        )
        async def move_piece(input: MovePieceRequest) -> MovePieceResponse:
            try:
                log.info("Moving piece for game %s", input.game_id)
                return await self.service.move_piece(
                    game_id=input.game_id,
                    piece=input.piece,
                    new_position=input.new_position,
                )
            except RoomNotFoundError as e:
                log.exception("Room not found for game %s", input.game_id)
                return MovePieceResponse(
                    status_code=httpx.codes.NOT_FOUND,
                    captured_pieces=[],
                    winner=None,
                    pieces=[],
                    turn=-1,
                )
            except Exception as e:
                log.exception("Error moving piece for game %s: %s", input.game_id, e)
                return MovePieceResponse(
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                    captured_pieces=[],
                    winner=None,
                    pieces=[],
                    turn=-1,
                )
