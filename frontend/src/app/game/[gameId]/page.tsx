'use client';

import React, { useMemo, useState } from 'react';

import { playerAtom } from '@/state/game';
import { useAtomValue } from 'jotai';
import { AlertCircle, Info, Shield, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { COLS, PieceType, Player, Position, ROWS } from '@/lib/game/base';
import { Dancer, GameBoard, Master, Piece } from '@/lib/game/engine';
import { cn } from '@/lib/utils';

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

export default function PlanningInterface() {
  const player: Player = useAtomValue(playerAtom);
  const [placedPieces, setPlacedPieces] = useState<Piece[]>([]);
  const [selectedType, setSelectedType] = useState<PieceType>(PieceType.DANCER);
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- Configuration ---
  const MAX_DANCERS = 8;
  const MAX_MASTERS = 2;
  const PLAYER_SIDE_ROWS = [4, 5, 6, 7]; // Player B side

  const counts = useMemo(
    () => ({
      dancer: placedPieces.filter((p) => p.pieceType === PieceType.DANCER).length,
      master: placedPieces.filter((p) => p.pieceType === PieceType.MASTER).length,
    }),
    [placedPieces],
  );

  const handleSquareClick = (row: number, col: number) => {
    setValidationError(null);

    const existingIndex = placedPieces.findIndex(
      (p) => p.position.row === row && p.position.col === col,
    );
    if (existingIndex !== -1) {
      const newPieces = [...placedPieces];
      newPieces.splice(existingIndex, 1);
      setPlacedPieces(newPieces);
      return;
    }

    if (!PLAYER_SIDE_ROWS.includes(row)) {
      setValidationError('You can only place pieces on your side (bottom 4 rows).');
      return;
    }

    if (selectedType === PieceType.DANCER && counts.dancer >= MAX_DANCERS) return;
    if (selectedType === PieceType.MASTER && counts.master >= MAX_MASTERS) return;

    const newPiece = createPieceInstance(player, selectedType, { row, col }, false);
    const newPieces = [...placedPieces, newPiece];
    setPlacedPieces(newPieces);
  };

  const validateSetup = () => {
    // Check totals
    if (counts.dancer !== MAX_DANCERS || counts.master !== MAX_MASTERS) {
      setValidationError(`Place all pieces (${MAX_DANCERS} Dancers, ${MAX_MASTERS} Masters)`);
      return;
    }

    // Logic Check: No piece surrounded
    const board = new GameBoard(placedPieces);
    const surroundedPiece = placedPieces.find((p) => p.isPieceSurrounded(board));

    if (surroundedPiece) {
      setValidationError(
        `Illegal setup: Piece at ${surroundedPiece.position.row},${surroundedPiece.position.col} is surrounded.`,
      );
      return;
    }

    alert('Setup Validated! Sending to server...');
  };

  return (
    <div className="mx-auto flex h-[90vh] max-w-6xl flex-row gap-8 p-8">
      {/* Sidebar Controls */}
      <Card className="bg-muted/30 flex w-64 flex-col gap-6 p-6">
        <div>
          <h2 className="mb-2 text-xl font-bold">Inventory</h2>
          <p className="text-muted-foreground text-sm">
            Select a piece and click the board to place it.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant={selectedType === PieceType.DANCER ? 'default' : 'outline'}
            className="justify-between"
            onClick={() => setSelectedType(PieceType.DANCER)}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" /> Dancer
            </div>
            <Badge variant="secondary">{MAX_DANCERS - counts.dancer} left</Badge>
          </Button>

          <Button
            variant={selectedType === PieceType.MASTER ? 'default' : 'outline'}
            className="justify-between"
            onClick={() => setSelectedType(PieceType.MASTER)}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Master
            </div>
            <Badge variant="secondary">{MAX_MASTERS - counts.master} left</Badge>
          </Button>
        </div>

        <div className="mt-auto space-y-4">
          {validationError && (
            <div className="text-destructive bg-destructive/10 flex items-start gap-2 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
          <Button className="w-full" size="lg" onClick={validateSetup}>
            Confirm Placement
          </Button>
        </div>
      </Card>

      {/* Board Area */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="bg-border border-muted grid gap-1 rounded border-4 p-1 shadow-2xl"
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
                    'relative flex cursor-pointer items-center justify-center transition-all hover:opacity-80',
                    isLight ? 'bg-slate-200' : 'bg-slate-300',
                    !isPlayerSide && 'bg-stripes-muted cursor-not-allowed opacity-40',
                    'border border-black/5',
                  )}
                >
                  {/* Coordinate Label */}
                  <span className="absolute top-1 left-1 font-mono text-[10px] text-black/20">
                    {row},{col}
                  </span>

                  {piece && (
                    <div
                      className={cn(
                        'flex h-14 w-14 scale-110 items-center justify-center rounded-full shadow-lg transition-transform',
                        piece.pieceType === PieceType.MASTER
                          ? 'bg-indigo-600 text-white'
                          : 'border-2 border-indigo-600 bg-white text-indigo-600',
                      )}
                    >
                      {piece.pieceType === PieceType.MASTER ? <Shield /> : <User />}
                      {piece.isSpy && (
                        <div className="absolute -top-1 -right-1 rounded-full border-2 border-white bg-red-500 p-1 text-white">
                          <Info className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  )}

                  {!piece && isPlayerSide && <div className="h-2 w-2 rounded-full bg-black/5" />}
                </div>
              );
            }),
          )}
        </div>
        <p className="text-muted-foreground mt-4 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Click an existing piece to remove it.
        </p>
      </div>
    </div>
  );
}
