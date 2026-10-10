import React, { useState, useMemo } from 'react';
import { Asset, PredictionAnalysisResult } from '../../types/quant';
import { runPredictionAnalysis } from '../../utils/quantMath';
import { LineChart, BrainCircuit, AlertTriangle, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, Layers, Table, Sliders, Info, ShieldCheck, Download } from 'lucide-react';

interface PredictionViewProps {
  universe: Asset[];
}

export const PREDICTION_SOP_TEXT = `QuantEdge: NIFTY 50 Algorithmic Trading Strategy Backtesting Platform
Section: Prediction vs Actual Price Analysis
Statement of Purpose

In quantitative finance, machine learning models are frequently marketed as infallible predictive engines, leading retail traders to mistake curve-fitted statistical forecasts for guaranteed market foresight. To counter this misconception and promote empirical literacy, I am introducing the "Prediction vs Actual Price Analysis" module within QuantEdge. The motivation of this section is to provide a transparent, scientifically honest mechanism for evaluating next-day price forecasts against real National Stock Exchange (NSE) market outcomes.

The module ingests historical OHLCV data for NIFTY 50 stocks and trains statistical and supervised machine-learning models, including regularized Ridge Regression and Random Forest ensembles via Scikit-learn. At each trading day (T), the system extracts rolling momentum, moving averages, and volatility features to forecast the next trading day's (T+1) closing price and directional trajectory. Once the actual market session concludes, QuantEdge systematically audits the prediction against actual opening, high, low, and closing prices.

Our interactive dashboard delivers full visibility into model performance through dual-line price overlay charts, daily prediction-error distributions, and rigorous quantitative evaluation metrics: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Mean Absolute Percentage Error (MAPE), and Directional Accuracy. Every historical prediction is logged in a chronological audit ledger displaying the exact rupee difference, percentage error, and binary hit-or-miss directional correctness.

Crucially, this module is engineered for model evaluation and quantitative education, not for automated signal generation or profit promises. Equity prices on the NSE are inherently stochastic, driven by unscheduled corporate news, quarterly earnings, RBI monetary policy shifts, and global macroeconomic volatility. By exposing prediction errors transparently, QuantEdge equips Indian traders and students with a disciplined, probabilistic mindset, demonstrating why robust risk management and position sizing must always supersede raw predictive models.`;

