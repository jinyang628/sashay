
from pydantic import BaseModel

from app.models.game.base import Position
from app.models.game.piece import Piece


class Board(BaseModel):
    occupied_positions: dict[Position, Piece]
    rows: int = 8
    cols: int = 6
