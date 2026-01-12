'use client';

import React, { useMemo, useState } from 'react';

import { playerAtom } from '@/state/game';
import { useAtomValue } from 'jotai';

import Board from '@/components/game/board';
import Sidebar from '@/components/game/side-bar';

import { PIECE_LIMITS, PieceType, PlacementMode, Player, Position } from '@/lib/game/base';
import { Dancer, GameBoard, Master, Piece } from '@/lib/game/engine';

export default function PlanningInterface() {
  const player: Player = useAtomValue(playerAtom);
  const PLAYER_SIDE_ROWS = player === Player.PLAYER_ONE ? [0, 1, 2, 3] : [4, 5, 6, 7];
  const [placedPieces, setPlacedPieces] = useState<Piece[]>([]);
  const [selectedMode, setSelectedMode] = useState<PlacementMode>(PlacementMode.DANCER);
  const [validationError, setValidationError] = useState<string | null>(null);

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

      <Board
        PLAYER_SIDE_ROWS={PLAYER_SIDE_ROWS}
        placedPieces={placedPieces}
        handleSquareClick={handleSquareClick}
      />
    </div>
  );
}
