'use client';

import { useRouter } from 'next/navigation';

import { createRoom } from '@/actions/room/create';
import { gameIdAtom, playerAtom } from '@/state/game';
import { useSetAtom } from 'jotai';

import { Button } from '@/components/ui/button';

import { Player } from '@/lib/game/base';
import { getUserIdOfAnonymousSignIn } from '@/lib/supabase';
import { getHostPlayer, getRandomGameId } from '@/lib/utils';

export default function CreateRoomButton() {
  const router = useRouter();
  const setGameId = useSetAtom(gameIdAtom);
  const setPlayer = useSetAtom(playerAtom);

  const handleCreateRoom = async () => {
    const gameId: string = getRandomGameId();
    setGameId(gameId);
    const hostPlayer: Player = getHostPlayer();
    setPlayer(hostPlayer);
    await createRoom(gameId, await getUserIdOfAnonymousSignIn(), hostPlayer);
    router.push(`/lobby/${gameId}`);
  };

  return (
    <Button
      type="button"
      size="lg"
      className="from-sashay-amber to-sashay-rose w-full cursor-pointer bg-gradient-to-r via-amber-600 text-base font-semibold text-amber-50 shadow-lg shadow-amber-900/70 transition hover:shadow-amber-800/90 hover:brightness-110"
      onClick={handleCreateRoom}
    >
      Create Room
    </Button>
  );
}
