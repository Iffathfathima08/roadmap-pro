import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  resources?: { title: string; url: string; type: 'video' | 'article' | 'course' }[];
  completed?: boolean;
}

export interface PredefinedRoadmap {
  id: string;
  domain: string;
  title: string;
  description: string | null;
  mermaid_code: string;
  steps: RoadmapStep[];
  difficulty: string;
  estimated_duration: string | null;
  tags: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function usePredefinedRoadmaps(domain?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roadmaps = [], isLoading, error } = useQuery({
    queryKey: ['predefined-roadmaps', domain],
    queryFn: async () => {
      let query = supabase
        .from('predefined_roadmaps')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (domain) {
        query = query.eq('domain', domain);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        steps: (item.steps as unknown as RoadmapStep[]) || [],
        tags: Array.isArray(item.tags) ? item.tags : [],
      })) as PredefinedRoadmap[];
    },
  });

  const createRoadmap = useMutation({
    mutationFn: async (roadmap: Omit<PredefinedRoadmap, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('predefined_roadmaps')
        .insert({
          ...roadmap,
          steps: JSON.parse(JSON.stringify(roadmap.steps)),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predefined-roadmaps'] });
      toast({ title: 'Roadmap template created!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRoadmap = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PredefinedRoadmap> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.steps) {
        updateData.steps = JSON.parse(JSON.stringify(updates.steps));
      }
      
      const { data, error } = await supabase
        .from('predefined_roadmaps')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predefined-roadmaps'] });
      toast({ title: 'Roadmap template updated!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRoadmap = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('predefined_roadmaps')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predefined-roadmaps'] });
      toast({ title: 'Roadmap template deleted!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const domains = [...new Set(roadmaps.map(r => r.domain))];

  return {
    roadmaps,
    domains,
    isLoading,
    error,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
  };
}
