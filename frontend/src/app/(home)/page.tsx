import CreateRoomButton from '@/components/home/create-room-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <main className="flex w-full flex-1 items-center justify-center">
      <div className="border-border/60 relative w-full max-w-xl overflow-hidden rounded-3xl border bg-gradient-to-b from-zinc-950 via-stone-950/95 to-stone-900/90 p-px shadow-[0_0_70px_rgba(24,16,8,0.95)]">
        <div className="animate-orb-drift-slow pointer-events-none absolute -top-32 -left-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--sashay-orb-1),transparent_65%)] blur-2xl" />
        <div className="animate-orb-drift-slower pointer-events-none absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,var(--sashay-orb-2),transparent_65%)] blur-2xl" />
        <div className="relative z-10 flex flex-col gap-8 rounded-[1.4rem] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.07),transparent_55%),radial-gradient(circle_at_bottom,rgba(148,27,45,0.22),transparent_65%),linear-gradient(to_bottom_right,rgba(9,9,11,0.98),rgba(24,24,27,0.98))] px-8 py-10 backdrop-blur-2xl sm:px-10 sm:py-12">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="animate-title-flicker from-sashay-gold to-sashay-rose bg-gradient-to-r via-amber-300 bg-clip-text py-3 text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
              Sashay
            </h1>
            <p className="mx-auto max-w-md text-sm text-zinc-400 sm:text-base">
              In a dance of deception and disguise
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <CreateRoomButton />

            <div className="border-border/70 flex flex-col gap-2 rounded-2xl border bg-zinc-950/70 p-4 shadow-sm backdrop-blur">
              <label className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase">
                Join an existing room
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="text"
                  placeholder="Enter room code"
                  className="h-11 bg-zinc-900/80 text-sm text-zinc-100 placeholder:text-zinc-600 sm:text-base"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="border-sashay-amber/80 text-sashay-gold hover:border-sashay-gold h-11 shrink-0 bg-zinc-950/80 text-sm font-semibold hover:bg-amber-900/40"
                >
                  Join Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
