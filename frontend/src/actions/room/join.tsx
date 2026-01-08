'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import {
  JoinRoomResponse,
  joinRoomRequestSchema,
  joinRoomResponseSchema,
} from '@/types/room';

import { supabase } from '@/lib/supabase';

export async function joinRoom(game_id: string): Promise<JoinRoomResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
      throw new Error('Supabase anonymous login failed', { cause: authError.message });
    }
    if (!authData?.user) {
      throw new Error('Supabase anonymous login failed: No user found');
    }
    const userId: string = authData.user.id;
    const request = joinRoomRequestSchema.parse({
      game_id: game_id,
      player_id: userId,
    });
    const response = await axios.post<JoinRoomResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/rooms/join`,
      request,
    );
    return joinRoomResponseSchema.parse(response.data);
  } catch (error) {
    console.error('Error joining room:', error);
    return joinRoomResponseSchema.parse({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error occurred while trying to join room. Please try again later.',
    });
  }
}
