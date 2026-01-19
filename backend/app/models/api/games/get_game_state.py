from typing import Optional

from pydantic import BaseModel

from app.models.game.base import Player
from app.models.game.engine import Movement, VictoryState, VictoryType


class GameState(BaseModel):
    pieces: list
    captured_pieces: list
    winner: Optional[Player]
    victory_type: Optional[VictoryType]
    movement: Optional[Movement]
    turn: int


class GetGameStateResponse(BaseModel):
    status_code: int
    pieces: list
    captured_pieces: list
    victory_state: Optional[VictoryState]
    movement: Optional[Movement]
    turn: int
