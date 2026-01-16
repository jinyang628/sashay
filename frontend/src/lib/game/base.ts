import { z } from 'zod';

export const ROWS = 8;
export const COLS = 6;

export const playerEnum = z.enum(['player_one', 'player_two']);

export type Player = z.infer<typeof playerEnum>;

export const getPlayerSideRows = (player: Player) => {
  return player === playerEnum.enum.player_one ? [0, 1, 2, 3] : [4, 5, 6, 7];
};

export const pieceTypeEnum = z.enum(['dancer', 'master']);

export type PieceType = z.infer<typeof pieceTypeEnum>;

export const positionSchema = z.object({
  row: z.number(),
  col: z.number(),
});

export type Position = z.infer<typeof positionSchema>;

export const pieceSchema = z.object({
  id: z.string(),
  player: playerEnum,
  piece_type: pieceTypeEnum,
  position: positionSchema,
  is_spy: z.boolean(),
});

export type Piece = z.infer<typeof pieceSchema>;

export const PIECE_LIMITS = {
  DANCER: 7,
  MASTER: 2,
  SPY: 1,
};

export enum PlanningPhasePlacementMode {
  DANCER = 'DANCER',
  MASTER = 'MASTER',
  SPY = 'SPY',
}

export type SelectedPieceState = {
  piece: PieceClass | null;
  possiblePositions: Position[];
};
