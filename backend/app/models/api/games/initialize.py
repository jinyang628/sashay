from typing import Annotated, Union

from pydantic import BaseModel, Field

from app.models.game.engine import Dancer, Master

Piece = Annotated[Union[Dancer, Master], Field(discriminator="piece_type")]


class InitializeRequest(BaseModel):
    game_id: str
    pieces: list[Piece]
