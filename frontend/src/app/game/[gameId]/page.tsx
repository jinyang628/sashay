'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { getPieces } from '@/actions/game/get-pieces';
import { initializePieces } from '@/actions/game/initialize';
import { movePiece } from '@/actions/game/move-piece';
import { getPlayerNumber } from '@/actions/room/get-player-number';
import { gameIdAtom } from '@/state/game';
import { StatusCodes } from 'http-status-codes';
import { useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Board from '@/components/game/board';
import Sidebar from '@/components/game/side-bar';

import { roomStatusEnum } from '@/types/room';

import { SelectedPieceState } from '@/lib/game/base';
import {
  PIECE_LIMITS,
  PieceType,
  PlanningPhasePlacementMode,
  Player,
  Position,
  getPlayerSideRows,
  pieceTypeEnum,
  playerEnum,
} from '@/lib/game/base';
import { Dancer, GameBoard, GameEngine, Master, Piece } from '@/lib/game/engine';
import { getCurrentUserId, supabase } from '@/lib/supabase';

const createPieceInstance = (
  player: Player,
  type: PieceType,
  pos: Position,
  isSpy: boolean,
): Piece => {
  return type === pieceTypeEnum.enum.dancer
    ? new Dancer(player, pos, isSpy)
    : new Master(player, pos, isSpy);
};

export default function PlanningInterface() {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerSideRows, setPlayerSideRows] = useState<number[]>([]);
  const gameId = useAtomValue(gameIdAtom);
  const [allyPieces, setAllyPieces] = useState<Piece[]>([]);
  const [enemyPieces, setEnemyPieces] = useState<Piece[]>([]);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [planningPhasePlacementMode, setPlanningPhasePlacementMode] =
    useState<PlanningPhasePlacementMode>(PlanningPhasePlacementMode.DANCER);
  const [selectedPieceState, setSelectedPieceState] = useState<SelectedPieceState>({
    piece: null,
    possiblePositions: [],
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isPlanningPhase, setIsPlanningPhase] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlayerNumber = async () => {
      try {
        const response = await getPlayerNumber(gameId, await getCurrentUserId());

        if (response.is_player_one === null) {
          toast.error('You are not a player in this game');
          window.location.replace('/');
          return;
        }

        if (response.is_player_one === true) {
          setPlayer(playerEnum.enum.player_one);
          setPlayerSideRows(getPlayerSideRows(playerEnum.enum.player_one));
        } else {
          setPlayer(playerEnum.enum.player_two);
          setPlayerSideRows(getPlayerSideRows(playerEnum.enum.player_two));
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
    if (!gameId || !player) return;

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
        async (payload) => {
          const updatedRoom = payload.new;
          if (updatedRoom.status === roomStatusEnum.enum.active) {
            const piecesData = await getPieces(gameId);
            setEnemyPieces(
              piecesData.pieces
                .filter((p) => p.player !== player)
                .map((p) => {
                  return createPieceInstance(
                    p.player,
                    p.piece_type,
                    { row: p.position.row, col: p.position.col },
                    p.is_spy,
                  );
                }),
            );
            setGameEngine(
              new GameEngine(
                piecesData.pieces.map((p) => {
                  return createPieceInstance(p.player, p.piece_type, p.position, p.is_spy);
                }),
              ),
            );
            setIsPlanningPhase(false)
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
  }, [gameId, player]);

  const pieceCounts = useMemo(() => {
    return {
      DANCER: allyPieces.filter((p) => p.pieceType === pieceTypeEnum.enum.dancer && !p.isSpy)
        .length,
      MASTER: allyPieces.filter((p) => p.pieceType === pieceTypeEnum.enum.master).length,
      SPY: allyPieces.filter((p) => p.isSpy).length,
    };
  }, [allyPieces]);

  const handleSquareClick = async (row: number, col: number) => {
    setValidationError(null);

    if (player === null) {
      return;
    }
    console.log('isPlanningPhase', isPlanningPhase);
    if (isPlanningPhase) {
      // Remove piece if exists
      const existingIndex = allyPieces.findIndex(
        (p) => p.position.row === row && p.position.col === col,
      );
      if (existingIndex !== -1) {
        setAllyPieces((prev) => prev.filter((_, i) => i !== existingIndex));
        return;
      }

      // Territory Check
      if (!playerSideRows.includes(row)) {
        setValidationError(
          `You must place pieces on your side (Rows ${playerSideRows[0]}-${playerSideRows[3]})`,
        );
        return;
      }

      // Inventory Limit Check
      if (pieceCounts[planningPhasePlacementMode] >= PIECE_LIMITS[planningPhasePlacementMode]) {
        setValidationError(`You have no more ${planningPhasePlacementMode.toLowerCase()}s left.`);
        return;
      }

      // Create the piece on the board
      const type =
        planningPhasePlacementMode === PlanningPhasePlacementMode.MASTER
          ? pieceTypeEnum.enum.master
          : pieceTypeEnum.enum.dancer;
      const isSpy = planningPhasePlacementMode === PlanningPhasePlacementMode.SPY;

      const newPiece = createPieceInstance(player, type, { row, col }, isSpy);
      setAllyPieces((prev) => [...prev, newPiece]);
    } else {
      if (!gameEngine) {
        throw new Error('Game engine not found');
      }
      for (const piece of allyPieces) {
        if (piece.position.row === row && piece.position.col === col) {
          const possibleNewPositions: Position[] = gameEngine.getPossibleNewPositions(piece);
          setSelectedPieceState({
            piece: {
              id: piece.id,
              player: piece.player,
              piece_type: piece.pieceType,
              position: piece.position,
              is_spy: piece.isSpy,
            },
            possiblePositions: possibleNewPositions,
          });
          return;
        }
      }
      if (selectedPieceState.piece) {
        if (
          !selectedPieceState.possiblePositions.some((pos) => pos.row === row && pos.col === col)
        ) {
          setSelectedPieceState({
            piece: null,
            possiblePositions: [],
          });
        }

        const fullPiece = allyPieces.find((p) => p.id === selectedPieceState.piece?.id);
        if (!fullPiece) {
          setValidationError('Selected piece not found.');
          setSelectedPieceState({
            piece: null,
            possiblePositions: [],
          });
          return;
        }
        const response = await movePiece(
          gameId,
          {
            id: fullPiece.id,
            player: fullPiece.player,
            piece_type: fullPiece.pieceType,
            position: fullPiece.position,
            is_spy: fullPiece.isSpy,
          },
          { row, col },
        );
        if (response.status_code !== StatusCodes.OK) {
          setValidationError('Failed to move piece.');
          return;
        }
        setAllyPieces(
          response.pieces
            .filter((p) => p.player === player)
            .map((p) => {
              return createPieceInstance(p.player, p.piece_type, p.position, p.is_spy);
            }),
        );
        setEnemyPieces(
          response.captured_pieces
            .filter((p) => p.player !== player)
            .map((p) => {
              return createPieceInstance(p.player, p.piece_type, p.position, p.is_spy);
            }),
        );
        setGameEngine(
          new GameEngine(
            response.pieces.map((p) => {
              return createPieceInstance(p.player, p.piece_type, p.position, p.is_spy);
            }),
          ),
        );
      }
    }
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

    const board = new GameBoard(allyPieces);
    const surroundedPiece = allyPieces.find((p) => p.isPieceSurrounded(board));

    if (surroundedPiece) {
      setValidationError(
        `Illegal setup: Piece at ${surroundedPiece.position.row},${surroundedPiece.position.col} is surrounded.`,
      );
      return false;
    }
    try {
      await initializePieces(
        gameId,
        allyPieces.map((piece) => ({
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
        planningPhasePlacementMode={planningPhasePlacementMode}
        validationError={validationError}
        onPlacementModeButtonClick={setPlanningPhasePlacementMode}
        onLockPlacementClick={onLockPlacementClick}
      />

      <Board
        PLAYER_SIDE_ROWS={playerSideRows}
        allyPieces={allyPieces}
        enemyPieces={enemyPieces}
        isPlanningPhase={isPlanningPhase}
        selectedPieceState={selectedPieceState}
        handleSquareClick={handleSquareClick}
      />
    </div>
  );
}
