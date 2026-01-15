'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { GetPiecesResponse, getPiecesRequestSchema } from '@/types/game';

export async function getPieces(game_id: string): Promise<GetPiecesResponse> {
  try {
    const request = getPiecesRequestSchema.parse({
      game_id: game_id,
    });
    console.log('Getting pieces:', request);

    const response = await axios.get<GetPiecesResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/pieces`,
      {
        params: request,
      },
    );
    if (response.status === StatusCodes.OK) {
      console.log('Pieces retrieved successfully');
      return response.data;
    } else {
      throw new Error('Failed to get pieces', { cause: response.data });
    }
  } catch (error) {
    console.error('Error getting pieces:', error);
    throw error;
  }
}
