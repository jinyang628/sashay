'use client';

import { useRouter } from 'next/navigation';

import React, { useState } from 'react';

import { CheckCircle2, Loader2 } from 'lucide-react';

import { HandFistIcon } from '@/components/icons/lucide-hand-fist';
import { HighHeelIcon } from '@/components/icons/lucide-lab-high-heel';
import { VenetianMaskIcon } from '@/components/icons/lucide-venetian-mask';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { Stage } from '@/types/game';

import {
  PIECE_LIMITS,
  PlanningPhasePlacementMode,
  Player,
  VictoryState,
  victoryTypeEnum,
} from '@/lib/game/base';

interface SidebarProps {
  stage: Stage;
  pieceCounts: {
    DANCER: number;
    MASTER: number;
    SPY: number;
  };
  planningPhasePlacementMode: PlanningPhasePlacementMode;
  validationError: string | null;
  isPlayerTurn: boolean;
  victoryState: VictoryState | null;
  player: Player | null;
  onPlacementModeButtonClick: (mode: PlanningPhasePlacementMode) => void;
  onLockPlacementClick: () => Promise<boolean>;
}

enum PlanningState {
  planning = 'planning',
  initializing = 'initializing',
  locked = 'locked',
}

export default function Sidebar({
  stage,
  pieceCounts,
  planningPhasePlacementMode,
  validationError,
  isPlayerTurn,
  victoryState,
  player,
  onPlacementModeButtonClick,
  onLockPlacementClick,
}: SidebarProps) {
  const [planningState, setPlanningState] = useState(PlanningState.planning);
  const router = useRouter();

  const handleLockPlacement = async () => {
    setPlanningState(PlanningState.initializing);
    try {
      const isPlacementValid: boolean = await onLockPlacementClick();
      if (isPlacementValid) {
        setPlanningState(PlanningState.locked);
      } else {
        setPlanningState(PlanningState.planning);
      }
    } catch (error) {
      setPlanningState(PlanningState.planning);
    }
  };
  const dancerPlacementButton = (
    <Button
      variant={planningPhasePlacementMode === 'DANCER' ? 'default' : 'outline'}
      className="h-14 justify-between"
      onClick={() => onPlacementModeButtonClick(PlanningPhasePlacementMode.DANCER)}
    >
      <div className="flex items-center gap-3">
        <HighHeelIcon className="h-5 w-5" />
        <div className="flex flex-col items-start leading-tight">
          <span className="font-semibold">Dancer</span>
          <span className="text-[10px] opacity-70">Moves unlimited cardinal</span>
        </div>
      </div>
      <Badge variant="secondary">{PIECE_LIMITS.DANCER - pieceCounts.DANCER}</Badge>
    </Button>
  );

  const masterPlacementButton = (
    <Button
      variant={planningPhasePlacementMode === 'MASTER' ? 'default' : 'outline'}
      className="h-14 justify-between"
      onClick={() => onPlacementModeButtonClick(PlanningPhasePlacementMode.MASTER)}
    >
      <div className="flex items-center gap-3">
        <HandFistIcon className="h-5 w-5" />
        <div className="flex flex-col items-start leading-tight">
          <span className="font-semibold">Master</span>
          <span className="text-[10px] opacity-70">Diagonal & Step moves</span>
        </div>
      </div>
      <Badge variant="secondary">{PIECE_LIMITS.MASTER - pieceCounts.MASTER}</Badge>
    </Button>
  );

  const spyPlacementButton = (
    <Button
      variant={planningPhasePlacementMode === 'SPY' ? 'default' : 'outline'}
      className="h-14 justify-between border-red-200 hover:border-red-300"
      onClick={() => onPlacementModeButtonClick(PlanningPhasePlacementMode.SPY)}
    >
      <div className="flex items-center gap-3">
        <VenetianMaskIcon className="h-5 w-5 text-red-500" />
        <div className="flex flex-col items-start leading-tight">
          <span className="font-semibold text-red-600">The Spy</span>
          <span className="text-[10px] opacity-70">Your win condition</span>
        </div>
      </div>
      <Badge variant={pieceCounts.SPY === 1 ? 'outline' : 'destructive'}>
        {PIECE_LIMITS.SPY - pieceCounts.SPY}
      </Badge>
    </Button>
  );

  const gameOverComponent = (
    <>
      <h2 className="mb-2 text-center text-xl font-bold tracking-tight">Game Over</h2>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight">
            {player && victoryState?.player === player ? 'You won' : 'You lost'}
          </p>
          {(() => {
            const isPlayerWinner = player && victoryState?.player === player;
            const isSpyInfiltrated =
              victoryState?.victory_type === victoryTypeEnum.enum.ally_spy_infiltrated;
            const message = isPlayerWinner
              ? isSpyInfiltrated
                ? 'Congratulations — your spy has infiltrated enemy lines.'
                : "Congratulations — you've captured the enemy's spy."
              : isSpyInfiltrated
                ? "The enemy's spy has infiltrated your lines. Better luck next time."
                : 'Your spy has been captured. Better luck next time.';
            return <p className="text-muted-foreground text-sm">{message}</p>;
          })()}
        </div>
        <Button className="w-full cursor-pointer" size="lg" onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </div>
    </>
  );

  return (
    <Card className="bg-muted/30 flex w-82 flex-col gap-6 p-6">
      {victoryState ? (
        gameOverComponent
      ) : (
        <>
          {stage === Stage.PLANNING ? (
            <h2 className="mb-2 text-center text-xl font-bold tracking-tight">
              Assemble your team
            </h2>
          ) : stage === Stage.WAITING ? (
            <h2 className="mb-2 text-center text-xl font-bold tracking-tight">
              Waiting for opponent
            </h2>
          ) : (
            <h2 className="mb-2 text-center text-xl font-bold tracking-tight">
              {isPlayerTurn ? 'Your turn' : "Opponent's turn"}
            </h2>
          )}

          {stage === Stage.PLANNING && (
            <div className="flex flex-1 flex-col">
              <div className="flex flex-col gap-3">
                {dancerPlacementButton}
                {masterPlacementButton}
                {spyPlacementButton}
              </div>
              <div className="mt-auto flex flex-col gap-3">
                {validationError && <p className="text-center text-red-500">{validationError}</p>}
                <Button
                  className="w-full shadow-lg"
                  size="lg"
                  disabled={planningState !== PlanningState.planning}
                  onClick={handleLockPlacement}
                >
                  {planningState === PlanningState.initializing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : planningState === PlanningState.locked ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Waiting for opponent to finish
                    </span>
                  ) : (
                    'Lock placement'
                  )}
                </Button>
              </div>
            </div>
          )}

          {stage === Stage.ACTIVE && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="text-muted-foreground text-center">Active game placeholder</p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
