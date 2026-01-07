import { z } from 'zod';

export const createRoomRequestSchema = z.object({
  game_id: z.string(),
  player_one_id: z.string().nullable(),
  player_two_id: z.string().nullable(),
});

export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;

export const joinRoomRequestSchema = z.object({
  game_id: z.string(),
});

export type JoinRoomRequest = z.infer<typeof joinRoomRequestSchema>;

export const joinRoomResponseSchema = z.object({
  status_code: z.number(),
  message: z.string(),
});

export type JoinRoomResponse = z.infer<typeof joinRoomResponseSchema>;
