import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from '@/hooks/useGoals';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { BadgeDisplay } from '@/components/dashboard/BadgeDisplay';
import { GoalCard } from '@/components/goals/GoalCard';
import { Target, Map, Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const { goals, getProgress, updateStatus, deleteGoal } = useGoals();
  const { roadmaps } = useRoadmaps();

  const progress = getProgress();
  const activeGoals = goals.filter(g => g.status !== 'completed').slice(0, 3);
  const completedCount = goals.filter(g => g.status === 'completed').length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your learning progress overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Goals"
          value={goals.length}
          icon={Target}
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon={Trophy}
        />
        <StatsCard
          title="Roadmaps"
          value={roadmaps.length}
          icon={Map}
        />
        <StatsCard
          title="Current Streak"
          value={`${user?.currentStreak || 0} days`}
          icon={Flame}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Goals</h2>
              <Link to="/goals">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {activeGoals.length > 0 ? (
              <div className="space-y-3">
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => {}}
                    onDelete={deleteGoal}
                    onStatusChange={updateStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No active goals</p>
                <Link to="/goals">
                  <Button className="mt-3">Add Your First Goal</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
            <div className="flex justify-center">
              <ProgressRing progress={progress} size={140} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {completedCount} of {goals.length} goals completed
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Badges</h2>
            <BadgeDisplay earnedBadges={user?.badges || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
