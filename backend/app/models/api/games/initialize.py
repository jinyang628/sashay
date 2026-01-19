from typing import Annotated, Union

from pydantic import BaseModel, Field

from app.models.game.engine import Dancer, Master

Piece = Annotated[Union[Dancer, Master], Field(discriminator="piece_type")]


class InitializeRequest(BaseModel):
    game_id: str
    pieces: list[Piece]


class InitializeCaptureRequest(BaseModel):
    game_id: str


class InitializeCaptureResponse(BaseModel):
    status_code: int
    pieces: list
    captured_pieces: list
