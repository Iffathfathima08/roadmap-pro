import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type GoalStatus = 'not-started' | 'in-progress' | 'completed';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  deadline: string;
  status: GoalStatus;
  roadmapId?: string;
  createdAt: string;
  updatedAt: string;
}

export function useGoals() {
  const { user, session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!session?.user?.id) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
      return;
    }

    const mappedGoals: Goal[] = (data || []).map(g => ({
      id: g.id,
      userId: g.user_id,
      title: g.title,
      description: g.description || '',
      deadline: g.deadline || '',
      status: (g.status as GoalStatus) || 'not-started',
      roadmapId: g.roadmap_id || undefined,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    }));

    setGoals(mappedGoals);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [session?.user?.id]);

  const addGoal = async (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: session.user.id,
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline || null,
        status: goal.status,
        roadmap_id: goal.roadmapId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding goal:', error);
      throw new Error(error.message);
    }

    const newGoal: Goal = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description || '',
      deadline: data.deadline || '',
      status: (data.status as GoalStatus) || 'not-started',
      roadmapId: data.roadmap_id || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.roadmapId !== undefined) dbUpdates.roadmap_id = updates.roadmapId || null;

    const { error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating goal:', error);
      throw new Error(error.message);
    }

    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    ));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw new Error(error.message);
    }

    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateStatus = async (id: string, status: GoalStatus) => {
    await updateGoal(id, { status });
  };

  const getProgress = () => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.status === 'completed').length;
    return Math.round((completed / goals.length) * 100);
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal, updateStatus, getProgress, refetch: fetchGoals };
}
