import React, { useState, useMemo } from 'react';
import { Asset, PortfolioAsset, PortfolioMetrics, EfficientFrontierPoint } from '../../types/quant';
import { PORTFOLIO_PRESETS } from '../../data/marketData';
import { calculatePortfolioMetrics, calculateEfficientFrontier } from '../../utils/quantMath';
import { FrontierChart } from '../charts/FrontierChart';
import { Sliders, Sparkles, Shield, Compass, Check, ArrowRight, PieChart, Layers } from 'lucide-react';

interface OptimizerViewProps {
  universe: Asset[];
  portfolio: PortfolioAsset[];
  onUpdatePortfolio: (newPortfolio: PortfolioAsset[]) => void;
  capital: number;
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({
  universe,
  portfolio,
  onUpdatePortfolio,
  capital,
}) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(
    portfolio.map(p => p.symbol)
  );

  // Map of current weights
  const currentWeightsMap = useMemo(() => {
    const map: Record<string, number> = {};
    portfolio.forEach(p => {
      map[p.symbol] = p.weight;
    });
    return map;
  }, [portfolio]);

  // Current metrics
  const currentMetrics = useMemo(() => {
    return calculatePortfolioMetrics(portfolio, universe, capital);
  }, [portfolio, universe, capital]);

  // Compute Efficient Frontier
  const frontierData = useMemo(() => {
    return calculateEfficientFrontier(selectedSymbols, universe, currentWeightsMap, 700);
  }, [selectedSymbols, universe, currentWeightsMap]);

