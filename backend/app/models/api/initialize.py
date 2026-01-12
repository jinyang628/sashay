from pydantic import BaseModel

from app.models.game.engine import Dancer, Master


class InitializeRequest(BaseModel):
    game_id: str
    pieces: list[Dancer | Master]
