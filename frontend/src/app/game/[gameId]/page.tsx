'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getGameState } from '@/actions/game/get-game-state';
import { initializePieces } from '@/actions/game/initialize';
import { movePiece } from '@/actions/game/move-piece';
import { toggleMarking } from '@/actions/game/toggle-marking';
import { getPlayerNumber } from '@/actions/room/get-player-number';
import { gameIdAtom } from '@/state/game';
import { StatusCodes } from 'http-status-codes';
import { useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Board from '@/components/game/board';
import Sidebar from '@/components/game/side-bar';

import { MovePieceResponse, Stage } from '@/types/game';
import { roomStatusEnum } from '@/types/room';

import { GameState, SelectedPieceState } from '@/lib/game/base';
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
import { Dancer, GameBoard, GameEngine, Marking, Master, Piece } from '@/lib/game/engine';
import { getCurrentUserId, supabase } from '@/lib/supabase';

const createPieceInstance = (
  id: string,
  player: Player,
  type: PieceType,
  pos: Position,
  isSpy: boolean,
): Piece => {
  return type === pieceTypeEnum.enum.dancer
    ? new Dancer(id, player, pos, Marking.NONE, isSpy)
    : new Master(id, player, pos, Marking.NONE, isSpy);
};

export default function PlanningInterface() {
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerSideRows, setPlayerSideRows] = useState<number[]>([]);
  const gameId = useAtomValue(gameIdAtom);
  const [gameState, setGameState] = useState<GameState>({
    allyPieces: [],
    enemyPieces: [],
    capturedPieces: [],
    gameEngine: null,
    movement: null,
    victoryState: null,
  });

  const [planningPhasePlacementMode, setPlanningPhasePlacementMode] =
    useState<PlanningPhasePlacementMode>(PlanningPhasePlacementMode.DANCER);
  const [selectedPieceState, setSelectedPieceState] = useState<SelectedPieceState>({
    piece: null,
    possiblePositions: [],
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>(Stage.PLANNING);

  const onToggleEnemyMarking = useCallback((enemyPieceId: string | null) => {
    setGameState((prev) => {
      const updatedEnemies = prev.enemyPieces.map((p) => {
        if (p.id !== enemyPieceId) return p;
        if (p.pieceType === pieceTypeEnum.enum.master) return p;
        const nextMarking =
          p.marking === Marking.NONE
            ? Marking.MARKED
            : p.marking === Marking.MARKED
              ? Marking.CAPTURED
              : Marking.NONE;
        toggleMarking(gameId, enemyPieceId, nextMarking);
        p.marking = nextMarking;
        return p;
      });
      return {
        ...prev,
        enemyPieces: updatedEnemies,
      };
    });
  }, []);

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
            const gameStateData = await getGameState(gameId);
            setGameState({
              allyPieces: gameStateData.pieces
                .filter((p) => p.player === player)
                .map((p) =>
                  createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
                ),
              enemyPieces: gameStateData.pieces
                .filter((p) => p.player !== player)
                .map((p) =>
                  createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
                ),
              capturedPieces: gameStateData.captured_pieces.map((p) =>
                createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
              ),
              gameEngine: new GameEngine(
                player,
                0,
                gameStateData.pieces.map((p) =>
                  createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
                ),
              ),
              movement: gameStateData.movement,
              victoryState: gameStateData.victory_state,
            });
            setStage(Stage.ACTIVE);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, player]);

  useEffect(() => {
    if (!gameId || !player) return;

    if (stage === Stage.WAITING) {
      return;
    }

    const channel = supabase
      .channel(`games-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          const updatedGame = payload.new;
          const oldGame = payload.old;
          if (updatedGame.turn !== oldGame.turn) {
            const gameStateData = await getGameState(gameId);
            const mappedPieces = gameStateData.pieces.map((p) =>
              createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
            );
            setGameState({
              allyPieces: mappedPieces.filter((p) => p.player === player),
              enemyPieces: mappedPieces.filter((p) => p.player !== player),
              capturedPieces: gameStateData.captured_pieces.map((p) =>
                createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
              ),
              gameEngine: new GameEngine(player, updatedGame.turn, mappedPieces),
              movement: gameStateData.movement,
              victoryState: gameStateData.victory_state,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, player, stage]);

  const pieceCounts = useMemo(() => {
    return {
      DANCER: gameState.allyPieces.filter(
        (p) => p.pieceType === pieceTypeEnum.enum.dancer && !p.isSpy,
      ).length,
      MASTER: gameState.allyPieces.filter((p) => p.pieceType === pieceTypeEnum.enum.master).length,
      SPY: gameState.allyPieces.filter((p) => p.isSpy).length,
    };
  }, [gameState.allyPieces]);

  const handleSquareClick = async (row: number, col: number) => {
    setValidationError(null);

    if (player === null) {
      return;
    }
    if (stage === Stage.PLANNING) {
      // Remove piece if exists
      const existingIndex = gameState.allyPieces.findIndex(
        (p) => p.position.row === row && p.position.col === col,
      );
      if (existingIndex !== -1) {
        setGameState((prev) => ({
          ...prev,
          allyPieces: prev.allyPieces.filter((_, i) => i !== existingIndex),
        }));
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

      const newPiece = createPieceInstance(crypto.randomUUID(), player, type, { row, col }, isSpy);
      setGameState((prev) => ({
        ...prev,
        allyPieces: [...prev.allyPieces, newPiece],
      }));
    } else if (stage === Stage.ACTIVE) {
      if (!gameState.gameEngine) {
        throw new Error('Game engine not found');
      }
      for (const piece of gameState.allyPieces) {
        if (piece.position.row === row && piece.position.col === col) {
          const possibleNewPositions: Position[] =
            gameState.gameEngine.getPossibleNewPositions(piece);
          setSelectedPieceState({
            piece: piece,
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

        const fullPiece = gameState.allyPieces.find((p) => p.id === selectedPieceState.piece?.id);
        if (!fullPiece) {
          setValidationError('Selected piece not found.');
          setSelectedPieceState({
            piece: null,
            possiblePositions: [],
          });
          return;
        }
        const response: MovePieceResponse = await movePiece(
          gameId,
          {
            id: fullPiece.id,
            player: fullPiece.player,
            piece_type: fullPiece.pieceType,
            position: fullPiece.position,
            marking: fullPiece.marking,
            is_spy: fullPiece.isSpy,
          },
          { row, col },
        );
        if (response.status_code !== StatusCodes.OK) {
          setValidationError('Failed to move piece.');
          return;
        }
        const mappedPieces = response.pieces.map((p) =>
          createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
        );
        setGameState({
          allyPieces: mappedPieces.filter((p) => p.player === player),
          enemyPieces: mappedPieces.filter((p) => p.player !== player),
          capturedPieces: response.captured_pieces.map((p) =>
            createPieceInstance(p.id, p.player, p.piece_type, p.position, p.is_spy),
          ),
          gameEngine: new GameEngine(player, response.turn, mappedPieces),
          movement: response.movement,
          victoryState: response.victory_state,
        });
        setSelectedPieceState({
          piece: null,
          possiblePositions: [],
        });
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

    const board = new GameBoard(gameState.allyPieces);
    const surroundedPiece = gameState.allyPieces.find((p) => p.isPieceSurrounded(board));

    if (surroundedPiece) {
      setValidationError(
        `Illegal setup: Piece at ${surroundedPiece.position.row},${surroundedPiece.position.col} is surrounded.`,
      );
      return false;
    }
    try {
      await initializePieces(
        gameId,
        gameState.allyPieces.map((piece) => ({
          id: piece.id,
          player: piece.player,
          piece_type: piece.pieceType,
          position: piece.position,
          marking: piece.marking,
          is_spy: piece.isSpy,
        })),
      );
      setStage(Stage.WAITING);
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
        stage={stage}
        gameState={gameState}
        pieceCounts={pieceCounts}
        planningPhasePlacementMode={planningPhasePlacementMode}
        validationError={validationError}
        isPlayerTurn={gameState.gameEngine?.isPlayerTurn() ?? false}
        victoryState={gameState.victoryState}
        player={player}
        onPlacementModeButtonClick={setPlanningPhasePlacementMode}
        onLockPlacementClick={onLockPlacementClick}
      />

      <Board
        PLAYER_SIDE_ROWS={playerSideRows}
        gameState={gameState}
        stage={stage}
        selectedPieceState={selectedPieceState}
        isPlayerTurn={gameState.gameEngine?.isPlayerTurn() ?? false}
        onToggleEnemyMarking={onToggleEnemyMarking}
        handleSquareClick={handleSquareClick}
      />
    </div>
  );
}
