from pydantic import BaseModel


class CreateRoomRequest(BaseModel):
    game_id: str
    player_one_id: str | None = None
    player_two_id: str | None = None
