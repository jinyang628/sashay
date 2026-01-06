import uuid
from abc import ABC, abstractmethod
from enum import StrEnum

from pydantic import BaseModel, Field

from app.models.game.base import COLS, ROWS, Player, Position
from app.models.game.board import GameBoard


class PieceType(StrEnum):
    DANCER = "dancer"
    MASTER = "master"


class Piece(BaseModel, ABC):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    piece_type: PieceType
    player: Player
    position: Position

    def move(self, new_position: Position) -> None:
        self.position = new_position

    @abstractmethod
    def get_possible_new_positions(self, game_board: GameBoard) -> list[Position]:
        pass

    @abstractmethod
    def is_piece_surrounded(self, game_board: GameBoard) -> bool:
        pass


class Dancer(Piece):
    name: PieceType = PieceType.DANCER

    def get_possible_new_positions(self, game_board: GameBoard) -> list[Position]:
        possible_moves = []
        # Move down
        for i in range(self.position.row + 1, ROWS):
            if game_board.board[i][self.position.col] is not None:
                break
            possible_moves.append(Position(row=i, col=self.position.col))

        # Move up
        for i in range(self.position.row - 1, -1, -1):
            if game_board.board[i][self.position.col] is not None:
                break
            possible_moves.append(Position(row=i, col=self.position.col))

        # Move right
        for i in range(self.position.col + 1, COLS):
            if game_board.board[self.position.row][i] is not None:
                break
            possible_moves.append(Position(row=self.position.row, col=i))

        # Move left
        for i in range(self.position.col - 1, -1, -1):
            if game_board.board[self.position.row][i] is not None:
                break
            possible_moves.append(Position(row=self.position.row, col=i))

        return possible_moves

    def is_piece_surrounded(self, game_board: GameBoard) -> bool:
        """Dancer is surrounded if top, right, bottom, and left are blocked.
        A side is considered blocked if it's at the board edge or has any piece.
        """
        row, col = self.position.row, self.position.col

        top_blocked = (row - 1 < 0) or (game_board.board[row - 1][col] is not None)

        right_blocked = (col + 1 >= COLS) or (
            game_board.board[row][col + 1] is not None
        )

        bottom_blocked = (row + 1 >= ROWS) or (
            game_board.board[row + 1][col] is not None
        )

        left_blocked = (col - 1 < 0) or (game_board.board[row][col - 1] is not None)

        return top_blocked and right_blocked and bottom_blocked and left_blocked


class Master(Piece):
    name: PieceType = PieceType.MASTER

    def get_possible_new_positions(self, game_board: GameBoard) -> list[Position]:
        """Master movement rules - TODO: Implement"""
        return []

    def is_piece_surrounded(self, game_board: GameBoard) -> bool:
        """Master is surrounded if all 8 adjacent positions (including diagonals) are blocked.
        A position is considered blocked if it's at the board edge or has any piece.
        """
        row, col = self.position.row, self.position.col

        top_left_blocked = (row - 1 < 0 or col - 1 < 0) or (
            game_board.board[row - 1][col - 1] is not None
        )

        top_blocked = (row - 1 < 0) or (game_board.board[row - 1][col] is not None)

        top_right_blocked = (row - 1 < 0 or col + 1 >= COLS) or (
            game_board.board[row - 1][col + 1] is not None
        )

        right_blocked = (col + 1 >= COLS) or (
            game_board.board[row][col + 1] is not None
        )

        bottom_right_blocked = (row + 1 >= ROWS or col + 1 >= COLS) or (
            game_board.board[row + 1][col + 1] is not None
        )

        bottom_blocked = (row + 1 >= ROWS) or (
            game_board.board[row + 1][col] is not None
        )

        bottom_left_blocked = (row + 1 >= ROWS or col - 1 < 0) or (
            game_board.board[row + 1][col - 1] is not None
        )

        left_blocked = (col - 1 < 0) or (game_board.board[row][col - 1] is not None)

        return (
            top_left_blocked
            and top_blocked
            and top_right_blocked
            and right_blocked
            and bottom_right_blocked
            and bottom_blocked
            and bottom_left_blocked
            and left_blocked
        )
