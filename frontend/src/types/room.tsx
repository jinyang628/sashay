import { z } from 'zod';

export const createRoomRequestSchema = z.object({
  gameId: z.string(),
});

export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;
