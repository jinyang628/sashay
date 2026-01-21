import uuid
from abc import abstractmethod
from collections import deque
from enum import StrEnum
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

from app.models.game.base import (
    COLS,
    ROWS,
    PieceLimits,
    Player,
    Position,
    get_player_side_rows,
    Marking,
)


class GameBoard:
    board: list[list[Optional["Piece"]]]

    def __init__(self, pieces: list["Piece"]):
        self.board = [[None for _ in range(COLS)] for _ in range(ROWS)]
        for piece in pieces:
            self.board[piece.position.row][piece.position.col] = piece

    def are_pieces_valid_during_setup(self, pieces: list["Piece"]) -> bool:
        dancer_count: int = 0
        master_count: int = 0
        spy_count: int = 0
        players_seen = set()
        for piece in pieces:
            players_seen.add(piece.player)
            if len(players_seen) > 1:
                return False
            if piece.is_surrounded(game_board=self):
                return False
            player_side_rows: list[int] = get_player_side_rows(player=piece.player)
            if piece.position.row not in player_side_rows:
                return False
            if piece.piece_type == PieceType.DANCER:
                if piece.is_spy:
                    spy_count += 1
                else:
                    dancer_count += 1
            elif piece.piece_type == PieceType.MASTER:
                master_count += 1
            else:
                raise TypeError(f"Invalid piece type: {piece.piece_type}")

        return (
            dancer_count == PieceLimits.DANCER.value
            and master_count == PieceLimits.MASTER.value
            and spy_count == PieceLimits.SPY.value
        )

    def remove_piece(self, piece: "Piece") -> None:
        self.board[piece.position.row][piece.position.col] = None

    def toggle_marking(self, piece: "Piece", marking: Marking) -> None:
        piece.marking = marking
        self.board[piece.position.row][piece.position.col] = piece

    def get_pieces(self) -> list["Piece"]:
        return [piece for row in self.board for piece in row if piece is not None]


class PieceType(StrEnum):
    DANCER = "dancer"
    MASTER = "master"


