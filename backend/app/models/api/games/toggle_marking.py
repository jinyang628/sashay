from typing import Annotated

from pydantic import BaseModel, Field
from typing_extensions import Union

from app.models.game.engine import Dancer, Marking, Master

Piece = Annotated[Union[Dancer, Master], Field(discriminator="piece_type")]


class ToggleMarkingRequest(BaseModel):
    game_id: str
    piece_id: str
    marking: Marking
