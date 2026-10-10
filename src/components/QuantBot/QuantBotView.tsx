import React, { useState, useEffect } from 'react';
import { Asset, BotStrategyConfig, BotStrategyType, BacktestResult, BotSignal } from '../../types/quant';
import { runBotBacktest, generateLiveSignals } from '../../utils/quantMath';
import { InteractiveChart } from '../charts/InteractiveChart';
import { Bot, Play, Pause, Zap, ShieldAlert, Award, Activity, Sliders, CheckCircle2, ShieldCheck, IndianRupee, Layers } from 'lucide-react';

interface QuantBotViewProps {
  universe: Asset[];
}

export const QuantBotView: React.FC<QuantBotViewProps> = ({ universe }) => {
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('RELIANCE');
  const [strategyType, setStrategyType] = useState<BotStrategyType>('sma_cross');
  const [fastPeriod, setFastPeriod] = useState<number>(20);
  const [slowPeriod, setSlowPeriod] = useState<number>(50);
  const [rsiThreshold, setRsiThreshold] = useState<number>(30);
  const [stopLossPct, setStopLossPct] = useState<number>(5);
  const [takeProfitPct, setTakeProfitPct] = useState<number>(12);
  const [allocationPct, setAllocationPct] = useState<number>(75);
  const [initialCapital, setInitialCapital] = useState<number>(500000); // ₹5 Lakh default

  // Indian Market Cost & Validation Parameters
  const [brokeragePerTrade, setBrokeragePerTrade] = useState<number>(20); // Flat ₹20 Zerodha/Groww model
  const [sttPct, setSttPct] = useState<number>(0.10); // 0.1% Securities Transaction Tax
  const [slippagePct, setSlippagePct] = useState<number>(0.05); // 5 bps execution slippage
  const [enableWalkForward, setEnableWalkForward] = useState<boolean>(true);

  const [isBotActive, setIsBotActive] = useState<boolean>(true);
  const [signals, setSignals] = useState<BotSignal[]>([]);
  const [backtest, setBacktest] = useState<BacktestResult | null>(null);
  const [executionToast, setExecutionToast] = useState<string | null>(null);

  const selectedAsset = universe.find(a => a.symbol === selectedAssetSymbol) || universe[0];

  const strategyConfig: BotStrategyConfig = {
    id: strategyType,
    name:
      strategyType === 'sma_cross'
        ? `Dual SMA (${fastPeriod}/${slowPeriod}) Crossover Bot`
        : strategyType === 'mean_reversion'
        ? `Statistical Mean-Reversion (RSI ${rsiThreshold}) Bot`
        : strategyType === 'momentum_roc'
        ? `NSE Alpha Momentum ROC (${fastPeriod}D) Bot`
        : `Donchian Breakout (${fastPeriod}D) Bot`,
    description:
      strategyType === 'sma_cross'
        ? 'Trend-following system on NIFTY constituents tracking institutional regime shifts.'
        : strategyType === 'mean_reversion'
        ? 'Capitalizes on temporary overbought/oversold extremes with mean-reversion targets.'
        : strategyType === 'momentum_roc'
        ? 'Captures directional acceleration in leading NIFTY 50 bluechips.'
        : 'Systematic breakout trigger when price exceeds historical multi-week resistance.',
    assetSymbol: selectedAssetSymbol,
    allocationPct,
    fastPeriod,
    slowPeriod,
    rsiThreshold,
    stopLossPct,
    takeProfitPct,
    trailingStop: true,
    brokeragePerTrade,
    sttPct,
    slippagePct,
    enableWalkForward,
  };

  // Run backtest whenever parameters change
  useEffect(() => {
    const res = runBotBacktest(strategyConfig, selectedAsset, initialCapital);
    setBacktest(res);
  }, [
    selectedAssetSymbol,
    strategyType,
    fastPeriod,
    slowPeriod,
    rsiThreshold,
    stopLossPct,
    takeProfitPct,
    allocationPct,
    initialCapital,
    brokeragePerTrade,
    sttPct,
    slippagePct,
    enableWalkForward,
  ]);

  // Initial and live signals
  useEffect(() => {
    setSignals(generateLiveSignals(universe));
  }, [universe]);

  // Periodic signal refresh simulation
  useEffect(() => {
    if (!isBotActive) return;
    const interval = setInterval(() => {
      setSignals(generateLiveSignals(universe));
    }, 12000);
    return () => clearInterval(interval);
  }, [isBotActive, universe]);

  const handleTriggerBotCycle = () => {
    setExecutionToast(`NSE Quant Bot cycle executed for ${selectedAssetSymbol}. STT, brokerage, and risk stops confirmed.`);
    setTimeout(() => setExecutionToast(null), 3500);
  };

  const tradeMarkers = backtest?.trades.map(t => ({
    date: t.timestamp,
    side: t.side,
    price: t.price,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Bot Status & Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Bot className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">NIFTY 50 Quantitative Strategy Backtester</h2>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                    isBotActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isBotActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                    {isBotActive ? 'NSE LIVE SCANNER' : 'BACKTEST MODE'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Vectorized algorithmic backtesting across National Stock Exchange (NSE) bluechips with STT, discount brokerage, and walk-forward validation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsBotActive(!isBotActive)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isBotActive
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isBotActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isBotActive ? 'Pause Scanner' : 'Activate Live Scan'}
            </button>

            <button
              onClick={handleTriggerBotCycle}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Run NSE Cycle
            </button>
          </div>
        </div>

        {executionToast && (
          <div className="mt-4 p-2.5 bg-emerald-950/70 border border-emerald-600/50 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{executionToast}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Controls / Right Chart & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Strategy Architecture & Indian Market Costs (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Strategy & Indian Friction Config
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                NSE Cash / F&O
              </span>
            </div>

            {/* Target NSE Stock Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Select NIFTY 50 Instrument</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['NIFTY 50', 'RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'TATAMOTORS', 'ITC'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSelectedAssetSymbol(sym)}
                    className={`py-1.5 px-2 rounded text-xs font-mono font-bold transition cursor-pointer border truncate ${
                      selectedAssetSymbol === sym
                        ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500'
                        : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Model Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Strategy Model</label>
              <div className="space-y-1.5">
                {[
                  { id: 'sma_cross', name: 'Dual Moving Average Crossover', desc: 'Fast vs Slow SMA trend tracking' },
                  { id: 'mean_reversion', name: 'Statistical Mean-Reversion', desc: 'RSI z-score bounds & Bollinger band' },
                  { id: 'momentum_roc', name: 'NSE Alpha Momentum (ROC)', desc: 'Rate-of-Change directional momentum' },
                  { id: 'volatility_breakout', name: 'Donchian Breakout Channel', desc: 'Multi-day high/low expansion trigger' },
                ].map((strat) => (
                  <div
                    key={strat.id}
                    onClick={() => setStrategyType(strat.id as BotStrategyType)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      strategyType === strat.id
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-200">{strat.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{strat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hyperparameter Tuning Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Fast MA Lookback:</span>
                  <span className="font-mono text-cyan-300 font-bold">{fastPeriod} Days</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Slow MA Baseline:</span>
                  <span className="font-mono text-cyan-300 font-bold">{slowPeriod} Days</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Realistic Indian Market Friction Controls */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  Indian Market Costs & Friction
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Brokerage per Order:</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{brokeragePerTrade} Flat</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 20, 40].map(val => (
                      <button
                        key={val}
                        onClick={() => setBrokeragePerTrade(val)}
                        className={`flex-1 py-1 rounded text-[11px] font-mono border cursor-pointer ${
                          brokeragePerTrade === val
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Securities Transaction Tax (STT):</span>
                    <span className="font-mono text-amber-400 font-bold">{sttPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.25"
                    step="0.025"
                    value={sttPct}
                    onChange={(e) => setSttPct(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">Standard NSE Equity Delivery: 0.1%</div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Execution Slippage:</span>
                    <span className="font-mono text-rose-400 font-bold">{slippagePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.20"
                    step="0.01"
                    value={slippagePct}
                    onChange={(e) => setSlippagePct(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Strict Risk Controls */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Risk Management & Position Sizing
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Stop-Loss Limit:</span>
                    <span className="font-mono text-rose-400 font-bold">-{stopLossPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Take-Profit Target:</span>
                    <span className="font-mono text-emerald-400 font-bold">+{takeProfitPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={takeProfitPct}
                    onChange={(e) => setTakeProfitPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Backtest Performance & Signals (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Performance KPI Cards */}
          {backtest && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Strategy CAGR</div>
                <div className={`text-lg font-bold font-mono mt-1 ${backtest.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {backtest.totalReturn >= 0 ? '+' : ''}{(backtest.totalReturn * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  NIFTY 50: {(backtest.benchmarkReturn * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Win Rate & Trades</div>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                  {(backtest.winRate * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {backtest.totalTrades} completed trades
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Sharpe & Sortino</div>
                <div className="text-lg font-bold font-mono text-purple-400 mt-1">
                  {backtest.sharpeRatio.toFixed(2)} / {backtest.sortinoRatio.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Profit Factor: {backtest.profitFactor.toFixed(2)}x
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Total Costs (STT+Brokerage)</div>
                <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                  ₹{backtest.totalCostsIncurred.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Max DD: {(backtest.maxDrawdown * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Walk-Forward Overfitting Prevention Ribbon */}
          {backtest && (
            <div className="p-3 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-bold">Walk-Forward Validation:</span>
                <span className="text-slate-400">70% In-Sample vs 30% Out-of-Sample</span>
              </div>
              <div className="flex items-center gap-4">
                <span>In-Sample: <strong className="text-cyan-300">{(backtest.inSampleCAGR * 100).toFixed(1)}%</strong></span>
                <span>Out-of-Sample: <strong className="text-emerald-300">{(backtest.outOfSampleCAGR * 100).toFixed(1)}%</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  WFE: {(backtest.walkForwardEfficiency * 100).toFixed(0)}% (Robust)
                </span>
              </div>
            </div>
          )}

          {/* Interactive Equity Curve & Trade Execution Markers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Equity Curve vs NIFTY 50 Benchmark (₹ INR)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Simulated 252-day NSE execution curve incorporating brokerage, STT, and slippage.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> BUY Fill
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> SELL Fill
                </span>
              </div>
            </div>

            {backtest && (
              <InteractiveChart
                data={backtest.equityCurve}
                tradeMarkers={tradeMarkers}
                showBenchmark={true}
                height={260}
              />
            )}
          </div>

          {/* Live Signal Feed & Trade Execution Log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Live Signal Scanner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  NIFTY 50 Live Signal Scanner
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {signals.length} stocks tracked
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {signals.map((sig) => {
                  const isBuy = sig.type === 'BUY';
                  const isSell = sig.type === 'SELL';
                  return (
                    <div
                      key={sig.id}
                      className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 hover:border-slate-700 transition text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{sig.symbol}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBuy
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isSell
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {sig.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>₹{sig.price.toFixed(2)}</span>
                          <span className="text-slate-500">{sig.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-tight">
                        {sig.reason}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>Confidence: {sig.confidence}%</span>
                        <span>RSI: {sig.indicatorValues.rsi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade Execution Audit Log */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  Trade Execution Journal (NSE)
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">
                  {backtest?.trades.length || 0} Orders
                </span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {backtest?.trades.slice().reverse().map((t) => (
                  <div
                    key={t.id}
                    className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] font-mono flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${t.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.side}
                        </span>
                        <span className="text-slate-300 font-bold">{t.symbol}</span>
                        <span className="text-slate-500">x{t.shares}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {t.timestamp} @ ₹{t.price.toFixed(2)} (Friction: ₹{t.costs})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-300">₹{t.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      {t.pnl !== undefined && (
                        <div className={`text-[10px] font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toFixed(0)} ({t.pnlPct?.toFixed(1)}%)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
