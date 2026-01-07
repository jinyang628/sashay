import logging

import httpx
from fastapi import APIRouter
from starlette.responses import JSONResponse

from app.models.api.rooms.create import CreateRoomRequest
from app.services.rooms import RoomsService

log = logging.getLogger(__name__)


class RoomsController:
    def __init__(self, service: RoomsService):
        self.router = APIRouter()
        self.service = service
        self.setup_routes()

    def setup_routes(self):
        router = self.router

        @router.post(
            "/create",
        )
        async def create(input: CreateRoomRequest) -> JSONResponse:
            try:
                log.info("Creating room for game %s", input.game_id)
                # await self.service.create_room(
                #      game_id=input.game_id
                # )
                return JSONResponse(
                    content={
                        "message": "Room created successfully",
                        "game_id": input.game_id,
                    },
                    status_code=httpx.codes.OK,
                )
            except Exception as e:
                log.exception("Error creating room for game %s: %s", input.game_id, e)
                return JSONResponse(
                    content={"message": "Error creating room"},
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                )