class Piece(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    piece_type: PieceType
    player: Player
    position: Position
    marking: Marking
    is_spy: bool

    def move(self, new_position: Position) -> None:
        self.position = new_position

    @abstractmethod
    def get_possible_new_positions(self, game_board: GameBoard) -> list[Position]:
        pass

    @abstractmethod
    def is_surrounded(self, game_board: GameBoard) -> bool:
        pass


class Dancer(Piece):
    piece_type: Literal[PieceType.DANCER] = PieceType.DANCER

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

    def is_surrounded(self, game_board: GameBoard) -> bool:
        """Dancer is surrounded if top, right, bottom, and left are blocked.
        A side is considered blocked if it's at the board edge or has any piece.
        """
        row, col = self.position.row, self.position.col

        top_blocked = (row - 1 < 0) or (game_board.board[row - 1][col] is not None)

        right_blocked = (col + 1 >= COLS) or (game_board.board[row][col + 1] is not None)

        bottom_blocked = (row + 1 >= ROWS) or (game_board.board[row + 1][col] is not None)

        left_blocked = (col - 1 < 0) or (game_board.board[row][col - 1] is not None)

        return top_blocked and right_blocked and bottom_blocked and left_blocked


class Master(Piece):
    piece_type: Literal[PieceType.MASTER] = PieceType.MASTER

    def get_possible_new_positions(self, game_board: GameBoard) -> list[Position]:
        """Master can move:
        - Orthogonally (top/down/left/right): exactly 1 space only
        - Diagonally: unlimited distance, but only on squares of the same checkerboard color
        """
        possible_moves = []
        row, col = self.position.row, self.position.col

        # Orthogonal moves: exactly 1 space (top, right, bottom, left)
        # Top
        if row - 1 >= 0 and game_board.board[row - 1][col] is None:
            possible_moves.append(Position(row=row - 1, col=col))

        # Right
        if col + 1 < COLS and game_board.board[row][col + 1] is None:
            possible_moves.append(Position(row=row, col=col + 1))

        # Bottom
        if row + 1 < ROWS and game_board.board[row + 1][col] is None:
            possible_moves.append(Position(row=row + 1, col=col))

        # Left
        if col - 1 >= 0 and game_board.board[row][col - 1] is None:
            possible_moves.append(Position(row=row, col=col - 1))

        # Diagonal moves: can move to any reachable square of the same checkerboard color
        # The Master can change diagonal direction, but must have a clear path
        visited = set[tuple[int, int]]()
        queue = deque[tuple[int, int]]([(row, col)])
        visited.add((row, col))
        diagonal_directions = [(-1, -1), (-1, 1), (1, 1), (1, -1)]

        while queue:
            current_row, current_col = queue.popleft()
            for dr, dc in diagonal_directions:
                new_row, new_col = current_row + dr, current_col + dc
                if new_row < 0 or new_row >= ROWS or new_col < 0 or new_col >= COLS:
                    continue

                if (new_row, new_col) in visited:
                    continue

                if game_board.board[new_row][new_col] is None:
                    visited.add((new_row, new_col))
                    queue.append((new_row, new_col))
                    possible_moves.append(Position(row=new_row, col=new_col))

        return possible_moves

    def is_surrounded(self, game_board: GameBoard) -> bool:
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

        right_blocked = (col + 1 >= COLS) or (game_board.board[row][col + 1] is not None)

        bottom_right_blocked = (row + 1 >= ROWS or col + 1 >= COLS) or (
            game_board.board[row + 1][col + 1] is not None
        )

        bottom_blocked = (row + 1 >= ROWS) or (game_board.board[row + 1][col] is not None)

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


def parse_piece(piece_data: dict[str, Any]) -> Piece:
    """Parse a piece dict into either a Dancer or Master instance."""
    if not isinstance(piece_data, dict):
        raise ValueError(f"Expected dict, got {type(piece_data)}")
    piece_type = piece_data.get("piece_type")
    if piece_type == PieceType.DANCER:
        return Dancer.model_validate(piece_data)
    elif piece_type == PieceType.MASTER:
        return Master.model_validate(piece_data)
    else:
        raise ValueError(f"Unknown piece type: {piece_type}")


class VictoryType(StrEnum):
    ALLY_SPY_INFILTRATED = "ally_spy_infiltrated"
    ENEMY_SPY_CAPTURED = "enemy_spy_captured"


class VictoryState(BaseModel):
    player: Player
    victory_type: VictoryType


class Movement(BaseModel):
    previous_position: Position
    new_position: Position


class GameEngine:
    def __init__(self, pieces: list[Piece]):
        self.game_board = GameBoard(pieces=pieces)

    def get_possible_new_positions(self, piece: Piece) -> list[Position]:
        return piece.get_possible_new_positions(game_board=self.game_board)

    def move_piece(self, piece: Piece, new_position: Position) -> None:
        original_position = piece.position
        possible_new_positions: list[Position] = self.get_possible_new_positions(piece=piece)
        if not any(
            pos.row == new_position.row and pos.col == new_position.col
            for pos in possible_new_positions
        ):
            raise ValueError(f"Invalid new position: {new_position}")
        piece.move(new_position=new_position)
        self.game_board.board[original_position.row][original_position.col] = None
        self.game_board.board[new_position.row][new_position.col] = piece

    def toggle_marking(self, piece: Piece, marking: Marking) -> None:
        self.game_board.toggle_marking(piece=piece, marking=marking)

    def process_potential_capture(self, new_position: Position) -> list[Piece]:
        captured_pieces: list[Piece] = []
        captured_piece_ids = set()
        for i in range(new_position.row - 1, new_position.row + 2):
            for j in range(new_position.col - 1, new_position.col + 2):
                if i < 0 or i >= ROWS or j < 0 or j >= COLS:
                    continue
                neighbor_piece = self.game_board.board[i][j]
                if neighbor_piece is None:
                    continue
                if not isinstance(neighbor_piece, Piece):
                    raise TypeError(f"Expected Piece, got {type(neighbor_piece)}")
                if neighbor_piece.is_surrounded(game_board=self.game_board):
                    captured_pieces.append(neighbor_piece)
                    captured_piece_ids.add(neighbor_piece.id)
        for piece in self.game_board.get_pieces():
            if piece.id in captured_piece_ids:
                self.game_board.remove_piece(piece=piece)
        return captured_pieces

    def process_initialization_capture(self) -> list[Piece]:
        captured_pieces: list[Piece] = []
        captured_piece_ids = set()
        curr_pieces: list[Piece] = self.game_board.get_pieces()
        for piece in curr_pieces:
            if piece.is_surrounded(game_board=self.game_board):
                captured_pieces.append(piece)
                captured_piece_ids.add(piece.id)
        for piece in curr_pieces:
            if piece.id in captured_piece_ids:
                self.game_board.remove_piece(piece=piece)
        return captured_pieces

    def process_potential_win(self) -> Optional[VictoryState]:
        """
        Determine if either player has won the game.

        - Player 2 wins if they have a spy Dancer on the top row (index 0).
        - Player 1 wins if they have a spy Dancer on the bottom row (index ROWS - 1).
        - If a player's spy is no longer on the board, that player loses and the opponent wins.
        - Returns None if there is currently no winner.
        """
        pieces_on_board = self.game_board.get_pieces()
        player_one_has_spy = any(
            isinstance(piece, Dancer) and piece.is_spy and piece.player == Player.PLAYER_ONE
            for piece in pieces_on_board
        )
        player_two_has_spy = any(
            isinstance(piece, Dancer) and piece.is_spy and piece.player == Player.PLAYER_TWO
            for piece in pieces_on_board
        )

        if not player_one_has_spy:
            return VictoryState(
                player=Player.PLAYER_TWO, victory_type=VictoryType.ENEMY_SPY_CAPTURED
            )
        if not player_two_has_spy:
            return VictoryState(
                player=Player.PLAYER_ONE, victory_type=VictoryType.ENEMY_SPY_CAPTURED
            )

        top_row_index = 0
        for col in range(COLS):
            piece = self.game_board.board[top_row_index][col]
            if isinstance(piece, Dancer) and piece.is_spy and piece.player == Player.PLAYER_TWO:
                return VictoryState(
                    player=Player.PLAYER_TWO,
                    victory_type=VictoryType.ALLY_SPY_INFILTRATED,
                )

        bottom_row_index = ROWS - 1
        for col in range(COLS):
            piece = self.game_board.board[bottom_row_index][col]
            if isinstance(piece, Dancer) and piece.is_spy and piece.player == Player.PLAYER_ONE:
                return VictoryState(
                    player=Player.PLAYER_ONE,
                    victory_type=VictoryType.ALLY_SPY_INFILTRATED,
                )

        return None
