import logging

import httpx
from fastapi import APIRouter
from starlette.responses import JSONResponse

from app.models.api.initialize import InitializeRequest
from app.services.games import GamesService

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
        async def chat(input: InitializeRequest) -> JSONResponse:
            try:
                log.info("Initializing pieces for player %s", input.player)
                # await self.service.initialize(
                #     player=input.player, pieces=input.pieces, game_id=input.game_id
                # )
                return JSONResponse(
                    content={
                        "message": "Pieces initialized successfully",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.OK,
                )
            except Exception as e:
                log.exception(
                    "Error initializing pieces for player %s: %s", input.player, e
                )
                return JSONResponse(
                    content={"message": "Error initializing pieces"},
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )
