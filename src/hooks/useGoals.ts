import { useState, useEffect } from 'react';
import { Goal, GoalStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const GOALS_KEY = 'roadmap_goals';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const stored = JSON.parse(localStorage.getItem(GOALS_KEY) || '[]');
      setGoals(stored.filter((g: Goal) => g.userId === user.id));
    } else {
      setGoals([]);
    }
    setLoading(false);
  }, [user]);

  const saveGoals = (newGoals: Goal[]) => {
    const allGoals = JSON.parse(localStorage.getItem(GOALS_KEY) || '[]');
    const otherGoals = allGoals.filter((g: Goal) => g.userId !== user?.id);
    localStorage.setItem(GOALS_KEY, JSON.stringify([...otherGoals, ...newGoals]));
    setGoals(newGoals);
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveGoals([...goals, newGoal]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const updated = goals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    saveGoals(updated);
  };

  const deleteGoal = async (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  const updateStatus = async (id: string, status: GoalStatus) => {
    await updateGoal(id, { status });
  };

  const getProgress = () => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.status === 'completed').length;
    return Math.round((completed / goals.length) * 100);
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal, updateStatus, getProgress };
}