  // Handle Preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = PORTFOLIO_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const newPort = preset.allocations.map(a => ({ symbol: a.symbol, weight: a.weight }));
    setSelectedSymbols(newPort.map(p => p.symbol));
    onUpdatePortfolio(newPort);
  };

  // Handle applying optimal weights
  const handleApplyOptimal = (targetWeights: Record<string, number>) => {
    const newPort: PortfolioAsset[] = Object.entries(targetWeights)
      .filter(([_, w]) => w > 0.005)
      .map(([symbol, weight]) => ({
        symbol,
        weight: Number(weight.toFixed(3)),
      }));

    // Normalize
    const total = newPort.reduce((sum, p) => sum + p.weight, 0);
    const normalized = newPort.map(p => ({ ...p, weight: Number((p.weight / total).toFixed(3)) }));
    onUpdatePortfolio(normalized);
  };

  // Handle manual weight slider change
  const handleWeightChange = (symbol: string, newWeight: number) => {
    const updated = portfolio.map(p => {
      if (p.symbol === symbol) return { ...p, weight: newWeight };
      return p;
    });
    // If not in portfolio yet, add it
    if (!updated.some(p => p.symbol === symbol)) {
      updated.push({ symbol, weight: newWeight });
    }

    // Auto-normalize
    const sum = updated.reduce((s, p) => s + p.weight, 0);
    if (sum > 0) {
      onUpdatePortfolio(updated.map(p => ({ ...p, weight: p.weight / sum })));
    }
  };

  // Toggle asset in universe
  const handleToggleAsset = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      if (selectedSymbols.length <= 2) return; // Keep at least 2 assets
      const filteredSymbols = selectedSymbols.filter(s => s !== symbol);
      setSelectedSymbols(filteredSymbols);
      const filteredPort = portfolio.filter(p => p.symbol !== symbol);
      const sum = filteredPort.reduce((s, p) => s + p.weight, 0);
      onUpdatePortfolio(filteredPort.map(p => ({ ...p, weight: p.weight / (sum || 1) })));
    } else {
      const addedSymbols = [...selectedSymbols, symbol];
      setSelectedSymbols(addedSymbols);
      const addedPort = [...portfolio, { symbol, weight: 0.1 }];
      const sum = addedPort.reduce((s, p) => s + p.weight, 0);
      onUpdatePortfolio(addedPort.map(p => ({ ...p, weight: p.weight / sum })));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Modern Portfolio Theory Optimizer (MPT)</h2>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                Markowitz 1952 Engine
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Mathematical allocation engine solving for the tangency portfolio that maximizes expected excess return per unit of volatility.
            </p>
          </div>

          {/* Quick Optimal Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleApplyOptimal(frontierData.maxSharpe.weights)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Apply Max Sharpe (★ Optimal)
            </button>
            <button
              onClick={() => handleApplyOptimal(frontierData.minVol.weights)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 transition cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Apply Min Volatility
            </button>
          </div>
        </div>

        {/* Portfolio Presets Carousel */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 mb-2">INSTITUTIONAL MODEL PRESETS:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PORTFOLIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 text-left transition cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.tagline}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Frontier Scatter Plot + Allocation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Efficient Frontier Interactive Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Markowitz Efficient Frontier & Capital Allocation Line
                </h3>
                <p className="text-[11px] text-slate-400">
                  700 simulated asset combinations showing the optimal risk-return boundary.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Rf = 4.5% (US 10Y Yield)
              </div>
            </div>

            <FrontierChart
              points={frontierData.points}
              maxSharpe={frontierData.maxSharpe}
              minVol={frontierData.minVol}
              current={frontierData.current}
              onSelectPortfolio={handleApplyOptimal}
            />

            {/* Frontier Legend & Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40">
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>★</span> Max Sharpe
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Return: {(frontierData.maxSharpe.returnVal * 100).toFixed(1)}% | σ: {(frontierData.maxSharpe.volatility * 100).toFixed(1)}%
                </div>
                <div className="text-slate-500 text-[10px]">Sharpe: {frontierData.maxSharpe.sharpe.toFixed(2)}</div>
              </div>

              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40">
                <div className="text-amber-400 font-bold flex items-center gap-1">
                  <span>●</span> Min Volatility
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Return: {(frontierData.minVol.returnVal * 100).toFixed(1)}% | σ: {(frontierData.minVol.volatility * 100).toFixed(1)}%
                </div>
                <div className="text-slate-500 text-[10px]">Sharpe: {frontierData.minVol.sharpe.toFixed(2)}</div>
              </div>

              <div className="p-2 rounded bg-sky-950/40 border border-sky-800/40">
                <div className="text-sky-400 font-bold flex items-center gap-1">
                  <span>◆</span> Current
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Return: {(currentMetrics.annualizedReturn * 100).toFixed(1)}% | σ: {(currentMetrics.volatility * 100).toFixed(1)}%
                </div>
                <div className="text-slate-500 text-[10px]">Sharpe: {currentMetrics.sharpeRatio.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Asset Allocator & Weights Rebalancer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                Asset Weights & Optimization Deltas
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Total: 100%
              </span>
            </div>

            {/* Asset Selection Badges */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium">Included Assets in Universe:</div>
              <div className="flex flex-wrap gap-1.5">
                {universe.map(a => {
                  const isIncluded = selectedSymbols.includes(a.symbol);
                  return (
                    <button
                      key={a.symbol}
                      onClick={() => handleToggleAsset(a.symbol)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer border ${
                        isIncluded
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {a.symbol}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weight Adjustment Sliders */}
            <div className="space-y-3 pt-2">
              {selectedSymbols.map((sym) => {
                const asset = universe.find(a => a.symbol === sym)!;
                const currentWeight = currentWeightsMap[sym] || 0;
                const optimalWeight = frontierData.maxSharpe.weights[sym] || 0;
                const delta = optimalWeight - currentWeight;

                return (
                  <div key={sym} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">{sym}</span>
                        <span className="text-[10px] text-slate-500">{asset?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-cyan-300 font-bold">{(currentWeight * 100).toFixed(1)}%</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                          Math.abs(delta) < 0.02
                            ? 'text-slate-500 bg-slate-800/40'
                            : delta > 0
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : 'text-rose-400 bg-rose-950/60'
                        }`}>
                          {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}% vs MPT
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(currentWeight * 100)}
                        onChange={(e) => handleWeightChange(sym, Number(e.target.value) / 100)}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Portfolio Summary Card */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Capital Value:</span>
                <span className="text-slate-200 font-bold">${capital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Expected Return:</span>
                <span className="text-emerald-400 font-bold">{(currentMetrics.annualizedReturn * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Annualized Volatility:</span>
                <span className="text-amber-400 font-bold">{(currentMetrics.volatility * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sharpe Ratio (Rf=4.5%):</span>
                <span className="text-purple-300 font-bold">{currentMetrics.sharpeRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
