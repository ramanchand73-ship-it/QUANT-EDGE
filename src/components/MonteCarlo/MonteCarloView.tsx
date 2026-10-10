import React, { useState, useMemo } from 'react';
import { Asset, PortfolioAsset, PortfolioMetrics } from '../../types/quant';
import { calculatePortfolioMetrics, runMonteCarloSimulation } from '../../utils/quantMath';
import { MonteCarloChart } from '../charts/MonteCarloChart';
import { Dna, RefreshCw, Compass, HelpCircle, CheckCircle, AlertOctagon } from 'lucide-react';

interface MonteCarloViewProps {
  universe: Asset[];
  portfolio: PortfolioAsset[];
  capital: number;
}

export const MonteCarloView: React.FC<MonteCarloViewProps> = ({
  universe,
  portfolio,
  capital,
}) => {
  const [horizonDays, setHorizonDays] = useState<number>(252);
  const [simCount, setSimCount] = useState<number>(1000);
  const [targetGainPct, setTargetGainPct] = useState<number>(15);
  const [runKey, setRunKey] = useState<number>(0);

  const metrics: PortfolioMetrics = useMemo(() => {
    return calculatePortfolioMetrics(portfolio, universe, capital);
  }, [portfolio, universe, capital]);

  // Run simulation
  const mcResult = useMemo(() => {
    return runMonteCarloSimulation(
      metrics.annualizedReturn,
      metrics.volatility,
      capital,
      horizonDays,
      simCount
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics.annualizedReturn, metrics.volatility, capital, horizonDays, simCount, runKey]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Monte Carlo Stochastic Outcome Engine</h2>
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded">
                Geometric Brownian Motion (GBM)
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Simulates {simCount.toLocaleString()} non-linear stochastic future market paths incorporating drift (μ - 0.5σ²) and diffusion volatility (σ√dt·Z).
            </p>
          </div>

          <button
            onClick={() => setRunKey(k => k + 1)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition shadow-sm cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Simulate Paths
          </button>
        </div>

        {/* Simulation Controls Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Forecast Horizon:</span>
              <span className="font-mono text-sky-300 font-bold">{horizonDays} Trading Days (~{(horizonDays / 252).toFixed(1)} Yrs)</span>
            </div>
            <div className="flex gap-1.5">
              {[30, 90, 180, 252, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition border cursor-pointer ${
                    horizonDays === days
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                      : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Simulation Sample Size:</span>
              <span className="font-mono text-sky-300 font-bold">{simCount.toLocaleString()} Trials</span>
            </div>
            <div className="flex gap-1.5">
              {[500, 1000, 2500, 5000].map((count) => (
                <button
                  key={count}
                  onClick={() => setSimCount(count)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition border cursor-pointer ${
                    simCount === count
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                      : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {count >= 1000 ? `${count / 1000}k` : count}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Target Profit Threshold:</span>
              <span className="font-mono text-emerald-400 font-bold">+{targetGainPct}% Gain</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={targetGainPct}
              onChange={(e) => setTargetGainPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>

      {/* Outcome Probability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Probability of Profit</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(mcResult.probProfit * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500">
            Percent of {simCount} stochastic trials ending at or above ${capital.toLocaleString()}.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Probability of &gt;+{targetGainPct}% Return</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {(mcResult.probTargetReturn * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500">
            Likelihood of exceeding ${Math.round(capital * (1 + targetGainPct / 100)).toLocaleString()} target wealth.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Probability of Loss &gt;15%</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {(mcResult.probSevereDrawdown * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500">
            Stochastic tail risk probability of falling below ${Math.round(capital * 0.85).toLocaleString()}.
          </p>
        </div>
      </div>

      {/* Monte Carlo Fan Chart Component */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Probabilistic Terminal Wealth Distribution Fan Chart
            </h3>
            <p className="text-[11px] text-slate-400">
              Shaded percentile envelopes showing 90% confidence interval [5th to 95th %ile] and median trajectory.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-1 bg-emerald-400 rounded-full" /> 95th %ile
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-1 bg-cyan-400 rounded-full" /> Median (50th)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-1 bg-rose-400 rounded-full" /> 5th %ile
            </span>
          </div>
        </div>

        <MonteCarloChart result={mcResult} initialCapital={capital} />

        {/* Terminal Wealth Table */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="text-slate-400">5th %ile Terminal Floor (Worst 5%):</div>
            <div className="text-base font-bold text-rose-400 mt-0.5">
              ${Math.round(mcResult.p5FinalValue).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              {(((mcResult.p5FinalValue - capital) / capital) * 100).toFixed(1)}% downside
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="text-slate-400">Expected Median Terminal Value:</div>
            <div className="text-base font-bold text-cyan-300 mt-0.5">
              ${Math.round(mcResult.expectedFinalValue).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              {(((mcResult.expectedFinalValue - capital) / capital) * 100).toFixed(1)}% expected return
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="text-slate-400">95th %ile Terminal Ceiling (Top 5%):</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              ${Math.round(mcResult.p95FinalValue).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              +{(((mcResult.p95FinalValue - capital) / capital) * 100).toFixed(1)}% upside
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
