'use client';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { joinRoom } from '@/actions/room/join';
import { gameIdAtom } from '@/state/game';
import { StatusCodes } from 'http-status-codes';
import { useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { JoinRoomResponse } from '@/types/room';

import { getCurrentUserId } from '@/lib/supabase';

export default function JoinRoomGroup() {
  const [gameId, setGameId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const setGameIdAtom = useSetAtom(gameIdAtom);
  const handleJoinRoom = async () => {
    setIsLoading(true);
    try {
      const response: JoinRoomResponse = await joinRoom(gameId, await getCurrentUserId());
      if (response.status_code === StatusCodes.OK) {
        console.log(`Room joined successfully: ${gameId}`);
        setGameIdAtom(gameId);
        router.push(`/game/${gameId}`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Unexpected error while trying to join room. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
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
        disabled={isLoading}
        className="border-sashay-amber/80 text-sashay-gold hover:border-sashay-gold h-11 shrink-0 cursor-pointer bg-zinc-950/80 text-sm font-semibold hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-70"
        onClick={handleJoinRoom}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Join Room'}
      </Button>
    </div>
  );
}
