export const ROWS = 8;
export const COLS = 6;

export enum Player {
  PLAYER_ONE = 'player_one',
  PLAYER_TWO = 'player_two',
}

export enum PieceType {
  DANCER = 'dancer',
  MASTER = 'master',
}

export interface Position {
  row: number;
  col: number;
}

export const PIECE_LIMITS = {
  DANCER: 7,
  MASTER: 2,
  SPY: 1,
};

export enum PlacementMode {
  DANCER = 'DANCER',
  MASTER = 'MASTER',
  SPY = 'SPY',
}
