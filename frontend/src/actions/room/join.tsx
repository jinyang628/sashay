'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { JoinRoomRequest, JoinRoomResponse, joinRoomResponseSchema } from '@/types/room';

export async function joinRoom(request: JoinRoomRequest): Promise<JoinRoomResponse> {
  try {
    console.log('Creating room:', request);
    const response = await axios.post(`${process.env.SERVER_BASE_URL}/api/v1/rooms/join`, request);
    if (response.status === StatusCodes.OK) {
      return joinRoomResponseSchema.parse({
        is_successful: true,
        message: 'Room joined successfully',
      });
    } else if (response.status === StatusCodes.NOT_FOUND) {
      return joinRoomResponseSchema.parse({
        is_successful: false,
        message: `Room not found: ${request.game_id}`,
      });
    } else {
      console.error('Unexpected error while trying to join room:', response.data);
      return joinRoomResponseSchema.parse({
        is_successful: false,
        message: 'Unexpected error while trying to join room. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Error joining room:', error);
    return joinRoomResponseSchema.parse({
      is_successful: false,
      message: 'Unexpected error while trying to join room. Please try again later.',
    });
  }
}
