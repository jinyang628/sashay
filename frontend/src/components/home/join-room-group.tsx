'use client';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { joinRoom } from '@/actions/room/join';
import { StatusCodes } from 'http-status-codes';
import { toast } from 'sonner';

import { JoinRoomResponse, joinRoomRequestSchema } from '@/types/room';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function JoinRoomGroup() {
  const [gameId, setGameId] = useState<string>('');
  const router = useRouter();
  const handleJoinRoom = async () => {
    const joinRoomRequest = joinRoomRequestSchema.parse({
      game_id: gameId,
    });
    try {
      const response: JoinRoomResponse = await joinRoom(joinRoomRequest);
      if (response.status_code === StatusCodes.OK) {
        console.log(`Room joined successfully: ${gameId}`);
        router.push(`/game/${gameId}`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Unexpected error while trying to join room. Please try again later.');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        type="text"
        placeholder="Enter room code"
        className="h-11 bg-zinc-900/80 text-sm text-zinc-100 placeholder:text-zinc-600 sm:text-base"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="border-sashay-amber/80 text-sashay-gold hover:border-sashay-gold h-11 shrink-0 cursor-pointer bg-zinc-950/80 text-sm font-semibold hover:bg-amber-900/40"
        onClick={handleJoinRoom}
      >
        Join Room
      </Button>
    </div>
  );
}
