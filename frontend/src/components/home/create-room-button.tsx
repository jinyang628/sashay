'use client';

import { useRouter } from 'next/navigation';

import { createRoom } from '@/actions/room/create';
import { gameIdAtom } from '@/state/game';
import { useSetAtom } from 'jotai';

import { Button } from '@/components/ui/button';

import { getUserIdOfAnonymousSignIn } from '@/lib/supabase';
import { getRandomGameId } from '@/lib/utils';

export default function CreateRoomButton() {
  const router = useRouter();
  const setGameId = useSetAtom(gameIdAtom);

  const handleCreateRoom = async () => {
    const gameId = getRandomGameId();
    setGameId(gameId);
    await createRoom(gameId, await getUserIdOfAnonymousSignIn());
    router.push(`/room/${gameId}`);
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
