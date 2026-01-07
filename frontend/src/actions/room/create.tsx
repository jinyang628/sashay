'use server';

import axios from 'axios';

import { CreateRoomRequest } from '@/types/room';

export async function createRoom(request: CreateRoomRequest): Promise<void> {
  try {
    console.log('Creating room:', request);
    await axios.post(`${process.env.SERVER_BASE_URL}/api/v1/rooms/create`, request);
    console.log('Room created successfully');
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}
