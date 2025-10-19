
from pydantic import BaseModel, Field


class Position(BaseModel, frozen=True):
    row: int = Field(ge=0, le=7)
    col: int = Field(ge=0, le=5)
