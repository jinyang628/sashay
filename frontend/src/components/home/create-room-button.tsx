'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { getRandomGameId } from '@/lib/utils';

export default function CreateRoomButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="lg"
      className="from-sashay-amber to-sashay-rose w-full bg-gradient-to-r via-amber-600 text-base font-semibold text-amber-50 shadow-lg shadow-amber-900/70 transition hover:shadow-amber-800/90 hover:brightness-110"
      onClick={() => {
        router.push(`/room/${getRandomGameId()}`);
      }}
    >
      Create Room
    </Button>
  );
}
