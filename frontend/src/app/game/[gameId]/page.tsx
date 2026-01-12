'use client';

import router from 'next/router';

import React, { useEffect, useMemo, useState } from 'react';

import { initializePieces } from '@/actions/game/initialize';
import { getPlayerNumber } from '@/actions/room/get-player-number';
import { gameIdAtom } from '@/state/game';
import { useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Board from '@/components/game/board';
import Sidebar from '@/components/game/side-bar';

import { roomStatusEnum } from '@/types/room';

import {
  PIECE_LIMITS,
  PieceType,
  PlacementMode,
  Player,
  Position,
  pieceTypeEnum,
  playerEnum,
} from '@/lib/game/base';
import { Dancer, GameBoard, Master, Piece as PieceClass } from '@/lib/game/engine';
import { getCurrentUserId, supabase } from '@/lib/supabase';

const createPieceInstance = (
  player: Player,
  type: PieceType,
  pos: Position,
  isSpy: boolean,
): PieceClass => {
  return type === pieceTypeEnum.enum.dancer
    ? new Dancer(player, pos, isSpy)
    : new Master(player, pos, isSpy);
};

export default function PlanningInterface() {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const gameId = useAtomValue(gameIdAtom);
  const PLAYER_SIDE_ROWS = player === playerEnum.enum.player_one ? [0, 1, 2, 3] : [4, 5, 6, 7];
  const [placedPieces, setPlacedPieces] = useState<PieceClass[]>([]);
  const [selectedMode, setSelectedMode] = useState<PlacementMode>(PlacementMode.DANCER);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerNumber = async () => {
      try {
        const response = await getPlayerNumber(gameId, await getCurrentUserId());
        if (response.is_player_one === true) {
          console.log('You are player one');
          setPlayer(playerEnum.enum.player_one);
        } else if (response.is_player_one === false) {
          console.log('You are player two');
          setPlayer(playerEnum.enum.player_two);
        } else {
          toast.error('You are not a player in this game');
          router.push('/');
        }
      } catch (error) {
        console.error('Error getting player number:', error);
        toast.error('Unexpected error while trying to get player number. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayerNumber();
  }, []);

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`room-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          const updatedRoom = payload.new;
          if (updatedRoom.status === roomStatusEnum.enum.active) {
            // setTimeout(() => {
            //   router.push(`/game/${gameId}`);
            // }, 1000);
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully listening for room updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, router]);

  const pieceCounts = useMemo(() => {
    return {
      DANCER: placedPieces.filter((p) => p.pieceType === pieceTypeEnum.enum.dancer && !p.isSpy)
        .length,
      MASTER: placedPieces.filter((p) => p.pieceType === pieceTypeEnum.enum.master).length,
      SPY: placedPieces.filter((p) => p.isSpy).length,
    };
  }, [placedPieces]);

  const handleSquareClick = (row: number, col: number) => {
    setValidationError(null);

    if (player === null) {
      return;
    }

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
    const type =
      selectedMode === PlacementMode.MASTER ? pieceTypeEnum.enum.master : pieceTypeEnum.enum.dancer;
    const isSpy = selectedMode === PlacementMode.SPY;

    const newPiece = createPieceInstance(player, type, { row, col }, isSpy);
    setPlacedPieces((prev) => [...prev, newPiece]);
  };

  const onLockPlacementClick = async (): Promise<boolean> => {
    if (
      pieceCounts.DANCER !== PIECE_LIMITS.DANCER ||
      pieceCounts.MASTER !== PIECE_LIMITS.MASTER ||
      pieceCounts.SPY !== PIECE_LIMITS.SPY
    ) {
      setValidationError('Please place all your pieces before confirming.');
      return false;
    }

    const board = new GameBoard(placedPieces);
    const surroundedPiece = placedPieces.find((p) => p.isPieceSurrounded(board));

    if (surroundedPiece) {
      setValidationError(
        `Illegal setup: Piece at ${surroundedPiece.position.row},${surroundedPiece.position.col} is surrounded.`,
      );
      return false;
    }
    try {
      await initializePieces(
        gameId,
        placedPieces.map((piece) => ({
          id: piece.id,
          player: piece.player,
          piece_type: piece.pieceType,
          position: piece.position,
          is_spy: piece.isSpy,
        })),
      );
      return true;
    } catch (error) {
      console.error('Error initializing pieces:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

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
