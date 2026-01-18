import { z } from 'zod';

import { pieceSchema, playerEnum, positionSchema } from '@/lib/game/base';

export const initializePiecesRequestSchema = z.object({
  game_id: z.string(),
  pieces: z.array(pieceSchema),
});

export type InitializePiecesRequest = z.infer<typeof initializePiecesRequestSchema>;

export const getPiecesRequestSchema = z.object({
  game_id: z.string(),
});

export type GetPiecesRequest = z.infer<typeof getPiecesRequestSchema>;

export const getPiecesResponseSchema = z.object({
  pieces: z.array(pieceSchema),
});

export type GetPiecesResponse = z.infer<typeof getPiecesResponseSchema>;

export const movePieceRequestSchema = z.object({
  game_id: z.string(),
  piece: pieceSchema,
  new_position: positionSchema,
});

export type MovePieceRequest = z.infer<typeof movePieceRequestSchema>;

export const movePieceResponseSchema = z.object({
  status_code: z.number(),
  captured_pieces: z.array(pieceSchema),
  winner: playerEnum.nullable(),
  pieces: z.array(pieceSchema),
  turn: z.number(),
});

export type MovePieceResponse = z.infer<typeof movePieceResponseSchema>;
