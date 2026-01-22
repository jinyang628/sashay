import { COLS, PieceType, Player, Position, ROWS, pieceTypeEnum, playerEnum } from './base';

export enum Marking {
  NONE = 'NONE',
  SPY = 'SPY',
  DANCER = 'DANCER',
}

export class GameBoard {
  public board: (Piece | null)[][];

  constructor(pieces: Piece[]) {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (const piece of pieces) {
      this.board[piece.position.row][piece.position.col] = piece;
    }
  }

  removePiece(piece: Piece): void {
    this.board[piece.position.row][piece.position.col] = null;
  }
}

export abstract class Piece {
  public abstract pieceType: PieceType;

  constructor(
    public id: string,
    public player: Player,
    public position: Position,
    public marking: Marking,
    public isSpy: boolean,
  ) {}

  move(newPosition: Position): void {
    this.position = newPosition;
  }

  abstract getPossibleNewPositions(gameBoard: GameBoard): Position[];
  abstract isPieceSurrounded(gameBoard: GameBoard): boolean;
}

export class Dancer extends Piece {
  pieceType = pieceTypeEnum.enum.dancer;

  getPossibleNewPositions(gameBoard: GameBoard): Position[] {
    const possibleMoves: Position[] = [];
    const { row, col } = this.position;

    // Move Down
    for (let i = row + 1; i < ROWS; i++) {
      if (gameBoard.board[i][col] !== null) break;
      possibleMoves.push({ row: i, col });
    }
    // Move Up
    for (let i = row - 1; i >= 0; i--) {
      if (gameBoard.board[i][col] !== null) break;
      possibleMoves.push({ row: i, col });
    }
    // Move Right
    for (let i = col + 1; i < COLS; i++) {
      if (gameBoard.board[row][i] !== null) break;
      possibleMoves.push({ row, col: i });
    }
    // Move Left
    for (let i = col - 1; i >= 0; i--) {
      if (gameBoard.board[row][i] !== null) break;
      possibleMoves.push({ row, col: i });
    }

    return possibleMoves;
  }

  isPieceSurrounded(gameBoard: GameBoard): boolean {
    const { row, col } = this.position;

    const isBlocked = (r: number, c: number) => {
      return r < 0 || r >= ROWS || c < 0 || c >= COLS || gameBoard.board[r][c] !== null;
    };

    return (
      isBlocked(row - 1, col) && // top
      isBlocked(row + 1, col) && // bottom
      isBlocked(row, col + 1) && // right
      isBlocked(row, col - 1) // left
    );
  }
}

export class Master extends Piece {
  pieceType = pieceTypeEnum.enum.master;

  getPossibleNewPositions(gameBoard: GameBoard): Position[] {
    const possibleMoves: Position[] = [];
    const { row, col } = this.position;

    // Orthogonal moves (exactly 1 space)
    const orthogonal = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const [dr, dc] of orthogonal) {
      const r = row + dr,
        c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && gameBoard.board[r][c] === null) {
        possibleMoves.push({ row: r, col: c });
      }
    }

    // Diagonal moves (Unlimited distance via BFS logic)
    const visited = new Set<string>();
    const queue: [number, number][] = [[row, col]];
    visited.add(`${row},${col}`);

    const diagonals = [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ];

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      for (const [dr, dc] of diagonals) {
        const nextR = currR + dr,
          nextC = currC + dc;

        if (nextR >= 0 && nextR < ROWS && nextC >= 0 && nextC < COLS) {
          const key = `${nextR},${nextC}`;
          if (!visited.has(key) && gameBoard.board[nextR][nextC] === null) {
            visited.add(key);
            queue.push([nextR, nextC]);
            possibleMoves.push({ row: nextR, col: nextC });
          }
        }
      }
    }

    return possibleMoves;
  }

  isPieceSurrounded(gameBoard: GameBoard): boolean {
    const { row, col } = this.position;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr,
          c = col + dc;
        const isOutOfBounds = r < 0 || r >= ROWS || c < 0 || c >= COLS;
        if (!isOutOfBounds && gameBoard.board[r][c] === null) {
          return false; // Found an empty adjacent square
        }
      }
    }
    return true;
  }
}

export class GameEngine {
  public gameBoard: GameBoard;

  constructor(
    public player: Player,
    public turn: number,
    public pieces: Piece[],
  ) {
    this.player = player;
    this.turn = turn;
    this.gameBoard = new GameBoard(pieces);
  }

  isPlayerTurn(): boolean {
    if (this.player === playerEnum.enum.player_one) {
      return this.turn % 2 === 0;
    } else {
      return this.turn % 2 === 1;
    }
  }

  getPossibleNewPositions(piece: Piece): Position[] {
    return piece.getPossibleNewPositions(this.gameBoard);
  }
}
