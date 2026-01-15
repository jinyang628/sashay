'use client';

import React, { useState } from 'react';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { HandFistIcon } from '@/components/icons/lucide-hand-fist';
import { HighHeelIcon } from '@/components/icons/lucide-lab-high-heel';
import { VenetianMaskIcon } from '@/components/icons/lucide-venetian-mask';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { PIECE_LIMITS, PlanningPhasePlacementMode } from '@/lib/game/base';

interface SidebarProps {
  pieceCounts: {
    DANCER: number;
    MASTER: number;
    SPY: number;
  };
  planningPhasePlacementMode: PlanningPhasePlacementMode;
  validationError: string | null;
  onPlacementModeButtonClick: (mode: PlanningPhasePlacementMode) => void;
  onLockPlacementClick: () => Promise<boolean>;
}

enum PlanningState {
  planning = 'planning',
  initializing = 'initializing',
  locked = 'locked',
}

export default function Sidebar({
  pieceCounts,
  planningPhasePlacementMode,
  validationError,
  onPlacementModeButtonClick,
  onLockPlacementClick,
}: SidebarProps) {
  const [planningState, setPlanningState] = useState(PlanningState.planning);

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
      Mode{' '}
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

  return (
    <Card className="bg-muted/30 flex w-82 flex-col gap-6 p-6">
      <h2 className="mb-2 text-center text-xl font-bold tracking-tight">Assemble your team</h2>

      <div className="flex flex-col gap-3">
        {dancerPlacementButton}
        {masterPlacementButton}
        {spyPlacementButton}
      </div>

      <div className="mt-auto space-y-4">
        {validationError && (
          <div className="text-destructive bg-destructive/10 animate-in fade-in slide-in-from-top-1 flex justify-center gap-2 rounded-md p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
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
            'Lock Placement'
          )}
        </Button>
      </div>
    </Card>
  );
}
