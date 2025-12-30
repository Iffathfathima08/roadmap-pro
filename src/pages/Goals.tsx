import { useState } from 'react';
import { useGoals, Goal } from '@/hooks/useGoals';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, updateStatus } = useGoals();
  const { createRoadmap, generateAIRoadmap } = useRoadmaps();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [search, setSearch] = useState('');
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const filteredGoals = goals.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
      toast.success('Goal updated!');
    } else {
      try {
        setGeneratingRoadmap(true);
        const newGoal = await addGoal(data);
        
        if (newGoal) {
          toast.success('Goal created!', {
            description: 'Generating your personalized roadmap...',
          });

          // Generate AI roadmap for the new goal
          const roadmapData = await generateAIRoadmap(
            newGoal.title,
            newGoal.description,
            newGoal.deadline
          );

          // Create the roadmap in the database
          const roadmap = await createRoadmap(
            roadmapData.title,
            roadmapData.description,
            [newGoal.id],
            roadmapData.mermaidCode
          );

          if (roadmap) {
            // Link the goal to the roadmap
            await updateGoal(newGoal.id, { roadmapId: roadmap.id });
            
            toast.success('🗺️ Roadmap generated!', {
              description: 'Check the Roadmaps page to see your learning journey',
            });
          }
        }
      } catch (error) {
        console.error('Error creating goal/roadmap:', error);
        toast.error('Goal created but roadmap generation failed');
      } finally {
        setGeneratingRoadmap(false);
      }
    }
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Manage your learning goals</p>
        </div>
        <Button 
          onClick={() => { setEditingGoal(null); setFormOpen(true); }}
          disabled={generatingRoadmap}
        >
          {generatingRoadmap ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </>
          )}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGoals.length > 0 ? (
        <div className="grid gap-3">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={deleteGoal}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first learning goal - we'll create a personalized roadmap for you!
          </p>
          <Button onClick={() => setFormOpen(true)} disabled={generatingRoadmap}>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      )}

      <GoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingGoal}
      />
    </div>
  );
}