export const PredictionView: React.FC<PredictionViewProps> = ({ universe }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [modelType, setModelType] = useState<'ridge' | 'rf' | 'arima'>('ridge');
  const [lookbackDays, setLookbackDays] = useState<number>(60);
  const [showSopModal, setShowSopModal] = useState<boolean>(false);
  const [copiedSop, setCopiedSop] = useState<boolean>(false);

  const selectedAsset = universe.find(a => a.symbol === selectedSymbol) || universe[0];

  const analysis: PredictionAnalysisResult = useMemo(() => {
    return runPredictionAnalysis(selectedAsset, modelType, lookbackDays);
  }, [selectedAsset, modelType, lookbackDays]);

  const handleCopySop = () => {
    navigator.clipboard.writeText(PREDICTION_SOP_TEXT);
    setCopiedSop(true);
    setTimeout(() => setCopiedSop(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Symbol', 'Predicted_Close', 'Actual_Close', 'Actual_Open', 'Actual_High', 'Actual_Low', 'Diff_INR', 'Pct_Error', 'Predicted_Dir', 'Actual_Dir', 'Is_Correct'];
    const rows = analysis.rows.map(r => [
      r.date, r.symbol, r.predictedClose, r.actualClose, r.actualOpen, r.actualHigh, r.actualLow, r.difference, r.percentageError, r.predictedDirection, r.actualDirection, r.isDirectionCorrect ? '1' : '0'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QuantEdge_${selectedSymbol}_Prediction_Analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart preparation
  const chartRows = [...analysis.rows].reverse(); // Chronological for graph
  const minVal = Math.min(...chartRows.flatMap(r => [r.actualClose, r.predictedClose])) * 0.98;
  const maxVal = Math.max(...chartRows.flatMap(r => [r.actualClose, r.predictedClose])) * 1.02;
  const range = maxVal - minVal || 1;

  const width = 760;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 60 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const getX = (i: number) => padding.left + (i / (chartRows.length - 1 || 1)) * innerW;
  const getY = (val: number) => padding.top + innerH - ((val - minVal) / range) * innerH;

  const actualPoints = chartRows.map((r, i) => `${getX(i)},${getY(r.actualClose)}`).join(' ');
  const predPoints = chartRows.map((r, i) => `${getX(i)},${getY(r.predictedClose)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Educational Disclaimer Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Prediction vs Actual Price Analysis</h2>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded">
                Model Evaluation & Audit Engine
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Scientific evaluation of statistical and machine learning forecasts against realized NSE market data. Designed to measure model error, directional hit rates, and prevent curve-fitting bias.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSopModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
            >
              <Info className="w-4 h-4" />
              Section SOP Document
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Responsible Use Note */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Educational & Risk Disclaimer:</strong> Stock prices are non-stationary and influenced by unscheduled breaking news, macroeconomic shifts, and volatility. Predictions are probabilistic estimates for model evaluation and educational analysis, not guaranteed trading signals or profit forecasts.
          </span>
        </div>
      </div>

      {/* Control Panel: Asset Picker & Model Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Asset Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">NIFTY Stock:</span>
          <div className="flex flex-wrap gap-1.5">
            {['NIFTY 50', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'TATAMOTORS'].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition border cursor-pointer ${
                  selectedSymbol === sym
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Model Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">Model:</span>
          <div className="flex gap-1.5">
            {[
              { id: 'ridge', label: 'Ridge Regression' },
              { id: 'rf', label: 'Random Forest' },
              { id: 'arima', label: 'ARIMA Drift' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModelType(m.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition border cursor-pointer ${
                  modelType === m.id
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                    : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lookback Days */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">Evaluation Window:</span>
          <div className="flex gap-1.5">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setLookbackDays(days)}
                className={`px-2 py-1 rounded text-xs font-mono transition border cursor-pointer ${
                  lookbackDays === days
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-800/50 text-slate-400 border-slate-800'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Evaluation KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Directional Accuracy</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">Hit Rate</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${analysis.directionalAccuracy >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {analysis.directionalAccuracy}%
          </div>
          <p className="text-[11px] text-slate-500">
            {chartRows.filter(r => r.isDirectionCorrect).length} of {analysis.totalDaysEvaluated} days correct direction (Up/Down)
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mean Absolute Error (MAE)</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">L1 Loss</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            ₹{analysis.mae}
          </div>
          <p className="text-[11px] text-slate-500">
            Average absolute difference from actual closing price
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Root Mean Squared Error (RMSE)</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">L2 Loss</span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            ₹{analysis.rmse}
          </div>
          <p className="text-[11px] text-slate-500">
            Penalizes large outlier forecast errors heavily
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Percentage Error (MAPE)</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">Relative</span>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {analysis.mape}%
          </div>
          <p className="text-[11px] text-slate-500">
            Mean percentage discrepancy across evaluated sessions
          </p>
        </div>
      </div>

      {/* Chart: Actual vs Predicted Price Series */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Actual vs Predicted Closing Price Over Time ({analysis.modelName})
            </h3>
            <p className="text-[11px] text-slate-400">
              Comparing yesterday's model estimate with today's realized closing price across {analysis.totalDaysEvaluated} sessions.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-1 bg-cyan-400 rounded-full" /> Actual Close (Realized)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-1 bg-indigo-400 rounded-full stroke-dasharray" /> Predicted Close (Forecast)
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full bg-[#080d17] border border-slate-800/80 rounded-lg p-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padding.top + innerH * pct;
              const val = maxVal - pct * range;
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-slate-500 font-mono text-[10px]">
                    ₹{Math.round(val).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Actual Price Polyline */}
            <polyline fill="none" stroke="#22d3ee" strokeWidth="2.5" points={actualPoints} />

            {/* Predicted Price Polyline */}
            <polyline fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3" points={predPoints} />

            {/* X-axis ticks */}
            {[0, Math.floor(chartRows.length * 0.33), Math.floor(chartRows.length * 0.66), chartRows.length - 1].map((idx) => {
              if (!chartRows[idx]) return null;
              return (
                <text key={idx} x={getX(idx)} y={height - 10} textAnchor="middle" className="fill-slate-500 font-mono text-[10px]">
                  {chartRows[idx].date}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Prediction Audit Ledger Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" />
              Chronological Prediction Audit Ledger
            </h3>
            <p className="text-[11px] text-slate-400">
              Audit log comparing predicted price vs actual OHLC prices, percentage deviation, and directional hit correctness.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {analysis.rows.length} Sessions Logged
          </span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800">
              <tr className="text-slate-400 text-left">
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Stock</th>
                <th className="p-2.5">Predicted Close</th>
                <th className="p-2.5">Actual Close</th>
                <th className="p-2.5">OHLC Range</th>
                <th className="p-2.5">Difference (₹)</th>
                <th className="p-2.5">% Error</th>
                <th className="p-2.5">Direction</th>
                <th className="p-2.5 text-center">Correctness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {analysis.rows.map((row, idx) => {
                const isCorrect = row.isDirectionCorrect;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-2.5 text-slate-400 whitespace-nowrap">{row.date}</td>
                    <td className="p-2.5 font-bold text-slate-200">{row.symbol}</td>
                    <td className="p-2.5 text-indigo-300 font-semibold">₹{row.predictedClose.toFixed(2)}</td>
                    <td className="p-2.5 text-cyan-300 font-semibold">₹{row.actualClose.toFixed(2)}</td>
                    <td className="p-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                      O: ₹{row.actualOpen} | H: ₹{row.actualHigh} | L: ₹{row.actualLow}
                    </td>
                    <td className={`p-2.5 font-bold ${row.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.difference >= 0 ? '+' : ''}₹{row.difference.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-slate-300">{row.percentageError.toFixed(2)}%</td>
                    <td className="p-2.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${row.predictedDirection === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.predictedDirection === 'UP' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {row.predictedDirection}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isCorrect ? 'Hit' : 'Miss'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Statement of Purpose Reader */}
      {showSopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Prediction vs Actual Price Analysis — SOP</h3>
              </div>
              <button
                onClick={() => setShowSopModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
              <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/50 rounded text-indigo-300 font-mono text-[11px]">
                Word Count: ~340 Words | Voice: First Person | Focus: Model Evaluation & Anti-Overfitting
              </div>
              <p>
                In quantitative finance, machine learning models are frequently marketed as infallible predictive engines, leading retail traders to mistake curve-fitted statistical forecasts for guaranteed market foresight. To counter this misconception and promote empirical literacy, I am introducing the "Prediction vs Actual Price Analysis" module within QuantEdge. The motivation of this section is to provide a transparent, scientifically honest mechanism for evaluating next-day price forecasts against real National Stock Exchange (NSE) market outcomes.
              </p>
              <p>
                The module ingests historical OHLCV data for NIFTY 50 stocks and trains statistical and supervised machine-learning models, including regularized Ridge Regression and Random Forest ensembles via Scikit-learn. At each trading day (T), the system extracts rolling momentum, moving averages, and volatility features to forecast the next trading day's (T+1) closing price and directional trajectory. Once the actual market session concludes, QuantEdge systematically audits the prediction against actual opening, high, low, and closing prices.
              </p>
              <p>
                Our interactive dashboard delivers full visibility into model performance through dual-line price overlay charts, daily prediction-error distributions, and rigorous quantitative evaluation metrics: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Mean Absolute Percentage Error (MAPE), and Directional Accuracy. Every historical prediction is logged in a chronological audit ledger displaying the exact rupee difference, percentage error, and binary hit-or-miss directional correctness.
              </p>
              <p>
                Crucially, this module is engineered for model evaluation and quantitative education, not for automated signal generation or profit promises. Equity prices on the NSE are inherently stochastic, driven by unscheduled corporate news, quarterly earnings, RBI monetary policy shifts, and global macroeconomic volatility. By exposing prediction errors transparently, QuantEdge equips Indian traders and students with a disciplined, probabilistic mindset, demonstrating why robust risk management and position sizing must always supersede raw predictive models.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={handleCopySop}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                {copiedSop ? 'Copied!' : 'Copy Statement of Purpose'}
              </button>
              <button
                onClick={() => setShowSopModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
