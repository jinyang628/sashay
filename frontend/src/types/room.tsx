import { z } from 'zod';

export const createRoomRequestSchema = z.object({
  game_id: z.string(),
});

export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;

export const joinRoomRequestSchema = z.object({
  game_id: z.string(),
});

export type JoinRoomRequest = z.infer<typeof joinRoomRequestSchema>;

export const joinRoomResponseSchema = z.object({
  is_successful: z.boolean(),
  message: z.string(),
});

export type JoinRoomResponse = z.infer<typeof joinRoomResponseSchema>;
