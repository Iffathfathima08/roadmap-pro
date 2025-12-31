import { useState } from 'react';
import { usePredefinedRoadmaps, type PredefinedRoadmap, type RoadmapStep } from '@/hooks/usePredefinedRoadmaps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Map, Plus, Edit2, Trash2, ArrowLeft, Code, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DOMAINS = [
  'Full Stack Development',
  'Data Science & AI',
  'Cloud Computing',
  'Programming Languages',
  'DevOps',
  'Mobile Development',
  'Cybersecurity',
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const DEFAULT_ROADMAP: Omit<PredefinedRoadmap, 'id' | 'created_at' | 'updated_at'> = {
  domain: 'Full Stack Development',
  title: '',
  description: '',
  mermaid_code: `graph TD
    A[Start] --> B[Step 1]
    B --> C[Step 2]
    C --> D[Complete]`,
  steps: [],
  difficulty: 'beginner',
  estimated_duration: '3 months',
  tags: [],
  is_active: true,
  created_by: null,
};

export default function ManageRoadmaps() {
  const { user } = useAuth();
  const { roadmaps, isLoading, createRoadmap, updateRoadmap, deleteRoadmap } = usePredefinedRoadmaps();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<PredefinedRoadmap | null>(null);
  const [formData, setFormData] = useState(DEFAULT_ROADMAP);
  const [newTag, setNewTag] = useState('');

  const handleOpenCreate = () => {
    setEditingRoadmap(null);
    setFormData({ ...DEFAULT_ROADMAP, created_by: user?.id || null });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (roadmap: PredefinedRoadmap) => {
    setEditingRoadmap(roadmap);
    setFormData({
      domain: roadmap.domain,
      title: roadmap.title,
      description: roadmap.description || '',
      mermaid_code: roadmap.mermaid_code,
      steps: roadmap.steps,
      difficulty: roadmap.difficulty,
      estimated_duration: roadmap.estimated_duration || '',
      tags: roadmap.tags,
      is_active: roadmap.is_active,
      created_by: roadmap.created_by,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    if (editingRoadmap) {
      await updateRoadmap.mutateAsync({ id: editingRoadmap.id, ...formData });
    } else {
      await createRoadmap.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addStep = () => {
    const newStep: RoadmapStep = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      resources: [],
    };
    setFormData(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const updateStep = (index: number, updates: Partial<RoadmapStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, ...updates } : step)),
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Map className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold font-display">Roadmap Templates</h1>
            </div>
            <p className="text-muted-foreground">Create and manage predefined learning roadmaps</p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="col-span-full text-center py-8 text-muted-foreground">Loading templates...</p>
        ) : roadmaps.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-4">Create your first roadmap template to get started</p>
              <Button onClick={handleOpenCreate}>Create Template</Button>
            </CardContent>
          </Card>
        ) : (
          roadmaps.map((roadmap) => (
            <Card key={roadmap.id} className="shadow-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{roadmap.domain}</Badge>
                    <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{roadmap.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{roadmap.steps.length} steps</span>
                  <span className="text-border">•</span>
                  <Badge variant="secondary" className="capitalize">{roadmap.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {roadmap.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                  {roadmap.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{roadmap.tags.length - 3}</Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(roadmap)} className="flex-1 gap-1">
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRoadmap.mutate(roadmap.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoadmap ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              {editingRoadmap ? 'Update the roadmap template details' : 'Create a new predefined roadmap template'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Domain</Label>
                <Select value={formData.domain} onValueChange={(v) => setFormData(prev => ({ ...prev, domain: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Full Stack Web Developer Roadmap"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A brief description of this roadmap..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Duration</Label>
              <Input
                value={formData.estimated_duration || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                placeholder="e.g., 6 months"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Mermaid Diagram Code
              </Label>
              <Textarea
                value={formData.mermaid_code}
                onChange={(e) => setFormData(prev => ({ ...prev, mermaid_code: e.target.value }))}
                className="font-mono text-sm"
                rows={6}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Learning Steps</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Add Step
                </Button>
              </div>
              {formData.steps.map((step, index) => (
                <div key={step.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Step {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(index)} className="ml-auto h-6 px-2 text-destructive">
                      Remove
                    </Button>
                  </div>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(index, { title: e.target.value })}
                    placeholder="Step title"
                  />
                  <Textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, { description: e.target.value })}
                    placeholder="Step description"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
              {editingRoadmap ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
