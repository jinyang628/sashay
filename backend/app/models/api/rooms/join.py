from pydantic import BaseModel


class JoinRoomRequest(BaseModel):
    game_id: str


class JoinRoomResponse(BaseModel):
    status_code: int
    message: str
