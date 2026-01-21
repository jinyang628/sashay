'use server';

import axios from 'axios';

import { movePieceRequestSchema } from '@/types/game';
import { Marking } from '@/lib/game/engine';
import { StatusCodes } from 'http-status-codes';

export async function toggleMarking(
  game_id: string,
  piece_id: string,
  marking: Marking,
): Promise<void> {
  try {
    const request = movePieceRequestSchema.parse({
      game_id: game_id,
      piece_id: piece_id,
      marking: marking,
    });
    const response = await axios.post(
      `${process.env.SERVER_BASE_URL}/api/v1/games/pieces/marking`,
      request,
    );
    if (response.status !== StatusCodes.OK) {
      throw new Error('Failed to toggle marking', { cause: response.data });
    }
  } catch (error) {
    console.error('Error toggling marking:', error);
    throw error;
  }
}
