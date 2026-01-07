import { z } from 'zod';

export const createRoomRequestSchema = z.object({
  game_id: z.string(),
});

export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;
