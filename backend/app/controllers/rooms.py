import logging

import httpx
from fastapi import APIRouter
from starlette.responses import JSONResponse

from app.models.api.rooms.create import CreateRoomRequest
from app.models.api.rooms.join import JoinRoomRequest, JoinRoomResponse
from app.services.rooms import RoomsService
from app.utils.errors import RoomNotFoundError

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
                await self.service.create_room(game_id=input.game_id)
                log.info("Room created successfully for game %s", input.game_id)
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

        @router.post(
            "/join",
            response_model=JoinRoomResponse,
        )
        async def join(input: JoinRoomRequest) -> JoinRoomResponse:
            try:
                log.info("Joining room for game %s", input.game_id)
                # await self.service.join_room(
                #      game_id=input.game_id
                # )
                log.info("Room joined successfully for game %s", input.game_id)
                return JoinRoomResponse(
                    status_code=httpx.codes.OK,
                    message="Room joined successfully",
                )
            except RoomNotFoundError as e:
                message: str = f"Room not found: {input.game_id}"
                log.exception(message)
                return JoinRoomResponse(
                    status_code=httpx.codes.NOT_FOUND,
                    message=message,
                )
            except Exception as e:
                log.exception(
                    "Unexpected error occurred while trying to join room %s: %s",
                    input.game_id,
                    e,
                )
                return JoinRoomResponse(
                    status_code=httpx.codes.INTERNAL_SERVER_ERROR,
                    message="Unexpected error occurred while trying to join room. Please try again later.",
                )
