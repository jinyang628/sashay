from enum import Enum, StrEnum

from pydantic import BaseModel, Field

ROWS = 8
COLS = 6


class Position(BaseModel, frozen=True):
    row: int = Field(ge=0, le=ROWS - 1)
    col: int = Field(ge=0, le=COLS - 1)


class Player(StrEnum):
    PLAYER_ONE = "player_one"
    PLAYER_TWO = "player_two"


def get_player_side_rows(player: Player) -> list[int]:
    if player == Player.PLAYER_ONE:
        return [0, 1, 2, 3]
    elif player == Player.PLAYER_TWO:
        return [4, 5, 6, 7]
    else:
        raise ValueError(f"Invalid player: {player}")


class PieceLimits(Enum):
    DANCER = 7
    MASTER = 2
    SPY = 1
