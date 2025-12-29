import { SimulationState } from '@/lib/physics';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationControlsProps {
  state: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const SimulationControls = ({ state, onStart, onPause, onReset }: SimulationControlsProps) => {
  return (
    <div className="flex items-center gap-3">
      {!state.isRunning ? (
        <Button
          onClick={onStart}
          variant="default"
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-mono glow-primary"
        >
          <Play className="w-5 h-5" />
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          variant="secondary"
          size="lg"
          className="gap-2 font-mono"
        >
          <Pause className="w-5 h-5" />
          Pause
        </Button>
      )}

      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        className="gap-2 font-mono"
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </Button>

      <div className="ml-4 flex items-center gap-6 font-mono text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Time:</span>
          <span className="text-foreground">{state.time.toFixed(2)}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Phase:</span>
          <span className={`capitalize ${state.phase === 'phase1' ? 'text-primary' : state.phase === 'phase2' ? 'text-accent' : 'text-muted-foreground'}`}>
            {state.phase === 'idle' ? 'Ready' : state.phase === 'phase1' ? 'Sliding' : 'Complete'}
          </span>
        </div>
      </div>
    </div>
  );
};
