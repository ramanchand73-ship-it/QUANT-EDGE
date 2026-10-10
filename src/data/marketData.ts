import { Asset } from '../types/quant';

function generateHistoricalPrices(basePrice: number, annualizedReturn: number, annualizedVol: number, days: number = 252, seedOffset: number = 1): number[] {
  const dt = 1 / 252;
  const drift = (annualizedReturn - 0.5 * annualizedVol * annualizedVol) * dt;
  const volStep = annualizedVol * Math.sqrt(dt);
  
  const prices: number[] = [basePrice];
  let current = basePrice;
  
  for (let i = 1; i < days; i++) {
    const cycle = Math.sin((i + seedOffset * 17) / 22) * 0.003 + Math.cos((i * 2 + seedOffset * 31) / 47) * 0.002;
    const u1 = Math.abs(Math.sin(i * 12.9898 + seedOffset * 78.233)) % 1 || 0.5;
    const u2 = Math.abs(Math.cos(i * 4.898 + seedOffset * 93.123)) % 1 || 0.5;
    const z = Math.sqrt(-2.0 * Math.log(Math.max(0.0001, u1))) * Math.cos(2.0 * Math.PI * u2);
    
    const ret = drift + cycle + volStep * (z * 0.95);
    current = Math.max(1, current * (1 + ret));
    prices.push(Number(current.toFixed(2)));
  }
  return prices;
}

// NIFTY 50 Benchmark & Top Weighted Indian Equities listed on the NSE
export const ASSET_UNIVERSE: Asset[] = [
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index (Benchmark)',
    category: 'ETF',
    price: 24850.50,
    change24h: 0.72,
    annualReturn: 0.158,
    volatility: 0.134,
    beta: 1.0,
    history: generateHistoricalPrices(21800.0, 0.158, 0.134, 252, 201),
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    category: 'Defensive',
    price: 2980.20,
    change24h: 1.15,
    annualReturn: 0.175,
    volatility: 0.182,
    beta: 1.12,
    history: generateHistoricalPrices(2540.0, 0.175, 0.182, 252, 202),
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    category: 'Defensive',
    price: 1665.40,
    change24h: 0.45,
    annualReturn: 0.125,
    volatility: 0.165,
    beta: 1.08,
    history: generateHistoricalPrices(1490.0, 0.125, 0.165, 252, 203),
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    category: 'Tech',
    price: 4230.00,
    change24h: -0.35,
    annualReturn: 0.192,
    volatility: 0.155,
    beta: 0.88,
    history: generateHistoricalPrices(3550.0, 0.192, 0.155, 252, 204),
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    category: 'Tech',
    price: 1895.80,
    change24h: 1.82,
    annualReturn: 0.228,
    volatility: 0.215,
    beta: 1.22,
    history: generateHistoricalPrices(1480.0, 0.228, 0.215, 252, 205),
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    category: 'Defensive',
    price: 1245.50,
    change24h: 0.90,
    annualReturn: 0.245,
    volatility: 0.178,
    beta: 1.15,
    history: generateHistoricalPrices(990.0, 0.245, 0.178, 252, 206),
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    category: 'Tech',
    price: 1680.10,
    change24h: 2.15,
    annualReturn: 0.385,
    volatility: 0.195,
    beta: 0.92,
    history: generateHistoricalPrices(1180.0, 0.385, 0.195, 252, 207),
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    category: 'Defensive',
    price: 495.60,
    change24h: -0.15,
    annualReturn: 0.142,
    volatility: 0.140,
    beta: 0.65,
    history: generateHistoricalPrices(435.0, 0.142, 0.140, 252, 208),
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    category: 'Defensive',
    price: 3620.00,
    change24h: 0.80,
    annualReturn: 0.215,
    volatility: 0.188,
    beta: 1.10,
    history: generateHistoricalPrices(3050.0, 0.215, 0.188, 252, 209),
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    category: 'Defensive',
    price: 815.75,
    change24h: 1.25,
    annualReturn: 0.265,
    volatility: 0.220,
    beta: 1.30,
    history: generateHistoricalPrices(620.0, 0.265, 0.220, 252, 210),
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    category: 'Tech',
    price: 940.20,
    change24h: 2.45,
    annualReturn: 0.440,
    volatility: 0.285,
    beta: 1.45,
    history: generateHistoricalPrices(680.0, 0.440, 0.285, 252, 211),
  },
];

export interface PortfolioPreset {
  id: string;
  name: string;
  tagline: string;
  allocations: { symbol: string; weight: number }[];
}

export const PORTFOLIO_PRESETS: PortfolioPreset[] = [
  {
    id: 'nifty_leaders',
    name: 'NIFTY 50 Bluechip Core',
    tagline: 'Top capital weighted pillars of Indian market: Reliance, HDFC, TCS & ICICI Bank.',
    allocations: [
      { symbol: 'RELIANCE', weight: 0.30 },
      { symbol: 'HDFCBANK', weight: 0.25 },
      { symbol: 'TCS', weight: 0.25 },
      { symbol: 'ICICIBANK', weight: 0.20 },
    ],
  },
  {
    id: 'india_tech',
    name: 'Indian Tech & Digital Alpha',
    tagline: 'High growth IT services and telecom leaders (TCS, Infosys, Bharti Airtel).',
    allocations: [
      { symbol: 'INFY', weight: 0.35 },
      { symbol: 'TCS', weight: 0.35 },
      { symbol: 'BHARTIARTL', weight: 0.30 },
    ],
  },
  {
    id: 'banking_infra',
    name: 'Banking & Infrastructure Capex',
    tagline: 'India credit expansion & capex theme (HDFC Bank, ICICI Bank, SBI, L&T).',
    allocations: [
      { symbol: 'ICICIBANK', weight: 0.30 },
      { symbol: 'HDFCBANK', weight: 0.25 },
      { symbol: 'LT', weight: 0.25 },
      { symbol: 'SBIN', weight: 0.20 },
    ],
  },
  {
    id: 'auto_consumer',
    name: 'Domestic Consumer & Mobility',
    tagline: 'FMCG and EV auto growth leaders (ITC, Tata Motors, Reliance).',
    allocations: [
      { symbol: 'TATAMOTORS', weight: 0.40 },
      { symbol: 'RELIANCE', weight: 0.35 },
      { symbol: 'ITC', weight: 0.25 },
    ],
  },
];
