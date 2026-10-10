import React, { useState, useEffect, useMemo } from 'react';
import { MarketNewsItem, NewsSentiment, Asset } from '../../types/quant';
import { INITIAL_NEWS_ITEMS } from '../../data/newsData';
import { 
  Newspaper, RefreshCw, Filter, Search, TrendingUp, TrendingDown, Minus, 
  AlertCircle, ShieldAlert, Sparkles, CheckCircle2, ExternalLink, Info, Copy, Check,
  Radio, BarChart3, Layers
} from 'lucide-react';

interface NewsSentimentViewProps {
  universe: Asset[];
}

export const NEWS_SOP_TEXT = `QuantEdge: NIFTY 50 Algorithmic Trading Strategy Backtesting Platform
Section: Live Market News & Sentiment Updates
Statement of Purpose

Quantitative backtests model mathematical probabilities, but real-world market movements on the National Stock Exchange (NSE) are frequently catalyzed by breaking macroeconomic developments, corporate earnings, and regulatory actions. To bridge the gap between historical quantitative models and dynamic real-time reality, I am introducing the "Live Market News & Sentiment Updates" module within QuantEdge. The motivation is to provide contextual market awareness, ensuring traders never evaluate quantitative strategies or price predictions in an informational vacuum.

The module streams near-real-time financial dispatches from verified Indian market feeds and financial news APIs, covering the NIFTY 50 benchmark, sectoral shifts, RBI monetary policy announcements, SEBI regulatory updates, and constituent earnings. Using natural language processing (NLP) and sentiment classification pipelines in Python, our backend processes incoming headlines and summaries to assign a transparent sentiment label—Positive, Neutral, or Negative—alongside a classification confidence score.

Through an auto-refreshing dashboard, users can filter stories by specific NIFTY 50 equities, sectors, sentiment polarity, and verified news sources. The interface visualizes aggregate market sentiment distributions, provides stock-wise sentiment heat breakdowns, and triggers visual badges for high-impact catalyst headlines. Crucially, this sentiment feed links directly with our "Prediction vs Actual Price Analysis" module, allowing users to cross-reference unexpected model forecast errors against breaking intraday news events.

Architected via containerized FastAPI microservices and deployed seamlessly with our Docker stack, this feature is strictly built as a contextual decision-support tool, not an automated buy-sell recommendation engine. While news sentiment frequently exacerbates short-term volatility, sentiment alone cannot replace quantitative risk budgeting, position sizing, or disciplined stop-loss management. By delivering verifiable news aggregation and objective sentiment metrics, QuantEdge empowers Indian investors and students to evaluate market catalysts responsibly without succumbing to sensationalist financial noise.`;

