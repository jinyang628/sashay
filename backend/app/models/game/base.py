from enum import StrEnum

from pydantic import BaseModel, Field

ROWS = 8
COLS = 6


class Position(BaseModel, frozen=True):
    row: int = Field(ge=0, le=ROWS - 1)
    col: int = Field(ge=0, le=COLS - 1)


class Player(StrEnum):
    A = "A"
    B = "B"
