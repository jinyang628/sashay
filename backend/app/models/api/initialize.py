from pydantic import BaseModel

from app.models.game.base import Player
from app.models.game.engine import Piece


class InitializeRequest(BaseModel):
    player: Player
    pieces: list[Piece]
    game_id: str
