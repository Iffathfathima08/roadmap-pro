import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#4f46e5',
    lineColor: '#94a3b8',
    secondaryColor: '#e2e8f0',
    tertiaryColor: '#f8fafc',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
});

export function MermaidDiagram({ code, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code) return;
      
      try {
        setError(null);
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        containerRef.current.innerHTML = svg;
      } catch (err) {
        setError('Invalid Mermaid syntax');
        console.error('Mermaid error:', err);
      }
    };

    renderDiagram();
  }, [code]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-destructive/10 rounded-lg border border-destructive/20">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Button variant="outline" size="icon" onClick={() => handleZoom(0.1)}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleZoom(-0.1)}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setScale(1)}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
      </div>
      <div className="overflow-auto bg-card rounded-lg border border-border p-4">
        <div
          ref={containerRef}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          className="transition-transform"
        />
      </div>
    </div>
  );
}
