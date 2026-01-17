'use server';

import axios from 'axios';

import { MovePieceResponse, movePieceRequestSchema } from '@/types/game';

import { Piece, Position } from '@/lib/game/base';

export async function movePiece(
  game_id: string,
  piece: Piece,
  new_position: Position,
): Promise<MovePieceResponse> {
  try {
    const request = movePieceRequestSchema.parse({
      game_id: game_id,
      piece: piece,
      new_position: new_position,
    });
    const response = await axios.post<MovePieceResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/pieces/move`,
      request,
    );
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error moving piece:', error);
    throw error;
  }
}
