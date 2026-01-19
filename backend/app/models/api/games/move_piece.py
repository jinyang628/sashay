from typing import Annotated, Optional

from pydantic import BaseModel, Field
from typing_extensions import Union

from app.models.game.base import Position
from app.models.game.engine import Dancer, Master, VictoryState

Piece = Annotated[Union[Dancer, Master], Field(discriminator="piece_type")]


class MovePieceRequest(BaseModel):
    game_id: str
    piece: Piece
    new_position: Position


class MovePieceResponse(BaseModel):
    status_code: int
    captured_pieces: list[Piece]
    victory_state: Optional[VictoryState]
    pieces: list[Piece]
    turn: int
