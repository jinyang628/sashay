'use server';

import axios from 'axios';

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
    return response.data;
  } catch (error) {
    console.error('Error getting pieces:', error);
    throw error;
  }
}
