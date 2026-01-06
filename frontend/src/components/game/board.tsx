import Square from '@/components/game/square';

import { COLS, ROWS } from '@/lib/constants';

export default function GameBoard() {
  return Array.from({ length: ROWS }).map((_, row) =>
    Array.from({ length: COLS }).map((_, col) => {
      const isLight = (row + col) % 2 === 0;
      return <Square key={`${row}-${col}`} row={row} col={col} isLight={isLight} />;
    }),
  );
}
