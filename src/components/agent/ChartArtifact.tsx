import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ChartArtifactData } from '../../data/agent-mock-dialogs';

const DEFAULT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

interface ChartArtifactProps {
  config: ChartArtifactData;
}

export function ChartArtifact({ config }: ChartArtifactProps) {
  const { chartType, title, data, xKey, yKeys, colors } = config;
  const palette = colors ?? DEFAULT_COLORS;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 px-1">{title}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(chartType, data, xKey, yKeys, palette)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' },
};

function renderChart(
  chartType: ChartArtifactData['chartType'],
  data: Record<string, unknown>[],
  xKey: string,
  yKeys: string[],
  palette: string[],
) {
  switch (chartType) {
    case 'bar':
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          {yKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={palette[i % palette.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      );
    case 'line':
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          {yKeys.map((key, i) => (
            <Line key={key} dataKey={key} stroke={palette[i % palette.length]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      );
    case 'area':
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          {yKeys.map((key, i) => (
            <Area
              key={key}
              dataKey={key}
              stroke={palette[i % palette.length]}
              fill={palette[i % palette.length]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      );
    case 'pie': {
      const pieData = data.map((d) => ({ name: d[xKey] as string, value: d[yKeys[0]] as number }));
      return (
        <PieChart>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
            {pieData.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    }
  }
}
