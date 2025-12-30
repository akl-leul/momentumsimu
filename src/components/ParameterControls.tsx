import { SimulationParams } from '@/lib/physics';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ParameterControlsProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  disabled?: boolean;
}

export const ParameterControls = ({ params, onParamsChange, disabled }: ParameterControlsProps) => {
  const updateParam = (key: keyof SimulationParams, value: number) => {
    onParamsChange({ ...params, [key]: value });
  };

  const controls = [
    {
      key: 'doorMass' as const,
      label: 'Door Mass (kg)',
      min: 10,
      max: 60,
      step: 1,
      value: params.doorMass,
    },
    {
      key: 'doorWidth' as const,
      label: 'Door Width (m)',
      min: 0.6,
      max: 1.4,
      step: 0.1,
      value: params.doorWidth,
    },
    {
      key: 'slidingMass' as const,
      label: 'Sliding Mass (kg)',
      min: 1,
      max: 15,
      step: 0.5,
      value: params.slidingMass,
    },
    {
      key: 'initialRadius' as const,
      label: 'Initial Radius r₁ (m)',
      min: 0.05,
      max: 0.3,
      step: 0.01,
      value: params.initialRadius,
    },
    {
      key: 'finalRadius' as const,
      label: 'Final Radius r₂ (m)',
      min: 0.4,
      max: 1.0,
      step: 0.05,
      value: params.finalRadius,
    },
    {
      key: 'initialAngularVelocity' as const,
      label: 'Initial ω₁ (rad/s)',
      min: 0.5,
      max: 4.0,
      step: 0.1,
      value: params.initialAngularVelocity,
    },
    {
      key: 'slideDuration' as const,
      label: 'Slide Duration (s)',
      min: 0.5,
      max: 3.0,
      step: 0.1,
      value: params.slideDuration,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-mono text-primary uppercase tracking-wider">
        Parameters
      </h3>
      
      <div className="space-y-4">
        {controls.map((control) => (
          <div key={control.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">
                {control.label}
              </Label>
              <span className="font-mono text-sm text-foreground">
                {control.value.toFixed(control.step < 1 ? 2 : 0)}
              </span>
            </div>
            <Slider
              value={[control.value]}
              onValueChange={(v) => updateParam(control.key, v[0])}
              min={control.min}
              max={control.max}
              step={control.step}
              disabled={disabled}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
