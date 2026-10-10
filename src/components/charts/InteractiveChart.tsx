import React, { useState } from 'react';

interface DataPoint {
  date: string;
  strategy: number;
  benchmark: number;
  drawdown?: number;
}

interface InteractiveChartProps {
  data: DataPoint[];
  tradeMarkers?: { date: string; side: 'BUY' | 'SELL'; price: number }[];
  showBenchmark?: boolean;
  showDrawdown?: boolean;
  height?: number;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  tradeMarkers = [],
  showBenchmark = true,
  showDrawdown = false,
  height = 300,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-sm">No series data available</div>;
  }

  // Min and max for scaling
  const allValues = data.flatMap(d => [d.strategy, ...(showBenchmark ? [d.benchmark] : [])]);
  const minVal = Math.min(...allValues) * 0.98;
  const maxVal = Math.max(...allValues) * 1.02;
  const valRange = maxVal - minVal || 1;

  const padding = { top: 20, right: 30, bottom: 35, left: 65 };
  const width = 800; // SVG viewBox coordinate system
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / valRange) * innerHeight;

  // Build SVG path strings
  const strategyPoints = data.map((d, i) => `${getX(i)},${getY(d.strategy)}`).join(' ');
  const benchmarkPoints = data.map((d, i) => `${getX(i)},${getY(d.benchmark)}`).join(' ');

  // Gradient area path for strategy
  const areaPath = `M ${getX(0)},${getY(data[0].strategy)} L ${strategyPoints.replace(/ /g, ' L ')} L ${getX(data.length - 1)},${padding.top + innerHeight} L ${getX(0)},${padding.top + innerHeight} Z`;

  // Drawdown scaling if showDrawdown
  const minDD = Math.min(...data.map(d => d.drawdown ?? 0), -1);
  const getDDY = (dd: number) => padding.top + innerHeight - ((dd - minDD) / Math.abs(minDD || 1)) * (innerHeight * 0.4);

  // Find hover item
  const currentItem = hoverIdx !== null ? data[hoverIdx] : data[data.length - 1];

  return (
    <div className="relative w-full select-none">
      {/* Dynamic Header Readout */}
      <div className="flex flex-wrap items-center justify-between pb-3 text-xs font-mono border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-slate-400">Strategy Equity:</span>
            <span className="text-cyan-300 font-bold text-sm">
              ${currentItem.strategy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {showBenchmark && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
              <span className="text-slate-400">Benchmark (SPY):</span>
              <span className="text-slate-300 font-semibold">
                ${currentItem.benchmark.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {currentItem.drawdown !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Drawdown:</span>
              <span className={`font-semibold ${currentItem.drawdown < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {currentItem.drawdown.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="text-slate-500 text-[11px]">
          {currentItem.date}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const relativeX = (mouseX / rect.width) * width;
          const clampedX = Math.max(padding.left, Math.min(width - padding.right, relativeX));
          const index = Math.round(((clampedX - padding.left) / innerWidth) * (data.length - 1));
          setHoverIdx(Math.max(0, Math.min(data.length - 1, index)));
        }}
      >
        <defs>
          <linearGradient id="strategyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + innerHeight * pct;
          const val = maxVal - pct * valRange;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 font-mono text-[10px]"
              >
                ${Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Strategy area fill */}
        <path d={areaPath} fill="url(#strategyGrad)" />

        {/* Benchmark line */}
        {showBenchmark && (
          <polyline
            fill="none"
            stroke="#64748b"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            points={benchmarkPoints}
          />
        )}

        {/* Strategy line */}
        <polyline
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          points={strategyPoints}
        />

        {/* Trade markers */}
        {tradeMarkers.map((marker, i) => {
          const foundIdx = data.findIndex(d => d.date === marker.date);
          if (foundIdx === -1) return null;
          const cx = getX(foundIdx);
          const cy = getY(data[foundIdx].strategy);
          const isBuy = marker.side === 'BUY';
          return (
            <g key={i} className="transition-transform hover:scale-125">
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill={isBuy ? '#10b981' : '#f43f5e'}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={isBuy ? cy - 8 : cy + 13}
                textAnchor="middle"
                className={`text-[9px] font-mono font-bold ${isBuy ? 'fill-emerald-400' : 'fill-rose-400'}`}
              >
                {marker.side}
              </text>
            </g>
          );
        })}

        {/* Hover Crosshair */}
        {hoverIdx !== null && (
          <g>
            <line
              x1={getX(hoverIdx)}
              y1={padding.top}
              x2={getX(hoverIdx)}
              y2={padding.top + innerHeight}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={getX(hoverIdx)}
              cy={getY(data[hoverIdx].strategy)}
              r="5.5"
              fill="#22d3ee"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {showBenchmark && (
              <circle
                cx={getX(hoverIdx)}
                cy={getY(data[hoverIdx].benchmark)}
                r="4"
                fill="#94a3b8"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}

        {/* X-axis labels */}
        {[0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1].map((idx) => {
          if (!data[idx]) return null;
          return (
            <text
              key={idx}
              x={getX(idx)}
              y={height - 10}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[10px]"
            >
              {data[idx].date}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
