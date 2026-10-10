import React from 'react';
import { Asset } from '../../types/quant';
import { calculateReturns, correlation } from '../../utils/quantMath';

interface CorrelationMatrixProps {
  assets: Asset[];
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ assets }) => {
  if (assets.length === 0) return null;

  const returnsMatrix = assets.map(a => calculateReturns(a.history));
  const n = assets.length;

  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        row.push(1.0);
      } else {
        row.push(correlation(returnsMatrix[i], returnsMatrix[j]));
      }
    }
    matrix.push(row);
  }

  const getCellColor = (val: number) => {
    if (val === 1.0) return 'bg-cyan-900/60 text-cyan-200 border-cyan-700/50';
    if (val > 0.6) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
    if (val > 0.2) return 'bg-teal-950/40 text-teal-300 border-teal-900/30';
    if (val > -0.2) return 'bg-slate-900 text-slate-300 border-slate-800';
    if (val > -0.5) return 'bg-amber-950/40 text-amber-300 border-amber-900/30';
    return 'bg-rose-950/60 text-rose-300 border-rose-800/40';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-slate-500 font-normal">Asset</th>
            {assets.map(a => (
              <th key={a.symbol} className="p-2 text-center text-slate-300 font-bold">
                {a.symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((rowAsset, i) => (
            <tr key={rowAsset.symbol}>
              <td className="p-2 font-bold text-slate-300 whitespace-nowrap">
                {rowAsset.symbol}
                <span className="text-[10px] text-slate-500 font-normal ml-1">({rowAsset.category})</span>
              </td>
              {matrix[i].map((corrVal, j) => (
                <td
                  key={`${rowAsset.symbol}-${assets[j].symbol}`}
                  className="p-1 text-center"
                >
                  <div
                    className={`py-1.5 px-2 rounded border transition-colors ${getCellColor(corrVal)}`}
                    title={`${rowAsset.symbol} vs ${assets[j].symbol}: ${corrVal.toFixed(3)}`}
                  >
                    {corrVal.toFixed(2)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-800 inline-block" />
            High Positive Correlation (&gt;0.6)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800 inline-block" />
            Uncorrelated (~0.0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-950 border border-rose-800 inline-block" />
            Negative Correlation (Hedging)
          </span>
        </div>
      </div>
    </div>
  );
};
