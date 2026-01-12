'use client';

import { useRouter } from 'next/navigation';

import { use, useEffect } from 'react';

import StatusText from '@/components/room/status-text';

import { roomStatusEnum } from '@/types/room';

import { supabase } from '@/lib/supabase';

type LobbyPageProps = { params: Promise<{ gameId: string }> };

export default function LobbyPage({ params }: LobbyPageProps) {
  const router = useRouter();
  const { gameId } = use(params);
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`room-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          const updatedRoom = payload.new;
          if (
            updatedRoom.status === roomStatusEnum.enum.planning &&
            updatedRoom.player_two_id !== null &&
            updatedRoom.player_one_id !== null
          ) {
            setTimeout(() => {
              router.push(`/game/${gameId}`);
            }, 1000);
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully listening for room updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, router]);

  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center">
      <div className="border-border/60 relative w-full max-w-3xl overflow-hidden rounded-3xl border bg-gradient-to-b from-zinc-950 via-stone-950/95 to-stone-900/90 p-px shadow-[0_0_70px_rgba(24,16,8,0.95)]">
        <div className="animate-orb-drift-slow pointer-events-none absolute -top-32 -left-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--sashay-orb-1),transparent_65%)] blur-2xl" />
        <div className="animate-orb-drift-slower pointer-events-none absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,var(--sashay-orb-2),transparent_65%)] blur-2xl" />

        <div className="relative z-10 flex flex-col gap-10 rounded-[1.4rem] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.07),transparent_55%),radial-gradient(circle_at_bottom,rgba(148,27,45,0.22),transparent_65%),linear-gradient(to_bottom_right,rgba(9,9,11,0.98),rgba(24,24,27,0.98))] px-10 py-14 text-center backdrop-blur-2xl sm:px-14 sm:py-16">
          <div className="mx-auto max-w-2xl space-y-6">
            <h1 className="bg-gradient-to-r from-[var(--sashay-amber)] via-[var(--sashay-amber-soft)] to-[var(--sashay-crimson)] bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-3xl">
              Your masquerade is held at
            </h1>
            <p className="animate-title-flicker from-sashay-gold to-sashay-rose bg-gradient-to-r via-amber-200 bg-clip-text p-1 text-8xl font-semibold text-transparent sm:text-6xl">
              {gameId}
            </p>
          </div>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[var(--sashay-amber-soft)] to-transparent opacity-70" />
          <div className="mx-auto max-w-xl space-y-2 text-zinc-500">
            <StatusText />
          </div>
        </div>
      </div>
    </main>
  );
}
