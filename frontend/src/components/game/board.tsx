import { Info } from 'lucide-react';

import { HandFistIcon } from '@/components/icons/lucide-hand-fist';
import { HighHeelIcon } from '@/components/icons/lucide-lab-high-heel';
import { VenetianMaskIcon } from '@/components/icons/lucide-venetian-mask';

import { COLS, ROWS, pieceTypeEnum } from '@/lib/game/base';
import { Piece } from '@/lib/game/engine';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  PLAYER_SIDE_ROWS: number[];
  placedPieces: Piece[];
  handleSquareClick: (row: number, col: number) => void;
}

export default function Board({
  PLAYER_SIDE_ROWS,
  placedPieces,
  handleSquareClick,
}: GameBoardProps) {
  const coordinateLabel = (row: number, col: number) => (
    <span className="absolute right-1 bottom-1 font-mono text-[9px] text-black">
      {String.fromCharCode(65 + col)}
      {ROWS - row}
    </span>
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div
        className="grid gap-0.5 rounded-lg border-8 border-slate-800 bg-slate-900 p-1 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 80px)`,
          gridTemplateRows: `repeat(${ROWS}, 80px)`,
        }}
      >
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            const piece = placedPieces.find(
              (p) => p.position.row === row && p.position.col === col,
            );
            const isPlayerSide = PLAYER_SIDE_ROWS.includes(row);
            const isLight = (row + col) % 2 === 0;

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => handleSquareClick(row, col)}
                className={cn(
                  'group relative flex cursor-pointer items-center justify-center transition-all',
                  isLight ? 'bg-slate-100' : 'bg-slate-200',
                  !isPlayerSide && 'bg-stripes-muted cursor-not-allowed opacity-30',
                  'hover:ring-primary/50 hover:z-10 hover:ring-2',
                )}
              >
                {coordinateLabel(row, col)}

                {piece && (
                  <div
                    className={cn(
                      'flex h-14 w-14 scale-100 items-center justify-center rounded-xl shadow-md transition-all group-hover:scale-110',
                      piece.isSpy
                        ? 'bg-red-600 text-white'
                        : piece.pieceType === pieceTypeEnum.enum.master
                          ? 'bg-slate-800 text-white'
                          : 'border-2 border-slate-800 bg-white text-slate-800',
                    )}
                  >
                    {piece.isSpy ? (
                      <VenetianMaskIcon className="h-8 w-8" />
                    ) : piece.pieceType === pieceTypeEnum.enum.master ? (
                      <HandFistIcon className="h-8 w-8" />
                    ) : (
                      <HighHeelIcon className="h-8 w-8" />
                    )}
                  </div>
                )}

                {!piece && isPlayerSide && (
                  <div className="group-hover:bg-primary/50 h-1.5 w-1.5 rounded-full bg-slate-400/30" />
                )}
              </div>
            );
          }),
        )}
      </div>
      <p className="text-muted-foreground mt-6 flex items-center gap-2 text-sm italic">
        <Info className="h-4 w-4" />
        Click an occupied square to recall the piece to your inventory.
      </p>
    </div>
  );
}
