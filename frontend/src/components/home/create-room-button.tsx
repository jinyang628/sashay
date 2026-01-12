'use client';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { createRoom } from '@/actions/room/create';
import { gameIdAtom, playerAtom } from '@/state/game';
import { useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Player } from '@/lib/game/base';
import { getUserIdOfAnonymousSignIn } from '@/lib/supabase';
import { getHostPlayer, getRandomGameId } from '@/lib/utils';

export default function CreateRoomButton() {
  const router = useRouter();
  const setGameId = useSetAtom(gameIdAtom);
  const setPlayer = useSetAtom(playerAtom);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const gameId: string = getRandomGameId();
      setGameId(gameId);
      const hostPlayer: Player = getHostPlayer();
      console.log(`You are ${hostPlayer}`);
      setPlayer(hostPlayer);
      await createRoom(gameId, await getUserIdOfAnonymousSignIn(), hostPlayer);
      router.push(`/lobby/${gameId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      disabled={isLoading}
      className="from-sashay-amber to-sashay-rose w-full cursor-pointer bg-gradient-to-r via-amber-600 text-base font-semibold text-amber-50 shadow-lg shadow-amber-900/70 transition hover:shadow-amber-800/90 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      onClick={handleCreateRoom}
    >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Room'}
    </Button>
  );
}
