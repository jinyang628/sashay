from app.models.game.base import COLS, ROWS, Position
from app.models.game.board import GameBoard
from app.models.game.piece import Piece


class GameEngine:
    def __init__(self, pieces: list[Piece]):
        self.game_board = GameBoard(pieces=pieces)
        self.pieces = pieces

    def get_possible_new_positions(self, piece: Piece) -> list[Position]:
        return piece.get_possible_new_positions(game_board=self.game_board)

    def move_piece(self, piece: Piece, new_position: Position) -> None:
        original_position = piece.position
        piece.move(new_position=new_position)
        self.game_board.board[original_position.row][original_position.col] = None
        self.game_board.board[new_position.row][new_position.col] = piece

    def process_potential_capture(
        self, piece: Piece, new_position: Position
    ) -> list[Piece]:
        captured_pieces = []
        for i in range(new_position.row - 1, new_position.row + 2):
            for j in range(new_position.col - 1, new_position.col + 2):
                if i < 0 or i >= ROWS or j < 0 or j >= COLS:
                    continue
                neighbor_piece = self.game_board.board[i][j]
                if neighbor_piece is None:
                    continue
                if not isinstance(neighbor_piece, Piece):
                    raise TypeError(f"Expected Piece, got {type(neighbor_piece)}")
                if (
                    neighbor_piece.player != piece.player
                    and neighbor_piece.is_piece_surrounded(game_board=self.game_board)
                ):
                    self.game_board.remove_piece(piece=neighbor_piece)
                    captured_pieces.append(neighbor_piece)
        return captured_pieces
