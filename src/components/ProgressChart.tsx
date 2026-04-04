import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressDataPoint {
  date: string;
  weight: number;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  exerciseName: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ProgressDataPoint;
  }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, exerciseName }) => {
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-3">
          <p className="text-white text-sm font-semibold">{payload[0].payload.date}</p>
          <p className="text-orange-400 text-lg font-bold">{payload[0].value} lbs</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#fb923c"
            strokeWidth={3}
            dot={{ fill: '#fb923c', r: 5 }}
            activeDot={{ r: 7, fill: '#f97316' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
