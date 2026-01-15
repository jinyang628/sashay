import { z } from 'zod';

import { pieceSchema } from '@/lib/game/base';

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
