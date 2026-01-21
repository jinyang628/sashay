import { z } from 'zod';

import { Movement } from '@/types/game';

import { GameEngine, Piece as PieceClass } from './engine';

export const ROWS = 8;
export const COLS = 6;

export const playerEnum = z.enum(['player_one', 'player_two']);

export type Player = z.infer<typeof playerEnum>;

export const getPlayerSideRows = (player: Player) => {
  return player === playerEnum.enum.player_one ? [0, 1, 2, 3] : [4, 5, 6, 7];
};

export const pieceTypeEnum = z.enum(['dancer', 'master']);

export type PieceType = z.infer<typeof pieceTypeEnum>;

export const victoryTypeEnum = z.enum(['ally_spy_infiltrated', 'enemy_spy_captured']);

export type VictoryType = z.infer<typeof victoryTypeEnum>;

export const victoryStateSchema = z.object({
  player: playerEnum,
  victory_type: victoryTypeEnum,
});

export type VictoryState = z.infer<typeof victoryStateSchema>;

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

export type GameState = {
  allyPieces: PieceClass[];
  enemyPieces: PieceClass[];
  capturedPieces: PieceClass[];
  gameEngine: GameEngine | null;
  movement: Movement | null;
  victoryState: VictoryState | null;
};
