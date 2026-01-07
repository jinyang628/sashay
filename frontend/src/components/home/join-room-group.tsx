'use client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function JoinRoomGroup() {
  return (
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
        className="border-sashay-amber/80 text-sashay-gold hover:border-sashay-gold h-11 shrink-0 cursor-pointer bg-zinc-950/80 text-sm font-semibold hover:bg-amber-900/40"
      >
        Join Room
      </Button>
    </div>
  );
}
