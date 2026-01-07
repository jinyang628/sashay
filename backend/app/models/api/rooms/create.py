from pydantic import BaseModel


class CreateRoomRequest(BaseModel):
    game_id: str
