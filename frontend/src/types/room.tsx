import { z } from 'zod';

export const getPlayerNumberRequestSchema = z.object({
  game_id: z.string(),
  user_id: z.string(),
});

export type GetPlayerNumberRequest = z.infer<typeof getPlayerNumberRequestSchema>;

export const getPlayerNumberResponseSchema = z.object({
  is_player_one: z.boolean(),
});

export type GetPlayerNumberResponse = z.infer<typeof getPlayerNumberResponseSchema>;

export const createRoomRequestSchema = z.object({
  game_id: z.string(),
  player_one_id: z.string().nullable(),
  player_two_id: z.string().nullable(),
});

export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;

export const joinRoomRequestSchema = z.object({
  game_id: z.string(),
  player_id: z.string(),
});

export type JoinRoomRequest = z.infer<typeof joinRoomRequestSchema>;

export const joinRoomResponseSchema = z.object({
  status_code: z.number(),
  message: z.string(),
  is_player_one: z.boolean().nullable(),
});

export type JoinRoomResponse = z.infer<typeof joinRoomResponseSchema>;

export const roomStatusEnum = z.enum(['waiting', 'planning', 'active', 'finished']);

export type RoomStatus = z.infer<typeof roomStatusEnum>;
