import React, { useState } from 'react';
import { EfficientFrontierPoint } from '../../types/quant';

interface FrontierChartProps {
  points: EfficientFrontierPoint[];
  maxSharpe: EfficientFrontierPoint;
  minVol: EfficientFrontierPoint;
  current: EfficientFrontierPoint;
  onSelectPortfolio?: (weights: Record<string, number>) => void;
}

export const FrontierChart: React.FC<FrontierChartProps> = ({
  points,
  maxSharpe,
  minVol,
  current,
  onSelectPortfolio,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<EfficientFrontierPoint | null>(null);

  // Determine bounds
  const allVols = points.map(p => p.volatility).concat([current.volatility, maxSharpe.volatility, minVol.volatility]);
  const allRets = points.map(p => p.returnVal).concat([current.returnVal, maxSharpe.returnVal, minVol.returnVal]);

  const minX = Math.max(0.04, Math.min(...allVols) * 0.85);
  const maxX = Math.max(...allVols) * 1.15;
  const minY = Math.min(0, Math.min(...allRets) * 0.9);
  const maxY = Math.max(...allRets) * 1.2;

  const width = 760;
  const height = 380;
  const padding = { top: 30, right: 40, bottom: 45, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (vol: number) => padding.left + ((vol - minX) / (maxX - minX)) * innerWidth;
  const getY = (ret: number) => padding.top + innerHeight - ((ret - minY) / (maxY - minY)) * innerHeight;

  // Capital Allocation Line (CAL): connects (0, Risk-Free Rate = 0.045) through Max Sharpe
  const rf = 0.045;
  const calSlope = (maxSharpe.returnVal - rf) / maxSharpe.volatility;
  const calEndX = maxX * 0.95;
  const calEndY = rf + calSlope * calEndX;

  // Color mapping based on Sharpe ratio
  const sharpeVals = points.map(p => p.sharpe);
  const minSharpe = Math.min(...sharpeVals);
  const maxSharpeVal = Math.max(...sharpeVals);

  const getPointColor = (sharpe: number) => {
    const norm = Math.max(0, Math.min(1, (sharpe - minSharpe) / (maxSharpeVal - minSharpe || 1)));
    // Interpolate from dark indigo (0) -> teal -> bright emerald (1)
    if (norm < 0.5) {
      return `rgb(${Math.round(40 + norm * 80)}, ${Math.round(100 + norm * 150)}, ${Math.round(200 - norm * 40)})`;
    }
    return `rgb(${Math.round(50 + (1 - norm) * 40)}, ${Math.round(200 + norm * 55)}, ${Math.round(180 - norm * 80)})`;
  };

  const activeDisplayPoint = hoveredPoint || maxSharpe;

  return (
    <div className="relative w-full">
      {/* Dynamic Inspector Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-900/80 rounded-t-lg border-x border-t border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Inspected Point:</span>
            <span className="text-cyan-300 font-bold">
              {hoveredPoint?.isMaxSharpe ? '★ Max Sharpe Portfolio' : hoveredPoint?.isMinVol ? '● Min Volatility Portfolio' : hoveredPoint?.isCurrent ? '◆ Current Portfolio' : 'Frontier Candidate'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Exp. Return:</span>
            <span className="text-emerald-400 font-bold">{(activeDisplayPoint.returnVal * 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Volatility (σ):</span>
            <span className="text-amber-400 font-bold">{(activeDisplayPoint.volatility * 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Sharpe Ratio:</span>
            <span className="text-purple-300 font-bold">{activeDisplayPoint.sharpe.toFixed(2)}</span>
          </div>
        </div>

        {hoveredPoint && onSelectPortfolio && (
          <button
            onClick={() => onSelectPortfolio(hoveredPoint.weights)}
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium transition cursor-pointer"
          >
            Load This Allocation
          </button>
        )}
      </div>

      <div className="border border-slate-800 bg-[#090d16] rounded-b-lg p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <radialGradient id="maxSharpeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="currentGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerHeight * pct;
            const ret = maxY - pct * (maxY - minY);
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
                  {(ret * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const x = padding.left + innerWidth * pct;
            const vol = minX + pct * (maxX - minX);
            return (
              <g key={`x-${i}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - 15}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {(vol * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Capital Allocation Line (CAL) */}
          <line
            x1={getX(0)}
            y1={getY(rf)}
            x2={getX(calEndX)}
            y2={getY(calEndY)}
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.75"
          />
          <text
            x={getX(calEndX) - 10}
            y={getY(calEndY) - 8}
            className="fill-purple-400 font-mono text-[9px] font-semibold"
          >
            Capital Allocation Line (CAL)
          </text>

          {/* Scatter Points */}
          {points.map((pt, i) => {
            const cx = getX(pt.volatility);
            const cy = getY(pt.returnVal);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="3"
                fill={getPointColor(pt.sharpe)}
                opacity="0.65"
                className="cursor-pointer hover:opacity-100 hover:r-5 transition-all"
                onMouseEnter={() => setHoveredPoint(pt)}
              />
            );
          })}

          {/* Minimum Volatility Marker */}
          {minVol && (
            <g className="cursor-pointer" onMouseEnter={() => setHoveredPoint(minVol)}>
              <circle
                cx={getX(minVol.volatility)}
                cy={getY(minVol.returnVal)}
                r="9"
                fill="#f59e0b"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              <text
                x={getX(minVol.volatility) - 12}
                y={getY(minVol.returnVal) - 12}
                className="fill-amber-400 font-mono text-[10px] font-bold"
              >
                Min Volatility
              </text>
            </g>
          )}

          {/* Max Sharpe Marker (Tangency Portfolio) */}
          {maxSharpe && (
            <g className="cursor-pointer" onMouseEnter={() => setHoveredPoint(maxSharpe)}>
              <circle
                cx={getX(maxSharpe.volatility)}
                cy={getY(maxSharpe.returnVal)}
                r="18"
                fill="url(#maxSharpeGlow)"
              />
              <circle
                cx={getX(maxSharpe.volatility)}
                cy={getY(maxSharpe.returnVal)}
                r="9"
                fill="#10b981"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              <text
                x={getX(maxSharpe.volatility) + 12}
                y={getY(maxSharpe.returnVal) - 10}
                className="fill-emerald-400 font-mono text-[10px] font-bold"
              >
                ★ Max Sharpe (Optimal)
              </text>
            </g>
          )}

          {/* Current Portfolio Marker */}
          {current && (
            <g className="cursor-pointer" onMouseEnter={() => setHoveredPoint(current)}>
              <circle
                cx={getX(current.volatility)}
                cy={getY(current.returnVal)}
                r="16"
                fill="url(#currentGlow)"
              />
              <polygon
                points={`
                  ${getX(current.volatility)},${getY(current.returnVal) - 9}
                  ${getX(current.volatility) + 8},${getY(current.returnVal)}
                  ${getX(current.volatility)},${getY(current.returnVal) + 9}
                  ${getX(current.volatility) - 8},${getY(current.returnVal)}
                `}
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <text
                x={getX(current.volatility) + 12}
                y={getY(current.returnVal) + 14}
                className="fill-sky-400 font-mono text-[10px] font-bold"
              >
                ◆ Current Allocation
              </text>
            </g>
          )}

          {/* Axis Titles */}
          <text
            x={width / 2}
            y={height - 2}
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[10px] uppercase tracking-wider"
          >
            Portfolio Volatility / Risk σ (Annualized)
          </text>
          <text
            x={-height / 2}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[10px] uppercase tracking-wider"
          >
            Expected Return E(R) (Annualized)
          </text>
        </svg>
      </div>
    </div>
  );
};
