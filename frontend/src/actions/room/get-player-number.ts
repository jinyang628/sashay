'use server';

import axios from 'axios';

import { GetPlayerNumberResponse, getPlayerNumberRequestSchema } from '@/types/room';

export async function getPlayerNumber(
  game_id: string,
  user_id: string,
): Promise<GetPlayerNumberResponse> {
  try {
    const request = getPlayerNumberRequestSchema.parse({
      game_id: game_id,
      user_id: user_id,
    });
    console.log('Getting player number:', request);

    const response = await axios.get<GetPlayerNumberResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/rooms/player-number`,
      {
        params: request,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error getting player number:', error);
    throw error;
  }
}
