import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-1',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              {trend.positive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
