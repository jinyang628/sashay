'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { GetGameStateResponse, getGameStateRequestSchema } from '@/types/game';

export async function getGameState(game_id: string): Promise<GetGameStateResponse> {
  try {
    const request = getGameStateRequestSchema.parse({
      game_id: game_id,
    });
    console.log('Getting pieces:', request);

    const response = await axios.get<GetGameStateResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/pieces`,
      {
        params: request,
      },
    );
    if (response.status === StatusCodes.OK) {
      return response.data;
    } else {
      throw new Error('Failed to get pieces', { cause: response.data });
    }
  } catch (error) {
    console.error('Error getting pieces:', error);
    throw error;
  }
}
