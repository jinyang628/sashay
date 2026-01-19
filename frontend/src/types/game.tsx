import { z } from 'zod';

import { pieceSchema, positionSchema, victoryStateSchema } from '@/lib/game/base';

export const initializePiecesRequestSchema = z.object({
  game_id: z.string(),
  pieces: z.array(pieceSchema),
});

export type InitializePiecesRequest = z.infer<typeof initializePiecesRequestSchema>;

export const movementSchema = z.object({
  previous_position: positionSchema,
  new_position: positionSchema,
});

export type Movement = z.infer<typeof movementSchema>;

export const getGameStateRequestSchema = z.object({
  game_id: z.string(),
});

export type GetGameStateRequest = z.infer<typeof getGameStateRequestSchema>;

export const getGameStateResponseSchema = z.object({
  pieces: z.array(pieceSchema),
  captured_pieces: z.array(pieceSchema),
  movement: movementSchema.nullable(),
  victory_state: victoryStateSchema.nullable(),
});

export type GetGameStateResponse = z.infer<typeof getGameStateResponseSchema>;

export const movePieceRequestSchema = z.object({
  game_id: z.string(),
  piece: pieceSchema,
  new_position: positionSchema,
});

export type MovePieceRequest = z.infer<typeof movePieceRequestSchema>;

export const movePieceResponseSchema = z.object({
  status_code: z.number(),
  captured_pieces: z.array(pieceSchema),
  victory_state: victoryStateSchema.nullable(),
  pieces: z.array(pieceSchema),
  movement: movementSchema.nullable(),
  turn: z.number(),
});

export type MovePieceResponse = z.infer<typeof movePieceResponseSchema>;
