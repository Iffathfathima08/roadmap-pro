import { useState } from 'react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useGoals } from '@/hooks/useGoals';
import { MermaidEditor } from '@/components/roadmap/MermaidEditor';
import { MermaidDiagram } from '@/components/roadmap/MermaidDiagram';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Map, Trash2, Edit2 } from 'lucide-react';

export default function Roadmaps() {
  const { roadmaps, createRoadmap, updateMermaidCode, deleteRoadmap } = useRoadmaps();
  const { goals } = useGoals();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title) return;
    await createRoadmap(title, description, goals);
    setTitle('');
    setDescription('');
    setCreateOpen(false);
  };

  const activeRoadmap = roadmaps.find(r => r.id === selectedRoadmap);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Roadmaps</h1>
          <p className="text-muted-foreground">Visualize your learning paths</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Roadmap
        </Button>
      </div>

      {roadmaps.length === 0 ? (
        <div className="text-center py-12">
          <Map className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No roadmaps yet</h3>
          <p className="text-muted-foreground mb-4">
            Create a roadmap from your goals to visualize your learning path
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Roadmap
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {roadmaps.map(roadmap => (
              <div
                key={roadmap.id}
                onClick={() => setSelectedRoadmap(roadmap.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRoadmap === roadmap.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{roadmap.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {roadmap.description || 'No description'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {roadmap.goalIds.length} goals
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoadmap(roadmap.id);
                      if (selectedRoadmap === roadmap.id) setSelectedRoadmap(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {activeRoadmap ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{activeRoadmap.title}</h2>
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <MermaidEditor
                  code={activeRoadmap.mermaidCode}
                  onChange={(code) => updateMermaidCode(activeRoadmap.id, code)}
                />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Map className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Select a roadmap to view and edit
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Roadmap</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Learning Path"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this roadmap about?"
                rows={3}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will create a roadmap from your {goals.length} current goals.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!title}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
