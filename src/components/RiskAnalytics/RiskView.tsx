import React, { useState, useMemo } from 'react';
import { Asset, PortfolioAsset, PortfolioMetrics } from '../../types/quant';
import { calculatePortfolioMetrics, calculateReturns } from '../../utils/quantMath';
import { CorrelationMatrix } from '../charts/CorrelationMatrix';
import { ShieldAlert, AlertTriangle, TrendingDown, Layers, Flame, Gauge, Zap } from 'lucide-react';

interface RiskViewProps {
  universe: Asset[];
  portfolio: PortfolioAsset[];
  capital: number;
}

export const RiskView: React.FC<RiskViewProps> = ({ universe, portfolio, capital }) => {
  const [selectedStressScenario, setSelectedStressScenario] = useState<string>('covid_2020');

  const metrics: PortfolioMetrics = useMemo(() => {
    return calculatePortfolioMetrics(portfolio, universe, capital);
  }, [portfolio, universe, capital]);

  const activeAssets = useMemo(() => {
    const assetMap = new Map(universe.map(a => [a.symbol, a]));
    return portfolio.map(p => assetMap.get(p.symbol)!).filter(Boolean);
  }, [portfolio, universe]);

  // Generate synthetic underwater drawdown series for chart
  const drawdownSeries = useMemo(() => {
    const days = 252;
    const baseValue = capital;
    const series: { date: string; value: number; drawdown: number }[] = [];
    let peak = baseValue;

    for (let d = 0; d < days; d++) {
      let dayVal = 0;
      for (const p of portfolio) {
        const asset = universe.find(a => a.symbol === p.symbol);
        if (!asset) continue;
        const growth = asset.history[d] / asset.history[0];
        dayVal += p.weight * baseValue * growth;
      }
      if (dayVal > peak) peak = dayVal;
      const dd = ((dayVal - peak) / peak) * 100;
      series.push({
        date: `Day ${d + 1}`,
        value: dayVal,
        drawdown: dd,
      });
    }
    return series;
  }, [portfolio, universe, capital]);

  // Stress test scenarios definitions
  const stressScenarios = [
    {
      id: 'gfc_2008',
      name: '2008 Great Financial Crisis',
      desc: 'Subprime mortgage credit freeze and global systemic deleveraging.',
      equitiesShock: -0.385,
      bondsShock: 0.160,
      goldShock: 0.085,
      cryptoShock: -0.550,
      vixLevel: 80,
    },
    {
      id: 'covid_2020',
      name: '2020 Covid Flash Crash',
      desc: 'Sudden economic shutdown, supply shock, and rapid liquidity seizure.',
      equitiesShock: -0.340,
      bondsShock: 0.185,
      goldShock: 0.040,
      cryptoShock: -0.450,
      vixLevel: 82,
    },
    {
      id: 'inflation_2022',
      name: '2022 Fed Rate Shock & Inflation',
      desc: 'Aggressive 500bps interest rate hikes destroying traditional 60/40 correlation.',
      equitiesShock: -0.210,
      bondsShock: -0.190,
      goldShock: -0.020,
      cryptoShock: -0.640,
      vixLevel: 35,
    },
    {
      id: 'tech_correction',
      name: 'Tech & Semiconductor Rotation',
      desc: 'Valuation multiple compression in high-beta tech leaders into value assets.',
      equitiesShock: -0.160,
      bondsShock: 0.040,
      goldShock: 0.060,
      cryptoShock: -0.220,
      vixLevel: 28,
    },
  ];

  const currentScenario = stressScenarios.find(s => s.id === selectedStressScenario) || stressScenarios[0];

  // Calculate stress test impact
  const stressImpact = useMemo(() => {
    let totalPnl = 0;
    const assetBreakdown: { symbol: string; shock: number; pnl: number }[] = [];

    for (const item of portfolio) {
      const asset = universe.find(a => a.symbol === item.symbol);
      if (!asset) continue;

      let shock = currentScenario.equitiesShock;
      if (asset.category === 'Fixed Income') shock = currentScenario.bondsShock;
      if (asset.category === 'Commodity') shock = currentScenario.goldShock;
      if (asset.category === 'Crypto') shock = currentScenario.cryptoShock;
      if (asset.category === 'Tech') shock = currentScenario.equitiesShock * 1.35; // higher beta

      const posValue = item.weight * capital;
      const pnl = posValue * shock;
      totalPnl += pnl;

      assetBreakdown.push({
        symbol: item.symbol,
        shock,
        pnl,
      });
    }

    const portfolioShockPct = (totalPnl / capital) * 100;
    return { totalPnl, portfolioShockPct, assetBreakdown };
  }, [portfolio, universe, capital, currentScenario]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Quantitative Risk Analytics & Tail Risk Engine</h2>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                Basel III / VaR Compliance
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Decomposition of portfolio vulnerability: historical Value at Risk (VaR), Conditional VaR (Expected Shortfall), and macroeconomic stress simulations.
            </p>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">Total Portfolio Value</div>
            <div className="text-lg font-bold text-slate-200">${capital.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Primary Quantitative Risk Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Value at Risk (95%)</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">1-Day</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            ${Math.round(metrics.var95).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            {((metrics.var95 / capital) * 100).toFixed(2)}% maximum expected loss on 95 out of 100 days.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conditional VaR (CVaR)</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">Expected Shortfall</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-300">
            ${Math.round(metrics.cvar95).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Average loss in the catastrophic worst 5% tail scenarios.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sortino Ratio</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">Downside Risk</span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {metrics.sortinoRatio.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">
            Penalizes harmful downside volatility without penalizing upside gains.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Max Peak-to-Trough DD</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">Drawdown</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {(metrics.maxDrawdown * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">
            Deepest historical capital reduction prior to peak recovery.
          </p>
        </div>
      </div>

      {/* Grid: Underwater Drawdown Chart + Macro Stress Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Underwater Drawdown Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Underwater Drawdown Curve (252 Trading Days)
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualizing duration, depth, and capital recovery intervals below previous equity highs.
              </p>
            </div>
            <div className="text-xs font-mono text-amber-400 font-bold">
              Peak DD: {(metrics.maxDrawdown * 100).toFixed(2)}%
            </div>
          </div>

          {/* SVG Underwater Drawdown Chart */}
          <div className="w-full bg-[#080d17] border border-slate-800/80 rounded-lg p-3">
            <svg viewBox="0 0 650 200" className="w-full h-auto overflow-visible select-none">
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.55" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, -5, -10, -15, -20].map((dd) => {
                const minChartDD = Math.min(-20, metrics.maxDrawdown * 100 * 1.2);
                const y = 20 + ((dd - 0) / (minChartDD - 0)) * 150;
                return (
                  <g key={dd}>
                    <line x1="45" y1={y} x2="630" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x="38" y={y + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">
                      {dd}%
                    </text>
                  </g>
                );
              })}

              {/* Area path */}
              {(() => {
                const minChartDD = Math.min(-20, metrics.maxDrawdown * 100 * 1.2);
                const getX = (idx: number) => 45 + (idx / (drawdownSeries.length - 1)) * 585;
                const getY = (dd: number) => 20 + ((dd - 0) / (minChartDD - 0)) * 150;

                const linePts = drawdownSeries.map((d, i) => `${getX(i)},${getY(d.drawdown)}`).join(' ');
                const area = `M 45,20 L ${linePts.replace(/ /g, ' L ')} L ${getX(drawdownSeries.length - 1)},20 Z`;

                return (
                  <>
                    <path d={area} fill="url(#drawdownGradient)" />
                    <polyline fill="none" stroke="#f43f5e" strokeWidth="2" points={linePts} />
                  </>
                );
              })()}

              {/* Waterline zero line */}
              <line x1="45" y1="20" x2="630" y2="20" stroke="#0ea5e9" strokeWidth="1.5" />
              <text x="635" y="23" className="fill-sky-400 font-mono text-[9px]">Peak High</text>
            </svg>
          </div>
        </div>

        {/* Macro Stress Scenario Shock Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Macroeconomic Stress Simulator
            </h3>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Crisis Testing
            </span>
          </div>

          {/* Scenario Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Select Crisis Scenario:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {stressScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedStressScenario(sc.id)}
                  className={`p-2 rounded text-left text-xs transition border cursor-pointer ${
                    selectedStressScenario === sc.id
                      ? 'bg-amber-950/40 text-amber-200 border-amber-500/60'
                      : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold line-clamp-1">{sc.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">VIX: {sc.vixLevel}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            "{currentScenario.desc}"
          </p>

          {/* Impact Readout */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Estimated Portfolio Loss:</span>
              <span className={`font-bold text-sm ${stressImpact.totalPnl < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ${Math.abs(Math.round(stressImpact.totalPnl)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Shock Percentage:</span>
              <span className={`font-bold ${stressImpact.portfolioShockPct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stressImpact.portfolioShockPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Post-Crisis Equity:</span>
              <span className="text-slate-200 font-bold">
                ${Math.round(capital + stressImpact.totalPnl).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Per-Asset Exposure Impact Breakdown */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {stressImpact.assetBreakdown.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-slate-950/40 border border-slate-800/60"
              >
                <span className="font-bold text-slate-300">{item.symbol}</span>
                <span className="text-slate-400">{(item.shock * 100).toFixed(1)}%</span>
                <span className={item.pnl < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {item.pnl >= 0 ? '+' : ''}${Math.round(item.pnl).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Asset Correlation Matrix Heatmap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Empirical Cross-Asset Correlation Heatmap
            </h3>
            <p className="text-[11px] text-slate-400">
              Pearson correlation coefficients calculated across 252 daily return series. Lower or negative values provide true portfolio diversification benefits.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {activeAssets.length} Active Portfolio Holdings
          </div>
        </div>

        <CorrelationMatrix assets={activeAssets} />
      </div>
    </div>
  );
};
