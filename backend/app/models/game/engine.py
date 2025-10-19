from app.models.game.base import Position
from app.models.game.board import Board
from app.models.game.piece import Dancer, Master, Piece, PieceType


class GameEngine:
    def __init__(self, board: Board, pieces: list[Piece]):
        self.board = board
        self.pieces = pieces
        for piece in pieces:
            self.board.occupied_positions[piece.position] = piece

    def get_possible_moves(self, piece: Piece) -> list[Position]:
        match piece.piece_type:
            case PieceType.DANCER:
                if isinstance(piece, Dancer):
                    return self._get_dancer_moves(piece=piece)
                raise ValueError(f"Piece type mismatch: {piece.piece_type}")
            case PieceType.MASTER:
                if isinstance(piece, Master):
                    return self._get_master_moves(piece=piece)
                raise ValueError(f"Piece type mismatch: {piece.piece_type}")
            case _:
                raise ValueError(f"Invalid piece type: {piece.piece_type}")

    def _get_dancer_moves(self, piece: Dancer) -> list[Position]:
        possible_moves = []
        for i in range(self.board.rows):
            if (
                Position(row=i, col=piece.position.col)
                not in self.board.occupied_positions
            ):
                possible_moves.append(Position(row=i, col=piece.position.col))

        for i in range(self.board.cols):
            if (
                Position(row=piece.position.row, col=i)
                not in self.board.occupied_positions
            ):
                possible_moves.append(Position(row=piece.position.row, col=i))

        return possible_moves

    def _get_master_moves(self, piece: Master) -> list[Position]:
        return []

    def move_piece(self, piece: Piece, position: Position) -> None:
        original_position = piece.position
        piece.move(new_position=position)
        del self.board.occupied_positions[original_position]
        self.board.occupied_positions[position] = piece
