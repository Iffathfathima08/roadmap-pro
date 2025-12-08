import { useState } from 'react';
import { Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MermaidDiagram } from './MermaidDiagram';
import { cn } from '@/lib/utils';

interface MermaidEditorProps {
  code: string;
  onChange: (code: string) => void;
  className?: string;
}

export function MermaidEditor({ code, onChange, className }: MermaidEditorProps) {
  const [view, setView] = useState<'code' | 'preview' | 'split'>('split');

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'code' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('code')}
        >
          <Code className="w-4 h-4 mr-1" />
          Code
        </Button>
        <Button
          variant={view === 'preview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('preview')}
        >
          <Eye className="w-4 h-4 mr-1" />
          Preview
        </Button>
        <Button
          variant={view === 'split' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('split')}
        >
          Split
        </Button>
      </div>

      <div className={cn(
        'grid gap-4',
        view === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'
      )}>
        {(view === 'code' || view === 'split') && (
          <div>
            <Textarea
              value={code}
              onChange={(e) => onChange(e.target.value)}
              className="font-mono text-sm min-h-[300px] resize-none"
              placeholder="Enter Mermaid code..."
            />
          </div>
        )}
        {(view === 'preview' || view === 'split') && (
          <MermaidDiagram code={code} />
        )}
      </div>
    </div>
  );
}
