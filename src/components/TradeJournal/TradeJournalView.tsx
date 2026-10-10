import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry, EmotionState, SetupQuality, MarketRegime, Asset } from '../../types/quant';
import { INITIAL_JOURNAL_ENTRIES } from '../../data/journalData';
import { exportJournalToPDF } from '../../utils/pdfExport';
import { 
  BookOpen, Plus, Search, Filter, CheckCircle2, XCircle, Star, AlertTriangle, 
  TrendingUp, TrendingDown, IndianRupee, Tag, Brain, Heart, Shield, Sparkles, 
  Trash2, Edit3, Download, RefreshCw, CheckSquare, MessageSquare, Award, FileText, FileDown
} from 'lucide-react';

interface TradeJournalViewProps {
  universe: Asset[];
}

const STORAGE_KEY = 'quantedge_trade_journal_v1';

export const TradeJournalView: React.FC<TradeJournalViewProps> = ({ universe }) => {
  // Load from localStorage or use initial default entries
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load journal entries from localStorage', e);
    }
    return INITIAL_JOURNAL_ENTRIES;
  });

  // Save to localStorage whenever entries change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save journal entries', e);
    }
  }, [entries]);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form Fields
  const [symbol, setSymbol] = useState<string>('RELIANCE');
  const [tradeType, setTradeType] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<number>(2950);
  const [exitPrice, setExitPrice] = useState<number>(3025);
  const [quantity, setQuantity] = useState<number>(100);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [strategyUsed, setStrategyUsed] = useState<string>('Dual SMA Crossover');
  const [emotionState, setEmotionState] = useState<EmotionState>('Disciplined');
  const [setupQuality, setSetupQuality] = useState<SetupQuality>('A');
  const [followedPlan, setFollowedPlan] = useState<boolean>(true);
  const [disciplineRating, setDisciplineRating] = useState<number>(5);
  const [marketRegime, setMarketRegime] = useState<MarketRegime>('Trending Bull');
  const [preTradeRationale, setPreTradeRationale] = useState<string>('');
  const [postTradeReflection, setPostTradeReflection] = useState<string>('');
  const [lessonsLearned, setLessonsLearned] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['Breakout']);
  const [checklist, setChecklist] = useState([
    { label: 'Waited for candle close confirmation before entering', checked: true },
    { label: 'Risk capped to <1.5% of total portfolio capital', checked: true },
    { label: 'Stop-loss strictly calculated and identified beforehand', checked: true },
    { label: 'Verified no immediate conflicting NSE news or RBI announcement', checked: true },
    { label: 'Calm emotional state (no revenge trading, anxiety, or FOMO)', checked: true },
  ]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEmotion, setFilterEmotion] = useState<string>('ALL');
  const [filterQuality, setFilterQuality] = useState<string>('ALL');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');

  // Computed Auto P&L
  const calculatedPnl = useMemo(() => {
    if (tradeType === 'LONG') {
      return (exitPrice - entryPrice) * quantity;
    } else {
      return (entryPrice - exitPrice) * quantity;
    }
  }, [entryPrice, exitPrice, quantity, tradeType]);

  // Overall Discipline Statistics
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    if (totalEntries === 0) {
      return {
        totalPnl: 0,
        winRate: 0,
        disciplineScore: 0,
        avgRating: 0,
        followedPlanCount: 0,
        fomoCount: 0,
        fomoPnl: 0,
        disciplinedPnl: 0,
      };
    }

    const totalPnl = entries.reduce((sum, e) => sum + e.pnl, 0);
    const winCount = entries.filter(e => e.pnl > 0).length;
    const winRate = (winCount / totalEntries) * 100;
    const followedPlanCount = entries.filter(e => e.followedPlan).length;
    const disciplineScore = (followedPlanCount / totalEntries) * 100;
    const avgRating = entries.reduce((sum, e) => sum + e.disciplineRating, 0) / totalEntries;

    const fomoEntries = entries.filter(e => e.emotionState === 'FOMO' || e.emotionState === 'Revenge Trade');
    const fomoPnl = fomoEntries.reduce((sum, e) => sum + e.pnl, 0);

    const disciplinedEntries = entries.filter(e => e.emotionState === 'Disciplined');
    const disciplinedPnl = disciplinedEntries.reduce((sum, e) => sum + e.pnl, 0);

    return {
      totalPnl,
      winRate,
      disciplineScore,
      avgRating,
      followedPlanCount,
      fomoCount: fomoEntries.length,
      fomoPnl,
      disciplinedPnl,
    };
  }, [entries]);

  // Filtered Entries List
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = 
        e.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.strategyUsed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.preTradeRationale.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.lessonsLearned.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEmotion = filterEmotion === 'ALL' || e.emotionState === filterEmotion;
      const matchesQuality = filterQuality === 'ALL' || e.setupQuality === filterQuality;
      const matchesPlan = 
        filterPlan === 'ALL' || 
        (filterPlan === 'YES' && e.followedPlan) || 
        (filterPlan === 'NO' && !e.followedPlan);

      return matchesSearch && matchesEmotion && matchesQuality && matchesPlan;
    });
  }, [entries, searchQuery, filterEmotion, filterQuality, filterPlan]);

  // Open modal for new entry
  const handleOpenNewModal = () => {
    setEditingEntryId(null);
    setSymbol(universe[1]?.symbol || 'RELIANCE');
    setTradeType('LONG');
    setEntryPrice(universe[1]?.price || 2950);
    setExitPrice(Number(((universe[1]?.price || 2950) * 1.02).toFixed(2)));
    setQuantity(50);
    setDate(new Date().toISOString().split('T')[0]);
    setStrategyUsed('Dual SMA Crossover');
    setEmotionState('Disciplined');
    setSetupQuality('A');
    setFollowedPlan(true);
    setDisciplineRating(5);
    setMarketRegime('Trending Bull');
    setPreTradeRationale('');
    setPostTradeReflection('');
    setLessonsLearned('');
    setTags(['Plan Followed']);
    setChecklist([
      { label: 'Waited for candle close confirmation before entering', checked: true },
      { label: 'Risk capped to <1.5% of total portfolio capital', checked: true },
      { label: 'Stop-loss strictly calculated and identified beforehand', checked: true },
      { label: 'Verified no immediate conflicting NSE news or RBI announcement', checked: true },
      { label: 'Calm emotional state (no revenge trading, anxiety, or FOMO)', checked: true },
    ]);
    setIsModalOpen(true);
  };

  // Open modal for editing existing entry
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setSymbol(entry.symbol);
    setTradeType(entry.tradeType);
    setEntryPrice(entry.entryPrice);
    setExitPrice(entry.exitPrice);
    setQuantity(entry.quantity);
    setDate(entry.date);
    setStrategyUsed(entry.strategyUsed);
    setEmotionState(entry.emotionState);
    setSetupQuality(entry.setupQuality);
    setFollowedPlan(entry.followedPlan);
    setDisciplineRating(entry.disciplineRating);
    setMarketRegime(entry.marketRegime);
    setPreTradeRationale(entry.preTradeRationale);
    setPostTradeReflection(entry.postTradeReflection);
    setLessonsLearned(entry.lessonsLearned);
    setTags(entry.tags);
    setChecklist(entry.checklistItems);
    setIsModalOpen(true);
  };

  // Save Entry (Create or Update)
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: JournalEntry = {
      id: editingEntryId || `JRN-${Date.now().toString().slice(-4)}`,
      date,
      symbol,
      tradeType,
      entryPrice: Number(entryPrice),
      exitPrice: Number(exitPrice),
      quantity: Number(quantity),
      pnl: calculatedPnl,
      strategyUsed,
      emotionState,
      setupQuality,
      followedPlan,
      disciplineRating,
      marketRegime,
      preTradeRationale: preTradeRationale || 'Logged discretionary setup with quantitative checklist.',
      postTradeReflection: postTradeReflection || 'Trade concluded as per market dynamics.',
      lessonsLearned: lessonsLearned || 'Continue monitoring disciplined execution.',
      tags: tags.length > 0 ? tags : ['Discipline'],
      checklistItems: checklist,
      createdAt: new Date().toISOString(),
    };

    if (editingEntryId) {
      setEntries(prev => prev.map(item => item.id === editingEntryId ? newEntry : item));
    } else {
      setEntries(prev => [newEntry, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete Entry
  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  // Quick Reset to Default Sample Data
  const handleResetSampleData = () => {
    if (confirm('Reset journal to standard sample entries?')) {
      setEntries(INITIAL_JOURNAL_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_JOURNAL_ENTRIES));
    }
  };

  // Add a Tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Date', 'Symbol', 'Type', 'EntryPrice', 'ExitPrice', 'Quantity', 
      'PnL', 'Strategy', 'Emotion', 'SetupQuality', 'FollowedPlan', 'DisciplineStars', 
      'MarketRegime', 'PreTradeRationale', 'PostTradeReflection', 'LessonsLearned', 'Tags'
    ];
    const rows = entries.map(e => [
      e.id,
      e.date,
      e.symbol,
      e.tradeType,
      e.entryPrice,
      e.exitPrice,
      e.quantity,
      e.pnl,
      `"${e.strategyUsed.replace(/"/g, '""')}"`,
      e.emotionState,
      e.setupQuality,
      e.followedPlan ? 'YES' : 'NO',
      e.disciplineRating,
      e.marketRegime,
      `"${e.preTradeRationale.replace(/"/g, '""')}"`,
      `"${e.postTradeReflection.replace(/"/g, '""')}"`,
      `"${e.lessonsLearned.replace(/"/g, '""')}"`,
      `"${e.tags.join(';')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QuantEdge_Trade_Discipline_Journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfToast, setPdfToast] = useState<string | null>(null);

  // Export to PDF Document
  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      const targetEntries = filteredEntries.length > 0 ? filteredEntries : entries;
      exportJournalToPDF(targetEntries);
      setPdfToast(`PDF Document successfully downloaded (${targetEntries.length} trade logs with reflections)!`);
      setTimeout(() => setPdfToast(null), 4500);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getEmotionBadge = (emotion: EmotionState) => {
    switch (emotion) {
      case 'Disciplined':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'FOMO':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'Hesitant':
        return 'bg-sky-950/60 text-sky-300 border-sky-800/60';
      case 'Revenge Trade':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'Greedy':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'Fearful':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
    }
  };

  const getQualityBadge = (q: SetupQuality) => {
    switch (q) {
      case 'A+': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'A': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'B': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'C': return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Qualitative Trade Journal & Discipline Hub</h2>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                Psychology & Rule Auditing
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Log subjective notes, emotional triggers, pre-trade rationales, and adherence checklist alongside quantitative outcomes to build long-term trading discipline.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenNewModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log New Trade Note
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Export complete journal & subjective reflections to PDF document"
            >
              <FileDown className="w-4 h-4" />
              {isExportingPdf ? 'Generating PDF...' : 'Export PDF'}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Export Journal to CSV"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleResetSampleData}
              className="p-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Toast Notification */}
        {pdfToast && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-lg text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pdfToast}</span>
            </div>
            <button onClick={() => setPdfToast(null)} className="text-emerald-400 hover:text-white cursor-pointer ml-3">✕</button>
          </div>
        )}
      </div>

      {/* Primary Qualitative Discipline KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Trading Discipline Score</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {stats.disciplineScore.toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-500">
            {stats.followedPlanCount} of {entries.length} trades strictly followed pre-planned rules
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Logged P&L</span>
            <IndianRupee className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-2xl font-bold font-mono ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.totalPnl >= 0 ? '+' : ''}₹{stats.totalPnl.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Win Rate: {stats.winRate.toFixed(1)}% across logged trades
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Discipline Rating</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 flex items-center gap-1">
            <span>{stats.avgRating.toFixed(1)}</span>
            <span className="text-sm font-normal text-slate-500">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Self-evaluated execution quality and patience rating
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Emotional Pitfall Drag</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-2xl font-bold font-mono ${stats.fomoPnl <= 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {stats.fomoPnl >= 0 ? '+' : ''}₹{stats.fomoPnl.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            {stats.fomoCount} trades logged with FOMO or Revenge trading impulse
          </p>
        </div>
      </div>

      {/* Psychology Insight Callout */}
      {stats.fomoCount > 0 && stats.fomoPnl < 0 && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-3 text-xs">
          <Brain className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300">Quantitative Psychology Takeaway:</strong>{' '}
            <span className="text-slate-300">
              Your {stats.fomoCount} emotional/FOMO trades cost you a combined loss of{' '}
              <strong className="text-rose-400 font-mono">₹{Math.abs(stats.fomoPnl).toLocaleString()}</strong>. In contrast, trades where you maintained emotional discipline delivered{' '}
              <strong className="text-emerald-400 font-mono">+₹{stats.disciplinedPnl.toLocaleString()}</strong>. Eliminating FOMO alone significantly increases your platform CAGR!
            </span>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by stock, strategy, rationale, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Emotion Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Emotion:</span>
              <select
                value={filterEmotion}
                onChange={(e) => setFilterEmotion(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Emotions</option>
                <option value="Disciplined">Disciplined</option>
                <option value="FOMO">FOMO</option>
                <option value="Hesitant">Hesitant</option>
                <option value="Revenge Trade">Revenge Trade</option>
                <option value="Greedy">Greedy</option>
                <option value="Fearful">Fearful</option>
              </select>
            </div>

            {/* Quality Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Quality:</span>
              <select
                value={filterQuality}
                onChange={(e) => setFilterQuality(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Setups</option>
                <option value="A+">Grade A+</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            {/* Plan Adherence Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Plan:</span>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All</option>
                <option value="YES">Followed Plan (✓)</option>
                <option value="NO">Violated Plan (✗)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-bold text-sm">No journal entries match your filters</div>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Try adjusting your search criteria or log a new subjective trading reflection to cultivate quantitative discipline.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Trade Note
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 space-y-4 transition shadow-sm"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    entry.tradeType === 'LONG' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {entry.tradeType}
                  </span>
                  <span className="font-bold text-base text-white font-mono">{entry.symbol}</span>
                  <span className="text-xs text-slate-400 font-mono">{entry.date}</span>
                  <span className="text-xs text-slate-500 font-mono">({entry.id})</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* PnL Tag */}
                  <div className={`text-base font-bold font-mono flex items-center ${
                    entry.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {entry.pnl >= 0 ? '+' : ''}₹{entry.pnl.toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Emotion Badge */}
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${getEmotionBadge(entry.emotionState)}`}>
                  <Heart className="w-3 h-3" />
                  {entry.emotionState}
                </span>

                {/* Setup Quality */}
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${getQualityBadge(entry.setupQuality)}`}>
                  <Award className="w-3 h-3" />
                  Setup {entry.setupQuality}
                </span>

                {/* Followed Plan Badge */}
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${
                  entry.followedPlan 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' 
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                }`}>
                  {entry.followedPlan ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {entry.followedPlan ? 'Plan Followed' : 'Rule Violated'}
                </span>

                {/* Star Rating */}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  {'★'.repeat(entry.disciplineRating)}
                  {'☆'.repeat(5 - entry.disciplineRating)}
                </span>

                {/* Market Regime */}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  {entry.marketRegime}
                </span>

                {/* Price Details */}
                <span className="text-slate-400 font-mono text-[11px] ml-auto">
                  Entry: ₹{entry.entryPrice} → Exit: ₹{entry.exitPrice} (Qty: {entry.quantity})
                </span>
              </div>

              {/* Subjective Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Pre-Trade Rationale */}
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
                  <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Pre-Trade Rationale & Edge
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    {entry.preTradeRationale}
                  </p>
                </div>

                {/* Post-Trade Reflection */}
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
                  <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    Execution & Emotional Reflection
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    {entry.postTradeReflection}
                  </p>
                </div>

                {/* Lessons Learned */}
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Brain className="w-3 h-3 text-amber-400" />
                    Discipline Rule for Future
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    {entry.lessonsLearned}
                  </p>
                </div>
              </div>

              {/* Checklist & Tags Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                {/* Checklist Summary */}
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Checklist Adherence: <strong className="text-slate-200">
                      {entry.checklistItems.filter(c => c.checked).length} / {entry.checklistItems.length}
                    </strong>
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Log / Edit Trade Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  {editingEntryId ? 'Edit Trade Reflection Note' : 'Log New Qualitative Trade Note'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              {/* Row 1: Stock, Trade Type, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Stock / Instrument</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {universe.map(a => (
                      <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Trade Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTradeType('LONG')}
                      className={`p-2 rounded-lg font-mono font-bold transition border cursor-pointer ${
                        tradeType === 'LONG' 
                          ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500' 
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeType('SHORT')}
                      className={`p-2 rounded-lg font-mono font-bold transition border cursor-pointer ${
                        tradeType === 'SHORT' 
                          ? 'bg-rose-600/30 text-rose-400 border-rose-500' 
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Trade Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Entry Price, Exit Price, Quantity, Auto PnL */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <label className="text-slate-400 block mb-1">Entry Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Exit Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Quantity (Shares)</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Estimated P&L</label>
                  <div className={`p-1.5 rounded font-mono font-bold text-sm ${
                    calculatedPnl >= 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                  }`}>
                    {calculatedPnl >= 0 ? '+' : ''}₹{calculatedPnl.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Row 3: Strategy & Market Regime */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Strategy Used</label>
                  <input
                    type="text"
                    value={strategyUsed}
                    onChange={(e) => setStrategyUsed(e.target.value)}
                    placeholder="e.g. Dual SMA Crossover, RSI Oversold, Donchian Breakout"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Market Regime Context</label>
                  <select
                    value={marketRegime}
                    onChange={(e) => setMarketRegime(e.target.value as MarketRegime)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Trending Bull">Trending Bull</option>
                    <option value="Trending Bear">Trending Bear</option>
                    <option value="Range-Bound">Range-Bound</option>
                    <option value="High Volatility">High Volatility Event</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Psychology Auditing (Emotion, Setup Quality, Followed Plan) */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Qualitative Trading Psychology & Rule Audit
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Emotion */}
                  <div>
                    <label className="text-slate-400 block mb-1">Emotional State</label>
                    <select
                      value={emotionState}
                      onChange={(e) => setEmotionState(e.target.value as EmotionState)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="Disciplined">Disciplined (Patience)</option>
                      <option value="FOMO">FOMO (Chased price)</option>
                      <option value="Hesitant">Hesitant (Second guessed)</option>
                      <option value="Revenge Trade">Revenge Trade (Anger)</option>
                      <option value="Greedy">Greedy (Failed to take target)</option>
                      <option value="Fearful">Fearful (Cut winner early)</option>
                    </select>
                  </div>

                  {/* Setup Quality */}
                  <div>
                    <label className="text-slate-400 block mb-1">Setup Quality Grade</label>
                    <select
                      value={setupQuality}
                      onChange={(e) => setSetupQuality(e.target.value as SetupQuality)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="A+">A+ (Perfect confluence)</option>
                      <option value="A">A (Standard valid setup)</option>
                      <option value="B">B (Mediocre / Compromised)</option>
                      <option value="C">C (Boredom / Low probability)</option>
                    </select>
                  </div>

                  {/* Plan Adherence Toggle */}
                  <div>
                    <label className="text-slate-400 block mb-1">Followed Plan?</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFollowedPlan(true)}
                        className={`flex-1 p-1.5 rounded font-semibold text-xs border cursor-pointer ${
                          followedPlan ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        YES (✓)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFollowedPlan(false)}
                        className={`flex-1 p-1.5 rounded font-semibold text-xs border cursor-pointer ${
                          !followedPlan ? 'bg-rose-600/30 text-rose-300 border-rose-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        NO (✗)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rating 1 to 5 Stars */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Execution Discipline Rating:</span>
                    <span className="text-amber-400 font-bold">{disciplineRating} of 5 Stars</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setDisciplineRating(star)}
                        className={`flex-1 py-1 rounded text-center border cursor-pointer transition ${
                          disciplineRating >= star
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pre-Trade Checklist */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-300 font-medium flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Pre-Trade Discipline Checklist
                </div>
                <div className="space-y-1.5">
                  {checklist.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => {
                          const updated = [...checklist];
                          updated[idx].checked = e.target.checked;
                          setChecklist(updated);
                        }}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subjective Text Questions */}
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    1. Pre-Trade Rationale & Edge ("Why did I enter this specific trade?")
                  </label>
                  <textarea
                    rows={2}
                    value={preTradeRationale}
                    onChange={(e) => setPreTradeRationale(e.target.value)}
                    placeholder="e.g. Breakout above ₹2940 pivot with expanding NSE volume. Defined risk-to-reward 1:2.5 with stop below 20-day SMA."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    2. Post-Trade Reflection & Execution ("How did I handle trade management mentally?")
                  </label>
                  <textarea
                    rows={2}
                    value={postTradeReflection}
                    onChange={(e) => setPostTradeReflection(e.target.value)}
                    placeholder="e.g. Did I cut profits prematurely? Did I move my stop-loss wider? Did I feel anxiety during pullbacks?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    3. Key Lessons Learned ("What single rule will improve my future execution?")
                  </label>
                  <textarea
                    rows={2}
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    placeholder="e.g. Never enter on the opening 5-minute excitement candle without waiting for the 15-minute range to establish."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">Tags (Discipline / Setup labels)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="e.g. Breakout, FOMO, StopHit, TrendFollowing"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700 flex items-center gap-1"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-sm"
                >
                  {editingEntryId ? 'Update Reflection' : 'Save Journal Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
