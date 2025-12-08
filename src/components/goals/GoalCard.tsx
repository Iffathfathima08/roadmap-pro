import { Goal, GoalStatus } from '@/types';
import { Calendar, MoreVertical, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: GoalStatus) => void;
}

const statusConfig = {
  'not-started': { label: 'Not Started', icon: Circle, color: 'text-muted-foreground' },
  'in-progress': { label: 'In Progress', icon: Clock, color: 'text-warning' },
  'completed': { label: 'Completed', icon: CheckCircle2, color: 'text-success' },
};

export function GoalCard({ goal, onEdit, onDelete, onStatusChange }: GoalCardProps) {
  const status = statusConfig[goal.status];
  const StatusIcon = status.icon;
  const deadline = new Date(goal.deadline);
  const isOverdue = deadline < new Date() && goal.status !== 'completed';

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => {
              const nextStatus: GoalStatus = 
                goal.status === 'not-started' ? 'in-progress' :
                goal.status === 'in-progress' ? 'completed' : 'not-started';
              onStatusChange(goal.id, nextStatus);
            }}
            className={cn('mt-1 transition-colors', status.color)}
          >
            <StatusIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold truncate',
              goal.status === 'completed' && 'line-through text-muted-foreground'
            )}>
              {goal.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {goal.description}
            </p>
            <div className={cn(
              'flex items-center gap-1.5 mt-2 text-xs',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{deadline.toLocaleDateString()}</span>
              {isOverdue && <span className="font-medium">(Overdue)</span>}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(goal)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(goal.id, 'not-started')}>
              Mark Not Started
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(goal.id, 'in-progress')}>
              Mark In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(goal.id, 'completed')}>
              Mark Completed
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(goal.id)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
