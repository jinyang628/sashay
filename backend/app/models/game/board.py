from typing import Optional

from app.models.game.base import COLS, ROWS
from app.models.game.piece import Piece


class GameBoard:
    board: list[list[Optional[Piece]]]

    def __init__(self, pieces: list[Piece]):
        self.board = [[None for _ in range(COLS)] for _ in range(ROWS)]
        for piece in pieces:
            self.board[piece.position.row][piece.position.col] = piece

    def remove_piece(self, piece: Piece) -> None:
        self.board[piece.position.row][piece.position.col] = None
