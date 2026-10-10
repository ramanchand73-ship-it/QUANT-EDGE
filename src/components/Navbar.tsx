import React from 'react';
import { Bot, Compass, ShieldAlert, Dna, FileText, Activity, BrainCircuit, BookOpen, Newspaper } from 'lucide-react';

export type ActiveTab = 'bot' | 'journal' | 'prediction' | 'news' | 'optimizer' | 'risk' | 'monte_carlo' | 'sop';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  capital: number;
  onCapitalChange: (val: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  capital,
  onCapitalChange,
}) => {
  return (
    <header className="bg-[#090d16] border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <div className="w-full h-full bg-[#090d16] rounded-[7px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white tracking-tight">QuantEdge</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  NIFTY 50
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                NSE Algorithmic Strategy Backtesting Platform
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'bot', label: 'Strategy Backtester', icon: Bot, badge: 'Live' },
              { id: 'journal', label: 'Trade Journal', icon: BookOpen, badge: 'Notes' },
              { id: 'prediction', label: 'Prediction vs Actual', icon: BrainCircuit, badge: 'ML' },
              { id: 'news', label: 'News & Sentiment', icon: Newspaper, badge: 'Feed' },
              { id: 'optimizer', label: 'MPT Optimizer', icon: Compass },
              { id: 'risk', label: 'Risk & VaR', icon: ShieldAlert },
              { id: 'monte_carlo', label: 'Monte Carlo', icon: Dna },
              { id: 'sop', label: 'NIFTY 50 SOP', icon: FileText, highlight: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer relative ${
                    isActive
                      ? tab.highlight
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : tab.highlight
                      ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Capital Selector & Live Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-slate-500">Capital:</span>
              <span className="text-slate-200 font-bold">₹{capital.toLocaleString()}</span>
              <button
                onClick={() => {
                  const nextVals = [100000, 250000, 500000, 1000000];
                  const curIdx = nextVals.indexOf(capital);
                  onCapitalChange(nextVals[(curIdx + 1) % nextVals.length] || 500000);
                }}
                className="text-cyan-400 hover:text-cyan-300 text-[10px] ml-1 underline cursor-pointer"
                title="Cycle starting capital"
              >
                Change
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NSE CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/60">
          {[
            { id: 'bot', label: 'Bot', icon: Bot },
            { id: 'journal', label: 'Journal', icon: BookOpen },
            { id: 'prediction', label: 'ML Pred', icon: BrainCircuit },
            { id: 'news', label: 'News', icon: Newspaper },
            { id: 'optimizer', label: 'MPT', icon: Compass },
            { id: 'risk', label: 'Risk', icon: ShieldAlert },
            { id: 'monte_carlo', label: 'Monte Carlo', icon: Dna },
            { id: 'sop', label: 'SOP & Pitch', icon: FileText, highlight: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as ActiveTab)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold shrink-0 cursor-pointer ${
                  isActive
                    ? tab.highlight
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

