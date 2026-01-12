import GameBoard from '@/components/game/board';

import { COLS, ROWS } from '@/lib/game/base';

export default function Home() {
  return (
    <div className="bg-background flex h-[50%] w-full flex-col items-center justify-center overflow-hidden">
      <div
        className="grid w-full max-w-3xl gap-2 overflow-hidden rounded-lg p-2 shadow-sm"
        style={{
          maxHeight: '85dvh',
          aspectRatio: `${COLS} / ${ROWS}`,
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        <GameBoard />
      </div>
    </div>
  );
}
