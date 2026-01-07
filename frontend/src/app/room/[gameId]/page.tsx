import StatusText from '@/components/room/status-text';

type RoomPageProps = { params: { gameId: string } };

export default function RoomPage({ params }: RoomPageProps) {
  const { gameId } = params;

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
            <p className="animate-title-flicker from-sashay-gold to-sashay-rose bg-gradient-to-r via-amber-200 bg-clip-text text-8xl font-semibold text-transparent sm:text-6xl">
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
