import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DataPoint } from '@/lib/physics';

interface SimulationGraphsProps {
  data: DataPoint[];
}

export const SimulationGraphs = ({ data }: SimulationGraphsProps) => {
  const commonProps = {
    margin: { top: 10, right: 20, left: 10, bottom: 5 },
  };

  const gridProps = {
    strokeDasharray: "3 3",
    stroke: "hsl(var(--grid-line))",
    strokeOpacity: 0.5,
  };

  const axisProps = {
    tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 },
    axisLine: { stroke: 'hsl(var(--border))' },
    tickLine: { stroke: 'hsl(var(--border))' },
  };

  const formatNumber = (value: number) => value.toFixed(2);

  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      {/* Angular Velocity Graph */}
      <div className="graph-container p-4">
        <h3 className="text-sm font-mono text-primary mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
          Angular Velocity ω (rad/s)
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} tickFormatter={formatNumber} />
            <YAxis {...axisProps} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(value) => `t = ${Number(value).toFixed(2)}s`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="doorA_omega"
              name="Door A"
              stroke="hsl(var(--door-a))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="doorB_omega"
              name="Door B"
              stroke="hsl(var(--door-b))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Moment of Inertia Graph */}
      <div className="graph-container p-4">
        <h3 className="text-sm font-mono text-primary mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full" />
          Moment of Inertia I (kg⋅m²)
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} tickFormatter={formatNumber} />
            <YAxis {...axisProps} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(value) => `t = ${Number(value).toFixed(2)}s`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="doorA_I"
              name="Door A"
              stroke="hsl(var(--door-a))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="doorB_I"
              name="Door B"
              stroke="hsl(var(--door-b))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Angular Momentum Graph */}
      <div className="graph-container p-4">
        <h3 className="text-sm font-mono text-primary mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full" />
          Angular Momentum L (kg⋅m²/s)
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} tickFormatter={formatNumber} />
            <YAxis {...axisProps} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(value) => `t = ${Number(value).toFixed(2)}s`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="doorA_L"
              name="Door A"
              stroke="hsl(var(--door-a))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="doorB_L"
              name="Door B"
              stroke="hsl(var(--door-b))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
