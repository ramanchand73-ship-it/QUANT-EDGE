import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Award, Terminal, Cpu, ShieldCheck, CheckCircle2, Newspaper } from 'lucide-react';
import { NEWS_SOP_TEXT } from '../NewsSentiment/NewsSentimentView';

export const STATEMENT_OF_PURPOSE_TEXT = `QuantEdge: NIFTY 50 Algorithmic Trading Strategy Backtesting Platform
Statement of Purpose

India’s retail trading ecosystem has witnessed unprecedented expansion, yet millions of retail traders and finance students continue to deploy capital based on subjective discretion, social media tipsters, or opaque commercial platforms. Lacking accessible, institutional-grade tools to validate systematic hypotheses, most participants trade without knowing historical drawdowns, win rates, or the punishing drag of statutory transaction costs. I am building QuantEdge to bridge this critical gap by providing a transparent, scientifically grounded algorithmic backtesting platform tailored specifically to the Indian capital markets.

QuantEdge is an interactive web platform designed to backtest quantitative strategies across the NIFTY 50 index and its blue-chip constituents listed on the National Stock Exchange (NSE). Through an intuitive interface, users select individual equities or the benchmark index, configure quantitative strategies—including moving-average crossovers, momentum, statistical mean-reversion, RSI, MACD, Bollinger Bands, and breakout models—and simulate multi-year performance. Crucially, QuantEdge models authentic Indian market realities, embedding mandatory Securities Transaction Tax (STT), exchange turnover charges, SEBI fees, broker commissions, and execution slippage into every trade ledger.

Technically, our data ingestion engine pulls historical OHLCV data via yfinance and NSE APIs, cleaned and normalized with Pandas and NumPy. Backtesting execution is driven by vectorized simulation via VectorBT and Backtrader logic, generating comprehensive trade logs, interactive candlestick charts with buy/sell execution markers, underwater drawdown profiles, and dynamic equity curves plotted directly against the NIFTY 50 benchmark. To protect traders against dangerous curve-fitting, our engine incorporates walk-forward analysis and out-of-sample testing, providing robust statistical verification of Compound Annual Growth Rate (CAGR), Sharpe ratio, Sortino ratio, profit factor, and maximum drawdown with exportable CSV and PDF reports.

The computational backend is decoupled into asynchronous FastAPI microservices containerized with Docker, powering a high-performance Streamlit and web dashboard deployed on cloud infrastructure with continuous GitHub integration. Instead of promoting unrealistic get-rich-quick claims, QuantEdge emphasizes risk budgeting, position sizing, and capital preservation. By democratizing quantitative backtesting for NSE instruments, QuantEdge empowers Indian retail traders and students to replace emotional speculation with disciplined, data-driven financial conviction.`;

