'use server';

import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

import { JoinRoomRequest, JoinRoomResponse, joinRoomResponseSchema } from '@/types/room';

export async function joinRoom(request: JoinRoomRequest): Promise<JoinRoomResponse> {
  try {
    console.log('Joining room:', request);
    const response = await axios.post<JoinRoomResponse>(
      `${process.env.SERVER_BASE_URL}/api/v1/rooms/join`,
      request,
    );
    console.log('Successfully attempted to join room:', response.data);
    return joinRoomResponseSchema.parse(response.data);
  } catch (error) {
    console.error('Error joining room:', error);
    return joinRoomResponseSchema.parse({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error occurred while trying to join room. Please try again later.',
    });
  }
}
