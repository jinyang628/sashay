'use client';

import React from 'react';

import { AlertCircle } from 'lucide-react';

import { HandFistIcon } from '@/components/icons/lucide-hand-fist';
import { HighHeelIcon } from '@/components/icons/lucide-lab-high-heel';
import { VenetianMaskIcon } from '@/components/icons/lucide-venetian-mask';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { PIECE_LIMITS, PlacementMode } from '@/lib/game/base';

interface SidebarProps {
  pieceCounts: {
    DANCER: number;
    MASTER: number;
    SPY: number;
  };
  selectedMode: PlacementMode;
  validationError: string | null;
  onPlacementButtonClick: (mode: PlacementMode) => void;
  onLockPlacementClick: () => void;
}

export default function Sidebar({
  pieceCounts,
  selectedMode,
  validationError,
  onPlacementButtonClick,
  onLockPlacementClick,
}: SidebarProps) {
  const dancerPlacementButton = (
    <Button
      variant={selectedMode === 'DANCER' ? 'default' : 'outline'}
      className="h-14 justify-between"
      onClick={() => onPlacementButtonClick(PlacementMode.DANCER)}
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
      variant={selectedMode === 'MASTER' ? 'default' : 'outline'}
      className="h-14 justify-between"
      onClick={() => onPlacementButtonClick(PlacementMode.MASTER)}
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
      variant={selectedMode === 'SPY' ? 'default' : 'outline'}
      className="h-14 justify-between border-red-200 hover:border-red-300"
      onClick={() => onPlacementButtonClick(PlacementMode.SPY)}
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
    <Card className="bg-muted/30 flex w-72 flex-col gap-6 p-6">
      <h2 className="mb-2 text-center text-xl font-bold tracking-tight">Assemble your team</h2>

      <div className="flex flex-col gap-3">
        {dancerPlacementButton}
        {masterPlacementButton}
        {spyPlacementButton}
      </div>

      <div className="mt-auto space-y-4">
        {validationError && (
          <div className="text-destructive bg-destructive/10 animate-in fade-in slide-in-from-top-1 flex items-start gap-2 rounded-md p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
        <Button className="w-full shadow-lg" size="lg" onClick={onLockPlacementClick}>
          Lock Placement
        </Button>
      </div>
    </Card>
  );
}
