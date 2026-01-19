from typing import Optional

from pydantic import BaseModel

from app.models.game.base import Player


class GameState(BaseModel):
    pieces: list
    captured_pieces: list
    winner: Optional[Player]
    turn: int


class GetGameStateResponse(GameState):
    status_code: int
