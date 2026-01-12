'use client';

import React, { useMemo, useState } from 'react';

import { playerAtom } from '@/state/game';
import { useAtomValue } from 'jotai';
import { Info } from 'lucide-react';

import Sidebar from '@/components/game/sidebar';
import { HandFistIcon } from '@/components/icons/lucide-hand-fist';
import { HighHeelIcon } from '@/components/icons/lucide-lab-high-heel';
import { VenetianMaskIcon } from '@/components/icons/lucide-venetian-mask';

import {
  COLS,
  PIECE_LIMITS,
  PieceType,
  PlacementMode,
  Player,
  Position,
  ROWS,
} from '@/lib/game/base';
import { Dancer, GameBoard, Master, Piece } from '@/lib/game/engine';
import { cn } from '@/lib/utils';

export default function PlanningInterface() {
  const player: Player = useAtomValue(playerAtom);
  const [placedPieces, setPlacedPieces] = useState<Piece[]>([]);
  const [selectedMode, setSelectedMode] = useState<PlacementMode>(PlacementMode.DANCER);
  const [validationError, setValidationError] = useState<string | null>(null);

  const PLAYER_SIDE_ROWS = player === Player.PLAYER_ONE ? [0, 1, 2, 3] : [4, 5, 6, 7];
  const pieceCounts = useMemo(() => {
    return {
      DANCER: placedPieces.filter((p) => p.pieceType === PieceType.DANCER && !p.isSpy).length,
      MASTER: placedPieces.filter((p) => p.pieceType === PieceType.MASTER).length,
      SPY: placedPieces.filter((p) => p.isSpy).length,
    };
  }, [placedPieces]);

  const createPieceInstance = (
    player: Player,
    type: PieceType,
    pos: Position,
    isSpy: boolean,
  ): Piece => {
    return type === PieceType.DANCER
      ? new Dancer(player, pos, isSpy)
      : new Master(player, pos, isSpy);
  };

  const handleSquareClick = (row: number, col: number) => {
    setValidationError(null);

    // Remove piece if exists
    const existingIndex = placedPieces.findIndex(
      (p) => p.position.row === row && p.position.col === col,
    );
    if (existingIndex !== -1) {
      setPlacedPieces((prev) => prev.filter((_, i) => i !== existingIndex));
      return;
    }

    // Territory Check
    if (!PLAYER_SIDE_ROWS.includes(row)) {
      setValidationError(
        `You must place pieces on your side (Rows ${PLAYER_SIDE_ROWS[0]}-${PLAYER_SIDE_ROWS[3]})`,
      );
      return;
    }

    // Inventory Limit Check
    if (pieceCounts[selectedMode] >= PIECE_LIMITS[selectedMode]) {
      setValidationError(`You have no more ${selectedMode.toLowerCase()}s left.`);
      return;
    }

    // Create the piece on the board
    const type = selectedMode === PlacementMode.MASTER ? PieceType.MASTER : PieceType.DANCER;
    const isSpy = selectedMode === PlacementMode.SPY;

    const newPiece = createPieceInstance(player, type, { row, col }, isSpy);
    setPlacedPieces((prev) => [...prev, newPiece]);
  };

  const onLockPlacementClick = () => {
    if (
      pieceCounts.DANCER !== PIECE_LIMITS.DANCER ||
      pieceCounts.MASTER !== PIECE_LIMITS.MASTER ||
      pieceCounts.SPY !== PIECE_LIMITS.SPY
    ) {
      setValidationError('Please place all your pieces before confirming.');
      return;
    }

    const board = new GameBoard(placedPieces);
    const surroundedPiece = placedPieces.find((p) => p.isPieceSurrounded(board));

    if (surroundedPiece) {
      setValidationError(
        `Illegal setup: Piece at ${surroundedPiece.position.row},${surroundedPiece.position.col} is surrounded.`,
      );
      return;
    }

    alert('Setup Validated! Pieces locked in.');
  };

  return (
    <div className="mx-auto flex h-[90vh] max-w-6xl flex-row gap-8 p-8">
      <Sidebar
        pieceCounts={pieceCounts}
        selectedMode={selectedMode}
        validationError={validationError}
        onPlacementButtonClick={setSelectedMode}
        onLockPlacementClick={onLockPlacementClick}
      />

      {/* Board */}
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
                  {/* Coordinate Label */}
                  <span className="absolute right-1 bottom-1 font-mono text-[9px] text-black/10">
                    {String.fromCharCode(65 + col)}
                    {ROWS - row}
                  </span>

                  {piece && (
                    <div
                      className={cn(
                        'flex h-14 w-14 scale-100 items-center justify-center rounded-xl shadow-md transition-all group-hover:scale-110',
                        piece.isSpy
                          ? 'bg-red-600 text-white'
                          : piece.pieceType === PieceType.MASTER
                            ? 'bg-slate-800 text-white'
                            : 'border-2 border-slate-800 bg-white text-slate-800',
                      )}
                    >
                      {piece.isSpy ? (
                        <VenetianMaskIcon className="h-8 w-8" />
                      ) : piece.pieceType === PieceType.MASTER ? (
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
    </div>
  );
}
