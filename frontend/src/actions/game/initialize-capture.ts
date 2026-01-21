'use server';

import axios from 'axios';

import { InitializeCaptureResponse, initializeCaptureRequestSchema } from '@/types/game';

export async function initializeCapture(game_id: string): Promise<InitializeCaptureResponse> {
  try {
    const request = initializeCaptureRequestSchema.parse({
      game_id: game_id,
    });
    const response = await axios.post<InitializeCaptureResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/games/initialize/capture`,
      request,
    );
    return response.data;
  } catch (error) {
    console.error('Error initializing pieces:', error);
    throw error;
  }
}
