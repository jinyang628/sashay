'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { createRoomRequestSchema } from '@/types/room';

import { Player } from '@/lib/game/base';

export async function createRoom(
  game_id: string,
  userId: string,
  hostPlayer: Player,
): Promise<void> {
  try {
    const request = createRoomRequestSchema.parse({
      game_id: game_id,
      player_one_id: hostPlayer === Player.PLAYER_ONE ? userId : null,
      player_two_id: hostPlayer === Player.PLAYER_TWO ? userId : null,
    });
    console.log('Creating room:', request);

    const response = await axios.post(
      `${process.env.SERVER_BASE_URL}/api/v1/rooms/create`,
      request,
    );
    if (response.status === StatusCodes.OK) {
      console.log('Room created successfully');
      return;
    } else {
      throw new Error('Failed to create room', { cause: response.data });
    }
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}
