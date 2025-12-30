import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  description: string;
  mermaidCode: string;
  goalIds: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export function useRoadmaps() {
  const { session } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoadmaps = async () => {
    if (!session?.user?.id) {
      setRoadmaps([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roadmaps:', error);
      setLoading(false);
      return;
    }

    const mappedRoadmaps: Roadmap[] = (data || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description || '',
      mermaidCode: r.mermaid_code || '',
      goalIds: r.goal_ids || [],
      progress: r.progress || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    setRoadmaps(mappedRoadmaps);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [session?.user?.id]);

  const generateAIRoadmap = async (goalTitle: string, goalDescription: string, deadline?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { goalTitle, goalDescription, deadline },
      });

      if (error) {
        console.error('Error generating roadmap:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to generate AI roadmap:', error);
      // Return fallback roadmap
      return {
        title: `Roadmap to: ${goalTitle}`,
        description: `A step-by-step journey to achieve: ${goalTitle}`,
        mermaidCode: `flowchart TD
    Start([🎯 Start: ${goalTitle}])
    Step1[📚 Research & Plan]
    Step2[💡 Learn Basics]
    Step3[💻 Practice]
    Step4[🔧 Build Projects]
    Step5[✅ Review & Refine]
    End([🏆 Goal Achieved!])
    Start --> Step1
    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Step5
    Step5 --> End`,
      };
    }
  };

  const createRoadmap = async (title: string, description: string, goalIds: string[], mermaidCode?: string) => {
    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from('roadmaps')
      .insert({
        user_id: session.user.id,
        title,
        description,
        mermaid_code: mermaidCode || '',
        goal_ids: goalIds,
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating roadmap:', error);
      throw new Error(error.message);
    }

    const newRoadmap: Roadmap = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description || '',
      mermaidCode: data.mermaid_code || '',
      goalIds: data.goal_ids || [],
      progress: data.progress || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setRoadmaps(prev => [newRoadmap, ...prev]);
    return newRoadmap;
  };

  const updateRoadmap = async (id: string, updates: Partial<Roadmap>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.mermaidCode !== undefined) dbUpdates.mermaid_code = updates.mermaidCode;
    if (updates.goalIds !== undefined) dbUpdates.goal_ids = updates.goalIds;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;

    const { error } = await supabase
      .from('roadmaps')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating roadmap:', error);
      throw new Error(error.message);
    }

    setRoadmaps(prev => prev.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ));
  };

  const deleteRoadmap = async (id: string) => {
    const { error } = await supabase
      .from('roadmaps')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting roadmap:', error);
      throw new Error(error.message);
    }

    setRoadmaps(prev => prev.filter(r => r.id !== id));
  };

  const updateMermaidCode = async (id: string, mermaidCode: string) => {
    await updateRoadmap(id, { mermaidCode });
  };

  return {
    roadmaps,
    loading,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    updateMermaidCode,
    generateAIRoadmap,
    refetch: fetchRoadmaps,
  };
}