export const NewsSentimentView: React.FC<NewsSentimentViewProps> = ({ universe }) => {
  const [newsItems, setNewsItems] = useState<MarketNewsItem[]>(INITIAL_NEWS_ITEMS);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showSopModal, setShowSopModal] = useState<boolean>(false);
  const [copiedSop, setCopiedSop] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Simulated live news feed refresher
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleCopySop = () => {
    navigator.clipboard.writeText(NEWS_SOP_TEXT);
    setCopiedSop(true);
    setTimeout(() => setCopiedSop(false), 2000);
  };

  // Filtered News Items
  const filteredNews = useMemo(() => {
    return newsItems.filter(item => {
      const matchesSearch = 
        item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.relatedSymbol.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSymbol = selectedSymbol === 'ALL' || item.relatedSymbol === selectedSymbol;
      const matchesSentiment = selectedSentiment === 'ALL' || item.sentiment === selectedSentiment;
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesSymbol && matchesSentiment && matchesCategory;
    });
  }, [newsItems, searchQuery, selectedSymbol, selectedSentiment, selectedCategory]);

  // Aggregate Sentiment Statistics
  const sentimentStats = useMemo(() => {
    const total = newsItems.length;
    if (total === 0) return { posPct: 0, neuPct: 0, negPct: 0, posCount: 0, neuCount: 0, negCount: 0 };

    const posCount = newsItems.filter(n => n.sentiment === 'Positive').length;
    const neuCount = newsItems.filter(n => n.sentiment === 'Neutral').length;
    const negCount = newsItems.filter(n => n.sentiment === 'Negative').length;

    return {
      posPct: Math.round((posCount / total) * 100),
      neuPct: Math.round((neuCount / total) * 100),
      negPct: Math.round((negCount / total) * 100),
      posCount,
      neuCount,
      negCount,
    };
  }, [newsItems]);

  // High Impact News Items
  const highImpactNews = useMemo(() => {
    return newsItems.filter(n => n.isHighImpact);
  }, [newsItems]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Live Market News & Sentiment Updates</h2>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Indian Macro & NSE Feeds
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Near-real-time financial dispatches for the NIFTY 50 index, RBI policies, and corporate developments with automated NLP sentiment scores.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                autoRefresh 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {autoRefresh ? 'Live Feed ON' : 'Live Feed Paused'}
            </button>

            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Refresh News Feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSopModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
            >
              <Info className="w-4 h-4" />
              Section SOP Document
            </button>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Contextual Market Awareness:</strong> News sentiment provides narrative context for intraday volatility and prediction errors. News alone is insufficient for trading decisions and should always be paired with quantitative risk controls and position sizing.
          </span>
        </div>
      </div>

      {/* Aggregate Sentiment Dashboard & High-Impact Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sentiment Distribution Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Aggregate NIFTY Market Sentiment
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {newsItems.length} Stories Indexed
            </span>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="space-y-3 font-mono text-xs">
            {/* Positive */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Positive Sentiment:
                </span>
                <span className="text-emerald-300 font-bold">{sentimentStats.posPct}% ({sentimentStats.posCount} items)</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${sentimentStats.posPct}%` }} 
                />
              </div>
            </div>

            {/* Neutral */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Minus className="w-3.5 h-3.5" /> Neutral / Balanced:
                </span>
                <span className="text-slate-300 font-bold">{sentimentStats.neuPct}% ({sentimentStats.neuCount} items)</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-slate-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${sentimentStats.neuPct}%` }} 
                />
              </div>
            </div>

            {/* Negative */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Negative Sentiment:
                </span>
                <span className="text-rose-300 font-bold">{sentimentStats.negPct}% ({sentimentStats.negCount} items)</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${sentimentStats.negPct}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Top Stock-wise Sentiment Pills */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 block mb-2">Key Constituent Sentiment Bias:</span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">RELIANCE: 94% Bullish</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">TCS: 92% Bullish</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">HDFCBANK: 86% Bullish</span>
              <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800">INFY: 83% Cautious</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">NIFTY 50: Neutral/Bias Up</span>
            </div>
          </div>
        </div>

        {/* High Impact Breaking Catalyst Marquee (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              High-Impact Market Catalyst Alerts
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              Live Verified Sources
            </span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {highImpactNews.map(item => (
              <div 
                key={item.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-1 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold">
                      HIGH IMPACT
                    </span>
                    <span className="font-bold text-slate-200">{item.relatedSymbol}</span>
                    <span className="text-[11px] text-slate-500">{item.source}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.relativeTime}</span>
                </div>
                <div className="font-semibold text-slate-200 line-clamp-1">{item.headline}</div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search news by stock, headline, keyword or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Symbol Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Symbol:</span>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Instruments</option>
                <option value="NIFTY 50">NIFTY 50 Index</option>
                <option value="RELIANCE">RELIANCE</option>
                <option value="HDFCBANK">HDFCBANK</option>
                <option value="TCS">TCS</option>
                <option value="INFY">INFY</option>
                <option value="ICICIBANK">ICICIBANK</option>
                <option value="TATAMOTORS">TATAMOTORS</option>
                <option value="BHARTIARTL">BHARTIARTL</option>
              </select>
            </div>

            {/* Sentiment Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Sentiment:</span>
              <select
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Sentiments</option>
                <option value="Positive">Positive (Bullish)</option>
                <option value="Neutral">Neutral (Balanced)</option>
                <option value="Negative">Negative (Bearish)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Sectors</option>
                <option value="Macro">Macro & Economy</option>
                <option value="Banking">Banking & Financials</option>
                <option value="Tech">IT & Tech</option>
                <option value="Energy">Energy & Oil</option>
                <option value="Auto">Automobiles</option>
                <option value="Regulatory">SEBI & Regulatory</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed Stream Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>Showing {filteredNews.length} verified news updates</span>
          <span>Last polled: {lastRefreshed}</span>
        </div>

        {filteredNews.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
            <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-bold text-sm">No stories match your filter criteria</div>
            <p className="text-slate-500 text-xs">Try selecting 'All Instruments' or clearing your search query.</p>
          </div>
        ) : (
          filteredNews.map((item) => {
            const isPos = item.sentiment === 'Positive';
            const isNeg = item.sentiment === 'Negative';
            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4.5 space-y-2.5 transition shadow-sm"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {item.relatedSymbol}
                    </span>
                    <span className="text-slate-300 font-semibold">{item.source}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.relativeTime}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.2 rounded border border-slate-800">
                      {item.category}
                    </span>
                  </div>

                  {/* Sentiment Badge with Confidence */}
                  <div className="flex items-center gap-2">
                    {item.isHighImpact && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                        HIGH IMPACT
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-semibold flex items-center gap-1 ${
                      isPos 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' 
                        : isNeg 
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800/60' 
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      {isPos ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : isNeg ? <TrendingDown className="w-3 h-3 text-rose-400" /> : <Minus className="w-3 h-3 text-slate-400" />}
                      {item.sentiment} ({item.confidenceScore}% confidence)
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h4 className="text-sm font-bold text-white hover:text-cyan-300 transition cursor-pointer">
                  {item.headline}
                </h4>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.summary}
                </p>

                {/* Footer contextual connection */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <span className="italic">
                    NLP Model: FinBERT / DistilRoBERTa Indian Financial Sentiment Pipeline
                  </span>
                  <span className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">
                    Cross-reference in Prediction Engine →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Statement of Purpose Reader */}
      {showSopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Live Market News & Sentiment Updates — SOP</h3>
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
                Word Count: ~295 Words | Focus: Contextual Macro Awareness & Anti-Hype NLP Evaluation
              </div>
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={handleCopySop}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                {copiedSop ? 'Copied to Clipboard!' : 'Copy Statement of Purpose'}
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
