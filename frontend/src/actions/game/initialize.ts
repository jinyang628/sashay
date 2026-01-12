'use server';

import axios from 'axios';

import { initializePiecesRequestSchema } from '@/types/game';

import { Piece } from '@/lib/game/base';

export async function initializePieces(game_id: string, pieces: Piece[]): Promise<void> {
  try {
    const request = initializePiecesRequestSchema.parse({
      game_id: game_id,
      pieces: pieces,
    });
    await axios.post(`${process.env.SERVER_BASE_URL}/api/v1/games/initialize`, request);
  } catch (error) {
    console.error('Error initializing pieces:', error);
    throw error;
  }
}
