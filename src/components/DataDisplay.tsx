import { SimulationState } from '@/lib/physics';

interface DataDisplayProps {
  state: SimulationState;
}

export const DataDisplay = ({ state }: DataDisplayProps) => {
  const DataCard = ({ 
    title, 
    color, 
    data 
  }: { 
    title: string; 
    color: 'primary' | 'accent';
    data: { label: string; value: string; unit: string }[];
  }) => (
    <div className={`simulation-panel space-y-3 ${color === 'primary' ? 'border-primary/30' : 'border-accent/30'}`}>
      <h4 className={`font-mono text-sm uppercase tracking-wider ${color === 'primary' ? 'text-primary' : 'text-accent'}`}>
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.label} className="space-y-1">
            <span className="control-label">{item.label}</span>
            <div className="data-value">
              {item.value}
              <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <DataCard
        title="Door A (Sliding Mass)"
        color="primary"
        data={[
          { label: 'ω', value: state.doorA.angularVelocity.toFixed(3), unit: 'rad/s' },
          { label: 'I', value: state.doorA.momentOfInertia.toFixed(3), unit: 'kg⋅m²' },
          { label: 'L', value: state.doorA.angularMomentum.toFixed(3), unit: 'kg⋅m²/s' },
          { label: 'r', value: state.doorA.massRadius.toFixed(3), unit: 'm' },
        ]}
      />
      <DataCard
        title="Door B (Standard)"
        color="accent"
        data={[
          { label: 'ω', value: state.doorB.angularVelocity.toFixed(3), unit: 'rad/s' },
          { label: 'I', value: state.doorB.momentOfInertia.toFixed(3), unit: 'kg⋅m²' },
          { label: 'L', value: state.doorB.angularMomentum.toFixed(3), unit: 'kg⋅m²/s' },
          { label: 'θ', value: (state.doorB.angle % (2 * Math.PI)).toFixed(3), unit: 'rad' },
        ]}
      />
    </div>
  );
};
