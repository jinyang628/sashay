import uuid
from abc import ABC
from enum import StrEnum

from pydantic import BaseModel, Field

from app.models.game.base import Position


class PieceType(StrEnum):
    DANCER = "dancer"
    MASTER = "master"


class Piece(BaseModel, ABC):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    piece_type: PieceType
    position: Position

    def move(self, new_position: Position) -> None:
        self.position = new_position


class Dancer(Piece):
    name: PieceType = PieceType.DANCER


class Master(Piece):
    name: PieceType = PieceType.MASTER
