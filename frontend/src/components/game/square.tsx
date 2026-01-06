'use client';

import { Button } from '../ui/button';

interface SquareProps {
  row: number;
  col: number;
  isLight: boolean;
}

export default function Square({ row, col, isLight }: SquareProps) {
  const baseColor = isLight
    ? 'bg-blue-300 hover:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600'
    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-300';

  return (
    <Button
      className={`${baseColor} focus:ring-primary focus:ring-offset-background h-full w-full cursor-pointer p-0 transition hover:brightness-110 focus:ring-4 focus:ring-offset-2 focus:outline-none`}
      aria-label={`Board cell row ${row + 1}, column ${col + 1}`}
    />
  );
}
