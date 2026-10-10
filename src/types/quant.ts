export interface Asset {
  symbol: string;
  name: string;
  category: 'Tech' | 'ETF' | 'Defensive' | 'Commodity' | 'Crypto' | 'Fixed Income';
  price: number;
  change24h: number;
  history: number[]; // Daily closing prices for last 252 trading days (~1 year)
  volatility: number; // Annualized standard deviation
  annualReturn: number; // Historical annualized return
  beta: number; // Beta vs SPY
}

export interface PortfolioAsset {
  symbol: string;
  weight: number; // 0.0 to 1.0 (sums to 1.0)
}

export interface PortfolioMetrics {
  annualizedReturn: number; // e.g. 0.18 (18%)
  volatility: number; // e.g. 0.14 (14%)
  sharpeRatio: number; // e.g. 1.15
  sortinoRatio: number; // e.g. 1.62
  maxDrawdown: number; // e.g. -0.15 (-15%)
  var95: number; // Value at Risk 95% (1-day or 1-year)
  var99: number; // Value at Risk 99%
  cvar95: number; // Conditional VaR / Expected Shortfall
  beta: number;
  totalValue: number;
}

export interface EfficientFrontierPoint {
  volatility: number;
  returnVal: number;
  sharpe: number;
  weights: Record<string, number>;
  isMaxSharpe?: boolean;
  isMinVol?: boolean;
  isCurrent?: boolean;
}

export interface MonteCarloResult {
  percentiles: {
    day: number;
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  }[];
  samplePaths: number[][]; // 8-10 sample lines to draw
  expectedFinalValue: number;
  p5FinalValue: number;
  p95FinalValue: number;
  probProfit: number;
  probTargetReturn: number;
  probSevereDrawdown: number;
}

export type BotStrategyType = 
  | 'sma_cross'
  | 'mean_reversion'
  | 'momentum_roc'
  | 'volatility_breakout';

export interface BotStrategyConfig {
  id: BotStrategyType;
  name: string;
  description: string;
  assetSymbol: string;
  allocationPct: number;
  fastPeriod: number;
  slowPeriod: number;
  rsiThreshold?: number;
  stopLossPct: number;
  takeProfitPct: number;
  trailingStop: boolean;
  // Indian Market Costs & Execution Friction
  brokeragePerTrade: number; // Flat ₹20 per trade or bps
  sttPct: number; // Securities Transaction Tax (0.1% equity delivery)
  slippagePct: number; // Execution slippage (0.05%)
  enableWalkForward: boolean; // Overfitting prevention
}

export interface BotSignal {
  id: string;
  timestamp: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  confidence: number;
  reason: string;
  indicatorValues: Record<string, number>;
}

export interface BotTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  shares: number;
  total: number;
  pnl?: number;
  pnlPct?: number;
  costs?: number; // Total friction (Brokerage + STT + Slippage)
  timestamp: string;
  status: 'FILLED' | 'PENDING';
}

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  annualizedReturn: number; // CAGR
  benchmarkReturn: number; // buy & hold NIFTY 50
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  totalCostsIncurred: number; // Total STT + Brokerage + Slippage
  // Overfitting Prevention
  inSampleCAGR: number;
  outOfSampleCAGR: number;
  walkForwardEfficiency: number; // e.g. 84%
  equityCurve: { date: string; strategy: number; benchmark: number; drawdown: number; isOutOfSample?: boolean }[];
  trades: BotTrade[];
}

export interface PredictionRow {
  date: string;
  symbol: string;
  predictedClose: number;
  actualClose: number;
  actualOpen: number;
  actualHigh: number;
  actualLow: number;
  difference: number; // actual - predicted (₹)
  percentageError: number; // |(actual - predicted) / actual| * 100
  predictedDirection: 'UP' | 'DOWN';
  actualDirection: 'UP' | 'DOWN';
  isDirectionCorrect: boolean;
}

export interface PredictionAnalysisResult {
  symbol: string;
  modelName: string;
  totalDaysEvaluated: number;
  mae: number; // Mean Absolute Error (₹)
  rmse: number; // Root Mean Squared Error (₹)
  mape: number; // Mean Absolute Percentage Error (%)
  directionalAccuracy: number; // % of days direction was predicted correctly
  upDirectionCount: number;
  downDirectionCount: number;
  rows: PredictionRow[];
}

export type EmotionState = 'Disciplined' | 'FOMO' | 'Hesitant' | 'Revenge Trade' | 'Greedy' | 'Fearful';
export type SetupQuality = 'A+' | 'A' | 'B' | 'C';
export type MarketRegime = 'Trending Bull' | 'Trending Bear' | 'Range-Bound' | 'High Volatility';

export interface JournalEntry {
  id: string;
  date: string;
  symbol: string;
  tradeType: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  strategyUsed: string;
  emotionState: EmotionState;
  setupQuality: SetupQuality;
  followedPlan: boolean;
  disciplineRating: number; // 1 to 5
  marketRegime: MarketRegime;
  preTradeRationale: string;
  postTradeReflection: string;
  lessonsLearned: string;
  tags: string[];
  checklistItems: { label: string; checked: boolean }[];
  associatedBacktestTradeId?: string;
  createdAt: string;
}

export type NewsSentiment = 'Positive' | 'Negative' | 'Neutral';

export interface MarketNewsItem {
  id: string;
  headline: string;
  source: string;
  publishedTime: string;
  relativeTime: string;
  summary: string;
  relatedSymbol: string;
  category: 'Index' | 'Banking' | 'Tech' | 'Macro' | 'Regulatory' | 'Auto' | 'Energy';
  sentiment: NewsSentiment;
  confidenceScore: number; // 0 to 100%
  isHighImpact?: boolean;
  impactMagnitude?: 'High' | 'Medium' | 'Low';
  url?: string;
}

