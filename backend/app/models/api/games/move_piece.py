from typing import Annotated, Optional

from pydantic import BaseModel, Field
from typing_extensions import Union

from app.models.game.base import Player, Position
from app.models.game.engine import Dancer, Master

Piece = Annotated[Union[Dancer, Master], Field(discriminator="piece_type")]


class MovePieceRequest(BaseModel):
    game_id: str
    piece: Piece
    new_position: Position


class MovePieceResponse(BaseModel):
    status_code: int
    captured_pieces: list[Piece]
    winner: Optional[Player]
    pieces: list[Piece]
    turn: int
