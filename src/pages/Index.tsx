import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SimulationParams, 
  SimulationState, 
  DataPoint, 
  defaultParams, 
  initializeState, 
  updateState 
} from '@/lib/physics';
import { ThreeScene } from '@/components/ThreeScene';
import { SimulationGraphs } from '@/components/SimulationGraphs';
import { ParameterControls } from '@/components/ParameterControls';
import { SimulationControls } from '@/components/SimulationControls';
import { DataDisplay } from '@/components/DataDisplay';

const Index = () => {
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [state, setState] = useState<SimulationState>(() => initializeState(params));
  const [dataHistory, setDataHistory] = useState<DataPoint[]>(() => {
    const initial = initializeState(defaultParams);
    return [{
      time: 0,
      doorA_omega: defaultParams.initialAngularVelocity,
      doorB_omega: defaultParams.initialAngularVelocity,
      doorA_I: initial.doorA.momentOfInertia,
      doorB_I: initial.doorB.momentOfInertia,
      doorA_L: initial.doorA.angularMomentum,
      doorB_L: initial.doorB.angularMomentum,
    }];
  });
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setState((prevState) => {
      if (!prevState.isRunning) return prevState;
      
      const newState = updateState(prevState, params, deltaTime);
      
      // Record data point every 50ms
      if (Math.floor(newState.time * 20) > Math.floor(prevState.time * 20)) {
        setDataHistory((prev) => [
          ...prev.slice(-200), // Keep last 200 points
          {
            time: newState.time,
            doorA_omega: newState.doorA.angularVelocity,
            doorB_omega: newState.doorB.angularVelocity,
            doorA_I: newState.doorA.momentOfInertia,
            doorB_I: newState.doorB.momentOfInertia,
            doorA_L: newState.doorA.angularMomentum,
            doorB_L: newState.doorB.angularMomentum,
          },
        ]);
      }
      
      return newState;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [params]);

  useEffect(() => {
    if (state.isRunning) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isRunning, animate]);

  const handleStart = () => {
    setState((prev) => ({ ...prev, isRunning: true, phase: 'phase1' }));
  };

  const handlePause = () => {
    setState((prev) => ({ ...prev, isRunning: false }));
  };

  const handleReset = () => {
    setState(initializeState(params));
    setDataHistory([{
      time: 0,
      doorA_omega: params.initialAngularVelocity,
      doorB_omega: params.initialAngularVelocity,
      doorA_I: initializeState(params).doorA.momentOfInertia,
      doorB_I: initializeState(params).doorB.momentOfInertia,
      doorA_L: initializeState(params).doorA.angularMomentum,
      doorB_L: initializeState(params).doorB.angularMomentum,
    }]);
    lastTimeRef.current = 0;
  };

  const handleParamsChange = (newParams: SimulationParams) => {
    setParams(newParams);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-6">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold font-mono text-foreground">
          <span className="text-primary">Conservation</span> of Angular Momentum
        </h1>
        <p className="text-muted-foreground mt-1 text-sm lg:text-base">
          Sliding-Mass Door System — Two-Door Comparison Simulation
        </p>
      </header>

      {/* Controls Bar */}
      <div className="simulation-panel mb-4 animate-slide-in">
        <SimulationControls 
          state={state}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Parameters */}
        <div className="lg:col-span-3 space-y-4">
          <div className="simulation-panel animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <ParameterControls 
              params={params}
              onParamsChange={handleParamsChange}
              disabled={state.isRunning}
            />
          </div>
          
          {/* Physics Info */}
          <div className="simulation-panel animate-slide-in text-xs font-mono" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-primary uppercase tracking-wider mb-3">Physics</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• L = I × ω (conserved)</p>
              <p>• I = I_d + m × r²</p>
              <p>• ω₂ = ω₁ × (I₁/I₂)</p>
              <p className="text-primary/70 pt-2 border-t border-border/50">
                As mass slides outward, I increases, so ω must decrease to conserve L.
              </p>
            </div>
          </div>
        </div>

        {/* Center Column - 3D View */}
        <div className="lg:col-span-5">
          <div className="simulation-panel h-[400px] lg:h-[500px] animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <ThreeScene state={state} params={params} />
          </div>
          
          {/* Data Display */}
          <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <DataDisplay state={state} />
          </div>
        </div>

        {/* Right Column - Graphs */}
        <div className="lg:col-span-4">
          <div className="simulation-panel h-[500px] lg:h-full animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <SimulationGraphs data={dataHistory} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-xs text-muted-foreground font-mono animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <p>Phase I: Door rotates, mass slides outward (Door A) — Angular momentum conserved</p>
        <p className="mt-1">
          <span className="text-primary">●</span> Door A (Sliding Mass) &nbsp;|&nbsp;
          <span className="text-accent">●</span> Door B (Standard)
        </p>
      </footer>
    </div>
  );
};

export default Index;
