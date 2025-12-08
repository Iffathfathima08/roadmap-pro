import { BADGE_DEFINITIONS } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  earnedBadges: string[];
  className?: string;
}

export function BadgeDisplay({ earnedBadges, className }: BadgeDisplayProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {BADGE_DEFINITIONS.map((badge) => {
        const isEarned = earnedBadges.includes(badge.id);
        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all',
                  isEarned 
                    ? 'bg-primary/10 shadow-md' 
                    : 'bg-muted/50 opacity-40 grayscale'
                )}
              >
                {badge.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-semibold">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
