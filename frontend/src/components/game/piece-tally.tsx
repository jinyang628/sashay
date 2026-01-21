import { HandFistIcon } from '@/components/icons/lucide-hand-fist';
import { HighHeelIcon } from '@/components/icons/lucide-lab-high-heel';
import { VenetianMaskIcon } from '@/components/icons/lucide-venetian-mask';
import { Badge } from '@/components/ui/badge';

import { pieceTypeEnum } from '@/lib/game/base';
import { Piece as PieceClass } from '@/lib/game/engine';
import { cn } from '@/lib/utils';

interface PieceTallyProps {
  pieces: PieceClass[];
  isOpponent: boolean;
}

export default function PieceTally({ pieces, isOpponent }: PieceTallyProps) {
  return (
    <div>
      <h3 className={cn('mb-3 text-sm font-semibold tracking-wider uppercase')}>
        {isOpponent ? "Opponent's Pieces" : 'Your Pieces'}
      </h3>
      <div className="flex flex-col gap-2">
        <div
          className={cn('bg-background flex items-center justify-between rounded-lg border p-3')}
        >
          <div className="flex items-center gap-2">
            <HighHeelIcon className={cn('h-4 w-4', isOpponent && 'text-gray-200')} />
            <span className={cn('text-sm font-medium', isOpponent && 'text-gray-200')}>
              Dancers
            </span>
          </div>
          <Badge variant={isOpponent ? 'destructive' : 'secondary'}>
            {pieces.filter((p) => p.pieceType === pieceTypeEnum.enum.dancer && !p.isSpy).length}
          </Badge>
        </div>
        <div
          className={cn('bg-background flex items-center justify-between rounded-lg border p-3')}
        >
          <div className="flex items-center gap-2">
            <HandFistIcon className={cn('h-4 w-4', isOpponent && 'text-gray-200')} />
            <span className={cn('text-sm font-medium', isOpponent && 'text-gray-200')}>
              Masters
            </span>
          </div>
          <Badge variant={isOpponent ? 'destructive' : 'secondary'}>
            {pieces.filter((p) => p.pieceType === pieceTypeEnum.enum.master).length}
          </Badge>
        </div>
        <div
          className={cn('bg-background flex items-center justify-between rounded-lg border p-3')}
        >
          <div className="flex items-center gap-2">
            <VenetianMaskIcon className={cn('h-4 w-4', isOpponent && 'text-gray-200')} />
            <span className={cn('text-sm font-medium', isOpponent && 'text-gray-200')}>Spy</span>
          </div>
          <Badge
            variant={
              pieces.filter((p) => p.isSpy).length === 0
                ? 'destructive'
                : isOpponent
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {pieces.filter((p) => p.isSpy).length}
          </Badge>
        </div>
      </div>
    </div>
  );
}
