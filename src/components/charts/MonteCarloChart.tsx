import React, { useState } from 'react';
import { MonteCarloResult } from '../../types/quant';

interface MonteCarloChartProps {
  result: MonteCarloResult;
  initialCapital: number;
}

export const MonteCarloChart: React.FC<MonteCarloChartProps> = ({
  result,
  initialCapital,
}) => {
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const { percentiles, samplePaths } = result;
  if (!percentiles || percentiles.length === 0) return null;

  const maxVal = Math.max(...percentiles.map(p => p.p95)) * 1.05;
  const minVal = Math.max(0, Math.min(...percentiles.map(p => p.p5)) * 0.95);
  const valRange = maxVal - minVal || 1;

  const width = 800;
  const height = 340;
  const padding = { top: 25, right: 35, bottom: 40, left: 75 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxDays = percentiles[percentiles.length - 1].day;
  const getX = (d: number) => padding.left + (d / maxDays) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / valRange) * innerHeight;

  // Build polygon path for 5th to 95th percentile cone
  const p95Points = percentiles.map(p => `${getX(p.day)},${getY(p.p95)}`).join(' ');
  const p5ReversePoints = [...percentiles].reverse().map(p => `${getX(p.day)},${getY(p.p5)}`).join(' ');
  const outerConePath = `M ${p95Points} L ${p5ReversePoints} Z`;

  // Build polygon path for 25th to 75th percentile cone
  const p75Points = percentiles.map(p => `${getX(p.day)},${getY(p.p75)}`).join(' ');
  const p25ReversePoints = [...percentiles].reverse().map(p => `${getX(p.day)},${getY(p.p25)}`).join(' ');
  const innerConePath = `M ${p75Points} L ${p25ReversePoints} Z`;

  // Median line
  const medianPoints = percentiles.map(p => `${getX(p.day)},${getY(p.p50)}`).join(' ');

  // Baseline initial capital line
  const baseLineY = getY(initialCapital);

  // Active hover data
  const currentStep = hoverDay !== null
    ? percentiles.find(p => p.day === hoverDay) || percentiles[percentiles.length - 1]
    : percentiles[percentiles.length - 1];

  return (
    <div className="relative w-full">
      {/* Simulation Dynamic Readout */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-900/80 rounded-t-lg border-x border-t border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="text-slate-400">
            Day: <span className="text-slate-200 font-bold">{currentStep.day}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">95th %ile (Bull):</span>
            <span className="text-emerald-400 font-bold">${Math.round(currentStep.p95).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Median (50th):</span>
            <span className="text-cyan-300 font-bold">${Math.round(currentStep.p50).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-400">5th %ile (Tail Risk):</span>
            <span className="text-rose-400 font-bold">${Math.round(currentStep.p5).toLocaleString()}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Initial: ${initialCapital.toLocaleString()}
        </div>
      </div>

      <div className="border border-slate-800 bg-[#090d16] rounded-b-lg p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none cursor-crosshair"
          onMouseLeave={() => setHoverDay(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const relativeX = (mouseX / rect.width) * width;
            const clampedX = Math.max(padding.left, Math.min(width - padding.right, relativeX));
            const dayRatio = (clampedX - padding.left) / innerWidth;
            const approxDay = Math.round(dayRatio * maxDays);
            
            // Find closest day in percentiles
            const closest = percentiles.reduce((prev, curr) => 
              Math.abs(curr.day - approxDay) < Math.abs(prev.day - approxDay) ? curr : prev
            );
            setHoverDay(closest.day);
          }}
        >
          <defs>
            <linearGradient id="outerConeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="innerConeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerHeight * pct;
            const val = maxVal - pct * valRange;
            return (
              <g key={`y-${i}`}>
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

          {/* Initial Capital Baseline */}
          <line
            x1={padding.left}
            y1={baseLineY}
            x2={width - padding.right}
            y2={baseLineY}
            stroke="#64748b"
            strokeDasharray="2 2"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <text
            x={width - padding.right + 4}
            y={baseLineY + 3}
            className="fill-slate-500 font-mono text-[9px]"
          >
            Break-Even
          </text>

          {/* Outer Cone (5th - 95th percentile) */}
          <path d={outerConePath} fill="url(#outerConeGrad)" />

          {/* Inner Cone (25th - 75th percentile) */}
          <path d={innerConePath} fill="url(#innerConeGrad)" />

          {/* Sample individual paths */}
          {samplePaths.slice(0, 5).map((path, pIdx) => {
            const stepDays = Math.floor(maxDays / (path.length - 1));
            const pts = path.map((val, idx) => `${getX(idx * stepDays)},${getY(val)}`).join(' ');
            return (
              <polyline
                key={pIdx}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.75"
                opacity="0.25"
                points={pts}
              />
            );
          })}

          {/* Median Line */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            points={medianPoints}
          />

          {/* 95th Percentile boundary line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.8"
            points={p95Points}
          />

          {/* 5th Percentile boundary line */}
          <polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.8"
            points={percentiles.map(p => `${getX(p.day)},${getY(p.p5)}`).join(' ')}
          />

          {/* Hover indicator */}
          {hoverDay !== null && (
            <g>
              <line
                x1={getX(currentStep.day)}
                y1={padding.top}
                x2={getX(currentStep.day)}
                y2={padding.top + innerHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(currentStep.day)}
                cy={getY(currentStep.p50)}
                r="5"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X Axis Ticks */}
          {[0, Math.floor(maxDays * 0.25), Math.floor(maxDays * 0.5), Math.floor(maxDays * 0.75), maxDays].map(day => (
            <text
              key={day}
              x={getX(day)}
              y={height - 12}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[10px]"
            >
              Day {day}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
