import React, { useEffect, useState } from 'react';
import { ASSET_UNIVERSE } from '../data/marketData';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MarketTickerTape: React.FC = () => {
  const [ticks, setTicks] = useState(
    ASSET_UNIVERSE.map(a => ({
      symbol: a.symbol,
      price: a.price,
      change: a.change24h,
      flash: false,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly nudge 1 or 2 assets slightly to simulate live market streaming
      setTicks(prev => {
        const next = [...prev];
        const randomIdx = Math.floor(Math.random() * next.length);
        const delta = (Math.random() - 0.48) * (next[randomIdx].price * 0.001);
        const newPrice = Number((next[randomIdx].price + delta).toFixed(2));
        next[randomIdx] = {
          ...next[randomIdx],
          price: newPrice,
          change: Number((next[randomIdx].change + (delta > 0 ? 0.02 : -0.02)).toFixed(2)),
          flash: true,
        };
        return next;
      });

      setTimeout(() => {
        setTicks(prev => prev.map(t => ({ ...t, flash: false })));
      }, 500);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#0a0f1d] border-b border-slate-800/80 overflow-hidden py-1.5 px-4 text-xs select-none">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider shrink-0 text-[10px] border-r border-slate-800 pr-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>NSE LIVE FEED</span>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          {ticks.map((item) => {
            const isPos = item.change >= 0;
            return (
              <div
                key={item.symbol}
                className={`flex items-center gap-2 font-mono transition-colors duration-300 ${
                  item.flash ? 'bg-slate-800/60 px-1.5 py-0.5 rounded' : ''
                }`}
              >
                <span className="font-bold text-slate-200">{item.symbol}</span>
                <span className="text-slate-300">
                  ₹{item.price >= 1000 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : item.price.toFixed(2)}
                </span>
                <span className={`flex items-center text-[11px] font-medium ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                  {isPos ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