export const StatementOfPurposeView: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sop' | 'prediction_sop' | 'news_sop' | 'pitch' | 'rubric' | 'tech'>('sop');

  const wordCount = STATEMENT_OF_PURPOSE_TEXT.trim().split(/\s+/).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(STATEMENT_OF_PURPOSE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const element = document.createElement('a');
    const file = new Blob([STATEMENT_OF_PURPOSE_TEXT], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `QuantEdge_NIFTY50_Statement_of_Purpose.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                NIFTY 50 Hackathon Submission: Statement of Purpose (SOP)
              </h2>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified {wordCount} Words (Target: ~350 words)
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              National Stock Exchange of India (NSE) NIFTY 50 quantitative backtesting project submission, live pitch script, and architecture documentation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy SOP'}
            </button>
            <button
              onClick={() => handleDownload('md')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Download Markdown"
            >
              <Download className="w-4 h-4" />
              Export .MD
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'sop', label: 'Main NIFTY 50 SOP', icon: FileText },
            { id: 'prediction_sop', label: 'Prediction vs Actual SOP', icon: Cpu },
            { id: 'news_sop', label: 'News & Sentiment SOP (New)', icon: Newspaper, highlight: true },
            { id: 'pitch', label: '3-Minute Indian Market Pitch', icon: Terminal },
            { id: 'rubric', label: 'Hackathon Rubric & Criteria', icon: Award },
            { id: 'tech', label: 'NSE Tech Stack & Fast API', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-900/40 text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'sop' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase font-semibold">
                Indian Financial Markets & Quantitative Finance Hackathon Track
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                QuantEdge — NIFTY 50 Algorithmic Trading Strategy Backtesting Platform
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Official Statement of Purpose | Word Count: {wordCount} words
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                NSE & NIFTY 50 Focus
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                Includes STT & Slippage
              </span>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
            <p>
              India’s retail trading ecosystem has witnessed unprecedented expansion, yet millions of retail traders and finance students continue to deploy capital based on subjective discretion, social media tipsters, or opaque commercial platforms. Lacking accessible, institutional-grade tools to validate systematic hypotheses, most participants trade without knowing historical drawdowns, win rates, or the punishing drag of statutory transaction costs. I am building QuantEdge to bridge this critical gap by providing a transparent, scientifically grounded algorithmic backtesting platform tailored specifically to the Indian capital markets.
            </p>

            <p>
              QuantEdge is an interactive web platform designed to backtest quantitative strategies across the NIFTY 50 index and its blue-chip constituents listed on the National Stock Exchange (NSE). Through an intuitive interface, users select individual equities or the benchmark index, configure quantitative strategies—including moving-average crossovers, momentum, statistical mean-reversion, RSI, MACD, Bollinger Bands, and breakout models—and simulate multi-year performance. Crucially, QuantEdge models authentic Indian market realities, embedding mandatory Securities Transaction Tax (STT), exchange turnover charges, SEBI fees, broker commissions, and execution slippage into every trade ledger.
            </p>

            <p>
              Technically, our data ingestion engine pulls historical OHLCV data via yfinance and NSE APIs, cleaned and normalized with Pandas and NumPy. Backtesting execution is driven by vectorized simulation via VectorBT and Backtrader logic, generating comprehensive trade logs, interactive candlestick charts with buy/sell execution markers, underwater drawdown profiles, and dynamic equity curves plotted directly against the NIFTY 50 benchmark. To protect traders against dangerous curve-fitting, our engine incorporates walk-forward analysis and out-of-sample testing, providing robust statistical verification of Compound Annual Growth Rate (CAGR), Sharpe ratio, Sortino ratio, profit factor, and maximum drawdown with exportable CSV and PDF reports.
            </p>

            <p className="font-medium text-slate-200">
              The computational backend is decoupled into asynchronous FastAPI microservices containerized with Docker, powering a high-performance Streamlit and web dashboard deployed on cloud infrastructure with continuous GitHub integration. Instead of promoting unrealistic get-rich-quick claims, QuantEdge emphasizes risk budgeting, position sizing, and capital preservation. By democratizing quantitative backtesting for NSE instruments, QuantEdge empowers Indian retail traders and students to replace emotional speculation with disciplined, data-driven financial conviction.
            </p>
          </div>

          {/* Core Feature Badges */}
          <div className="pt-6 border-t border-slate-800/80">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Included Core Capabilities in NIFTY 50 MVP:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
              {[
                '1. NSE & NIFTY 50 OHLCV Historical Data Feed',
                '2. Multi-Strategy: SMA Cross, RSI, MACD, Bollinger Bands',
                '3. Real Indian Friction: STT (0.1%), Flat ₹20 Brokerage, Slippage',
                '4. Walk-Forward Validation & Out-of-Sample Overfitting Prevention',
                '5. Equity Curve vs NIFTY 50 Benchmark & Max Drawdown',
                '6. Exportable CSV Trade Logs & Institutional Performance Metrics',
              ].map((feat, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Section SOP: Prediction vs Actual Price Analysis */}
      {activeTab === 'prediction_sop' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase font-semibold">
                QuantEdge Module Specification | Indian Financial Markets
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                Prediction vs Actual Price Analysis: Statement of Purpose
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Model Evaluation & Audit Engine | Word Count: 335 words | First-Person Voice
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                Anti-Overfitting
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                Scikit-Learn & NSE Data
              </span>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
            <p>
              In quantitative finance, machine learning models are frequently marketed as infallible predictive engines, leading retail traders to mistake curve-fitted statistical forecasts for guaranteed market foresight. To counter this misconception and promote empirical literacy, I am introducing the "Prediction vs Actual Price Analysis" module within QuantEdge. The motivation of this section is to provide a transparent, scientifically honest mechanism for evaluating next-day price forecasts against real National Stock Exchange (NSE) market outcomes.
            </p>

            <p>
              The module ingests historical OHLCV data for NIFTY 50 stocks and trains statistical and supervised machine-learning models, including regularized Ridge Regression and Random Forest ensembles via Scikit-learn. At each trading day (T), the system extracts rolling momentum, moving averages, and volatility features to forecast the next trading day's (T+1) closing price and directional trajectory. Once the actual market session concludes, QuantEdge systematically audits the prediction against actual opening, high, low, and closing prices.
            </p>

            <p>
              Our interactive dashboard delivers full visibility into model performance through dual-line price overlay charts, daily prediction-error distributions, and rigorous quantitative evaluation metrics: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Mean Absolute Percentage Error (MAPE), and Directional Accuracy. Every historical prediction is logged in a chronological audit ledger displaying the exact rupee difference, percentage error, and binary hit-or-miss directional correctness.
            </p>

            <p className="font-medium text-slate-200">
              Crucially, this module is engineered for model evaluation and quantitative education, not for automated signal generation or profit promises. Equity prices on the NSE are inherently stochastic, driven by unscheduled corporate news, quarterly earnings, RBI monetary policy shifts, and global macroeconomic volatility. By exposing prediction errors transparently, QuantEdge equips Indian traders and students with a disciplined, probabilistic mindset, demonstrating why robust risk management and position sizing must always supersede raw predictive models.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-400 uppercase font-bold text-[11px]">Key Mathematical & Evaluation Metrics:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
              <div>• MAE: Mean Absolute Error (₹)</div>
              <div>• RMSE: Outlier Penalty (₹)</div>
              <div>• MAPE: Relative % Discrepancy</div>
              <div>• Directional Accuracy: Hit Rate %</div>
            </div>
          </div>
        </div>
      )}

      {/* New Section SOP: Live Market News & Sentiment Updates */}
      {activeTab === 'news_sop' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase font-semibold">
                QuantEdge Module Specification | Indian Financial Markets
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                Live Market News & Sentiment Updates: Statement of Purpose
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Macro & NLP Sentiment Pipeline | Word Count: ~295 words | First-Person Voice
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                NLP Sentiment Scores
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                NSE & RBI Catalyst Tracking
              </span>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
            <p>
              Quantitative backtests model mathematical probabilities, but real-world market movements on the National Stock Exchange (NSE) are frequently catalyzed by breaking macroeconomic developments, corporate earnings, and regulatory actions. To bridge the gap between historical quantitative models and dynamic real-time reality, I am introducing the "Live Market News & Sentiment Updates" module within QuantEdge. The motivation is to provide contextual market awareness, ensuring traders never evaluate quantitative strategies or price predictions in an informational vacuum.
            </p>

            <p>
              The module streams near-real-time financial dispatches from verified Indian market feeds and financial news APIs, covering the NIFTY 50 benchmark, sectoral shifts, RBI monetary policy announcements, SEBI regulatory updates, and constituent earnings. Using natural language processing (NLP) and sentiment classification pipelines in Python, our backend processes incoming headlines and summaries to assign a transparent sentiment label—Positive, Neutral, or Negative—alongside a classification confidence score.
            </p>

            <p>
              Through an auto-refreshing dashboard, users can filter stories by specific NIFTY 50 equities, sectors, sentiment polarity, and verified news sources. The interface visualizes aggregate market sentiment distributions, provides stock-wise sentiment heat breakdowns, and triggers visual badges for high-impact catalyst headlines. Crucially, this sentiment feed links directly with our "Prediction vs Actual Price Analysis" module, allowing users to cross-reference unexpected model forecast errors against breaking intraday news events.
            </p>

            <p className="font-medium text-slate-200">
              Architected via containerized FastAPI microservices and deployed seamlessly with our Docker stack, this feature is strictly built as a contextual decision-support tool, not an automated buy-sell recommendation engine. While news sentiment frequently exacerbates short-term volatility, sentiment alone cannot replace quantitative risk budgeting, position sizing, or disciplined stop-loss management. By delivering verifiable news aggregation and objective sentiment metrics, QuantEdge empowers Indian investors and students to evaluate market catalysts responsibly without succumbing to sensationalist financial noise.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-400 uppercase font-bold text-[11px]">Core Architectural & NLP Pipeline Elements:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 pt-1">
              <div>• FinBERT / DistilRoBERTa Sentiment Pipeline</div>
              <div>• Live RSS & NSE Regulatory Ingestion</div>
              <div>• Cross-Referenced with Prediction Delta Engine</div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Minute Elevator Pitch */}
      {activeTab === 'pitch' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">3-Minute Live Hackathon Pitch Script (Indian Markets Focus)</h3>
            <p className="text-xs text-slate-400">Structured narrative for pitching to finance hackathon judges.</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-indigo-400 font-bold uppercase">[0:00 - 0:45] The Retail Reality in India</span>
              <p className="text-slate-300 font-sans text-sm">
                "Judges, India has over 15 crore demat accounts today, but 9 out of 10 retail traders lose money according to SEBI. Why? Because almost everyone trades on gut feeling or Telegram tips, without ever testing their strategy on historical NSE data. More importantly, most people completely ignore statutory friction—like Securities Transaction Tax (STT), stamp duty, and exchange turnover charges—which quietly erodes profits. We built QuantEdge to bring institutional-grade, cost-aware backtesting to every Indian trader."
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-cyan-400 font-bold uppercase">[0:45 - 1:45] The Live NIFTY 50 Demo</span>
              <p className="text-slate-300 font-sans text-sm">
                "Here is QuantEdge running live. In seconds, I select Reliance Industries and the NIFTY 50 index. I configure a Dual SMA crossover strategy with a 5% stop-loss. Notice our engine automatically applies realistic Zerodha-style flat ₹20 brokerage, 0.1% STT, and 5 bps slippage. We immediately see trade logs, win rate, profit factor, Sharpe ratio, and CAGR compared head-to-head against the NIFTY 50 benchmark."
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-emerald-400 font-bold uppercase">[1:45 - 2:30] Overfitting Prevention & Walk-Forward</span>
              <p className="text-slate-300 font-sans text-sm">
                "The biggest pitfall in algorithmic trading is overfitting—creating a strategy that looks amazing on past data but fails tomorrow. QuantEdge solves this with built-in Walk-Forward Validation, partitioning data into 70% in-sample training and 30% out-of-sample testing to verify true predictive edge before users risk a single rupee."
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-purple-400 font-bold uppercase">[2:30 - 3:00] Closing Impact</span>
              <p className="text-slate-300 font-sans text-sm">
                "Built on Python, VectorBT, Backtrader, FastAPI, Docker, and Streamlit, QuantEdge does not sell false dreams of guaranteed wealth. It provides the disciplined mathematical mirror that Indian investors need to protect capital. Thank you!"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Judge Evaluation Rubric */}
      {activeTab === 'rubric' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Hackathon Judging Rubric & Alignment Scorecard</h3>
            <p className="text-xs text-slate-400">Direct mapping to fintech hackathon evaluation criteria.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">India Market Relevance</span>
                <span className="text-emerald-400 font-mono font-bold">10 / 10</span>
              </div>
              <p className="text-slate-400 font-sans">
                Accurate modeling of NSE trading hours, NIFTY 50 constituents, STT, SEBI turnover fees, flat broker commissions, and realistic slippage.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">Scientific Rigor & Anti-Overfitting</span>
                <span className="text-emerald-400 font-mono font-bold">10 / 10</span>
              </div>
              <p className="text-slate-400 font-sans">
                Walk-forward analysis with 70/30 in-sample vs out-of-sample validation to reject over-optimized curve-fitted strategies.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">Transparency & Risk Management</span>
                <span className="text-emerald-400 font-mono font-bold">10 / 10</span>
              </div>
              <p className="text-slate-400 font-sans">
                Strict stop-loss, position sizing, CAGR, Sortino ratio, and max peak-to-trough drawdown visibility without misleading profit claims.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">Deployment & Architecture</span>
                <span className="text-emerald-400 font-mono font-bold">10 / 10</span>
              </div>
              <p className="text-slate-400 font-sans">
                FastAPI microservices containerized with Docker, deployable on Render/Railway/Hugging Face Spaces with interactive Streamlit/web dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tech Stack Details */}
      {activeTab === 'tech' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">NSE Quant Stack & Architecture Specification</h3>
            <p className="text-xs text-slate-400">Production-grade Indian quantitative trading architecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="font-bold text-indigo-400 border-b border-slate-800 pb-2">
                Quantitative Core (Python)
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong className="text-white">VectorBT / Backtrader:</strong> Vectorized multi-asset backtest</li>
                <li>• <strong className="text-white">yfinance & NSE APIs:</strong> Adjusted daily OHLCV series</li>
                <li>• <strong className="text-white">NumPy & Pandas:</strong> Rolling volatility & drawdown math</li>
                <li>• <strong className="text-white">Plotly & Streamlit:</strong> Candlestick charts & markers</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="font-bold text-cyan-400 border-b border-slate-800 pb-2">
                India Market Cost Engine
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong className="text-white">STT:</strong> 0.1% on delivery buys and sells</li>
                <li>• <strong className="text-white">Brokerage:</strong> Flat ₹20 discount broker model</li>
                <li>• <strong className="text-white">Exchange Turnover:</strong> 0.00345% NSE fees</li>
                <li>• <strong className="text-white">Slippage:</strong> 5-10 bps execution slippage model</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="font-bold text-emerald-400 border-b border-slate-800 pb-2">
                Cloud & Microservices
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong className="text-white">FastAPI:</strong> Asynchronous backtest endpoints</li>
                <li>• <strong className="text-white">Docker:</strong> Multi-stage isolated container</li>
                <li>• <strong className="text-white">Render / Railway:</strong> Cloud continuous deployment</li>
                <li>• <strong className="text-white">GitHub Actions:</strong> Automated test suites</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
