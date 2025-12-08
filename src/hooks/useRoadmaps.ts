import { useState, useEffect } from 'react';
import { Roadmap, Goal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const ROADMAPS_KEY = 'roadmap_roadmaps';

export function useRoadmaps() {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const stored = JSON.parse(localStorage.getItem(ROADMAPS_KEY) || '[]');
      setRoadmaps(stored.filter((r: Roadmap) => r.userId === user.id));
    } else {
      setRoadmaps([]);
    }
    setLoading(false);
  }, [user]);

  const saveRoadmaps = (newRoadmaps: Roadmap[]) => {
    const allRoadmaps = JSON.parse(localStorage.getItem(ROADMAPS_KEY) || '[]');
    const otherRoadmaps = allRoadmaps.filter((r: Roadmap) => r.userId !== user?.id);
    localStorage.setItem(ROADMAPS_KEY, JSON.stringify([...otherRoadmaps, ...newRoadmaps]));
    setRoadmaps(newRoadmaps);
  };

  const generateMermaidFromGoals = (goals: Goal[], title: string): string => {
    if (goals.length === 0) {
      return `flowchart TD\n    Start[${title}]\n    Start --> Goal1[Add your first goal]`;
    }

    let code = `flowchart TD\n    Start([${title}])`;
    
    goals.forEach((goal, index) => {
      const nodeId = `Goal${index + 1}`;
      const status = goal.status === 'completed' ? '✅' : goal.status === 'in-progress' ? '🔄' : '⬜';
      const shape = goal.status === 'completed' ? `[${status} ${goal.title}]` : `[${status} ${goal.title}]`;
      
      if (index === 0) {
        code += `\n    Start --> ${nodeId}${shape}`;
      } else {
        code += `\n    Goal${index} --> ${nodeId}${shape}`;
      }
    });

    code += `\n    Goal${goals.length} --> End([Complete!])`;
    return code;
  };

  const createRoadmap = async (title: string, description: string, goals: Goal[]) => {
    if (!user) return;
    
    const roadmap: Roadmap = {
      id: crypto.randomUUID(),
      userId: user.id,
      title,
      description,
      mermaidCode: generateMermaidFromGoals(goals, title),
      goalIds: goals.map(g => g.id),
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveRoadmaps([...roadmaps, roadmap]);
    return roadmap;
  };

  const updateRoadmap = async (id: string, updates: Partial<Roadmap>) => {
    const updated = roadmaps.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    saveRoadmaps(updated);
  };

  const deleteRoadmap = async (id: string) => {
    saveRoadmaps(roadmaps.filter(r => r.id !== id));
  };

  const updateMermaidCode = async (id: string, mermaidCode: string) => {
    await updateRoadmap(id, { mermaidCode });
  };

  return { roadmaps, loading, createRoadmap, updateRoadmap, deleteRoadmap, updateMermaidCode, generateMermaidFromGoals };
}
