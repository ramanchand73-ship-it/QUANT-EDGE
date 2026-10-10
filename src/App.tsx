import React, { useState } from 'react';
import { ASSET_UNIVERSE, PORTFOLIO_PRESETS } from './data/marketData';
import { PortfolioAsset } from './types/quant';
import { Navbar, ActiveTab } from './components/Navbar';
import { MarketTickerTape } from './components/MarketTickerTape';
import { QuantBotView } from './components/QuantBot/QuantBotView';
import { OptimizerView } from './components/PortfolioOptimizer/OptimizerView';
import { RiskView } from './components/RiskAnalytics/RiskView';
import { MonteCarloView } from './components/MonteCarlo/MonteCarloView';
import { StatementOfPurposeView } from './components/StatementOfPurpose/StatementOfPurposeView';
import { PredictionView } from './components/PredictionAnalysis/PredictionView';
import { Bot, Compass, ShieldAlert, Dna, FileText, ArrowRight, ShieldCheck, BrainCircuit } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('bot');
  const [capital, setCapital] = useState<number>(500000);

  // Initialize portfolio with NIFTY 50 bluechip core preset
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>(
    PORTFOLIO_PRESETS[0].allocations.map(a => ({ symbol: a.symbol, weight: a.weight }))
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Real-time Ticker Tape */}
      <MarketTickerTape />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        capital={capital}
        onCapitalChange={setCapital}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hackathon Callout Ribbon if not on SOP tab */}
        {activeTab !== 'sop' && (
          <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40 border border-indigo-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-white">NIFTY 50 Hackathon Submission:</span>{' '}
                <span className="text-slate-300">
                  Read the official 353-word Statement of Purpose (SOP), Indian market friction model (STT/Brokerage), and pitch deck.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('sop')}
              className="flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer transition shrink-0"
            >
              <span>View NIFTY 50 SOP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'bot' && <QuantBotView universe={ASSET_UNIVERSE} />}

        {activeTab === 'prediction' && <PredictionView universe={ASSET_UNIVERSE} />}

        {activeTab === 'optimizer' && (
          <OptimizerView
            universe={ASSET_UNIVERSE}
            portfolio={portfolio}
            onUpdatePortfolio={setPortfolio}
            capital={capital}
          />
        )}

        {activeTab === 'risk' && (
          <RiskView
            universe={ASSET_UNIVERSE}
            portfolio={portfolio}
            capital={capital}
          />
        )}

        {activeTab === 'monte_carlo' && (
          <MonteCarloView
            universe={ASSET_UNIVERSE}
            portfolio={portfolio}
            capital={capital}
          />
        )}

        {activeTab === 'sop' && <StatementOfPurposeView />}
      </main>

      {/* Institutional Grade Terminal Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080c15] py-6 px-4 mt-12 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>QuantEdge Quantitative Finance & Trading Bot Engine — Built for Hackathons & Production</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>FastAPI Backend Ready</span>
            <span>•</span>
            <span>PyPortfolioOpt MPT Engine</span>
            <span>•</span>
            <span>Monte Carlo GBM</span>
            <span>•</span>
            <span>Docker Containerized</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-3 text-[10px] text-slate-600 text-center md:text-left">
          Disclaimer: QuantEdge is designed for mathematical quantitative research, systematic backtesting, and portfolio risk budgeting. It models statistical historical distributions and does not guarantee investment returns or constitute regulated financial advice.
        </div>
      </footer>
    </div>
  );
}
