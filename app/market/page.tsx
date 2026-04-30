'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiTrendingUp, FiStar, FiActivity, FiSearch,
  FiArrowUp, FiArrowDown, FiZap,
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils/helpers';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { AISuggestions } from '@/components/ai/AISuggestions';

const marketTabs: TabItem[] = [
  { value: 'all', label: 'All Remixes', icon: FiActivity },
  { value: 'trending', label: '🔥 Trending', icon: FiTrendingUp },
  { value: 'gainers', label: '📈 Top Gainers', icon: FiArrowUp },
  { value: 'losers', label: '📉 Top Losers', icon: FiArrowDown },
  { value: 'new', label: '🆕 New', icon: FiStar },
  { value: 'hot', label: '🎯 Hot', icon: FiZap },
];

// Mock market data with realistic values
const marketTokens = [
  { id: '1', rank: 1, symbol: 'AFRO-NIGHT', name: 'Afro Beat Night Remix', artist: 'DJ Wale', price: 0.4523, change: 24.5, volume24h: 125400, volumeChange: 15.2, holders: 1286, marketCap: 452300, trend: 'up', hot: true, aiScore: 87, genre: 'afrobeats', plays: 45000, likes: 2300 },
  { id: '2', rank: 2, symbol: 'CHILL-SUMMER', name: 'Summer Chill Vibes', artist: 'Producer X', price: 0.2891, change: 18.3, volume24h: 89100, volumeChange: 22.1, holders: 854, marketCap: 289100, trend: 'up', hot: true, aiScore: 76, genre: 'amapiano', plays: 32000, likes: 1800 },
  { id: '3', rank: 3, symbol: 'CLUB-BANGER', name: 'Club Banger 2026', artist: 'BeatMaster', price: 0.6750, change: -5.2, volume24h: 156000, volumeChange: -3.1, holders: 2120, marketCap: 675000, trend: 'down', hot: false, aiScore: 45, genre: 'edm', plays: 89000, likes: 4500 },
  { id: '4', rank: 4, symbol: 'DRILL-UK', name: 'UK Drill Remix', artist: 'LondonBeats', price: 0.5230, change: 32.4, volume24h: 198500, volumeChange: 45.3, holders: 1450, marketCap: 523000, trend: 'up', hot: true, aiScore: 92, genre: 'drill', plays: 67000, likes: 3400 },
  { id: '5', rank: 5, symbol: 'LOFI-GIRL', name: 'LoFi Study Beats', artist: 'ChillVibes', price: 0.1890, change: 12.1, volume24h: 54200, volumeChange: 8.7, holders: 620, marketCap: 189000, trend: 'up', hot: false, aiScore: 65, genre: 'rnb', plays: 21000, likes: 1200 },
  { id: '6', rank: 6, symbol: 'SPED-NIGHT', name: 'Sped Up Night Mix', artist: 'SpeedDemon', price: 0.3450, change: -2.8, volume24h: 67800, volumeChange: 1.5, holders: 890, marketCap: 345000, trend: 'down', hot: false, aiScore: 38, genre: 'hiphop', plays: 28000, likes: 1500 },
  { id: '7', rank: 7, symbol: 'ACOUSTIC-LOVE', name: 'Acoustic Love Edit', artist: 'GuitarKing', price: 0.2340, change: 8.7, volume24h: 43200, volumeChange: 12.3, holders: 450, marketCap: 234000, trend: 'up', hot: false, aiScore: 55, genre: 'pop', plays: 15000, likes: 800 },
  { id: '8', rank: 8, symbol: 'AMAPIANO-GROOVE', name: 'Amapiano Groove Mix', artist: 'MzansiBeats', price: 0.5670, change: 15.8, volume24h: 89200, volumeChange: 28.4, holders: 980, marketCap: 567000, trend: 'up', hot: true, aiScore: 81, genre: 'amapiano', plays: 41000, likes: 2100 },
  { id: '9', rank: 9, symbol: 'TRAP-KING', name: 'Trap King Remix', artist: 'TrapLord', price: 0.4120, change: -1.5, volume24h: 76500, volumeChange: -5.2, holders: 750, marketCap: 412000, trend: 'down', hot: false, aiScore: 42, genre: 'hiphop', plays: 35000, likes: 1900 },
  { id: '10', rank: 10, symbol: 'HOUSE-FEVER', name: 'House Fever Edit', artist: 'DeepHouseDJ', price: 0.3780, change: 21.3, volume24h: 92300, volumeChange: 35.6, holders: 1100, marketCap: 378000, trend: 'up', hot: true, aiScore: 73, genre: 'edm', plays: 52000, likes: 2800 },
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter tokens
  const filteredTokens = marketTokens.filter(token => {
    if (activeTab === 'trending') return token.volumeChange > 10 && token.trend === 'up';
    if (activeTab === 'gainers') return token.change > 0;
    if (activeTab === 'losers') return token.change < 0;
    if (activeTab === 'new') return token.rank > 7;
    if (activeTab === 'hot') return token.hot;
    return true;
  }).filter(token =>
    !searchQuery || 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by change for gainers/losers
  if (activeTab === 'gainers') filteredTokens.sort((a, b) => b.change - a.change);
  if (activeTab === 'losers') filteredTokens.sort((a, b) => a.change - b.change);

  // Market overview
  const totalVolume = marketTokens.reduce((sum, t) => sum + t.volume24h, 0);
  const totalMarketCap = marketTokens.reduce((sum, t) => sum + t.marketCap, 0);
  const gainersCount = marketTokens.filter(t => t.change > 0).length;
  const losCount = marketTokens.filter(t => t.change < 0).length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                🎵 Remix Market
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </h1>
              <p className="text-gray-500 mt-1">Live prices, trending remixes, and trading opportunities</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tokens, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-64"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-dark-200 rounded-xl p-1">
                <button onClick={() => setViewMode('table')} className={cn('px-3 py-1.5 rounded-lg text-sm', viewMode === 'table' ? 'bg-white dark:bg-dark-300 shadow' : '')}>📊</button>
                <button onClick={() => setViewMode('grid')} className={cn('px-3 py-1.5 rounded-lg text-sm', viewMode === 'grid' ? 'bg-white dark:bg-dark-300 shadow' : '')}>🎴</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Market Overview Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase">24h Volume</p>
                <p className="text-lg font-bold text-blue-500">{formatCurrency(totalVolume, 'USDC', 0)}</p>
                <p className="text-xs text-green-500">+12.5%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Market Cap</p>
                <p className="text-lg font-bold text-purple-500">{formatCurrency(totalMarketCap, 'USDC', 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Tokens</p>
                <p className="text-lg font-bold">{marketTokens.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">▲ Gainers</p>
                <p className="text-lg font-bold text-green-500">{gainersCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">▼ Losers</p>
                <p className="text-lg font-bold text-red-500">{losCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      <AISuggestions />
        {/* Tabs */}
        <Tabs items={marketTabs} value={activeTab} onChange={setActiveTab} className='flex flex-row' />

        {/* Token List Table */}
        <Card>
          <CardHeader title={`${filteredTokens.length} Remix Tokens`} subtitle="Sorted by market activity" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-300">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase w-8">#</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Token / Artist</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">AI Score</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">24h Change</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Volume</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Holders</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Mkt Cap</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Last 7D</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((token, index) => (
                    <tr key={token.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-dark-300/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <Link href={`/remix/${token.id}`} className="hover:text-primary-500">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold', token.trend === 'up' ? 'bg-green-500' : 'bg-red-500')}>
                              {token.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{token.symbol}</p>
                              <p className="text-xs text-gray-500">{token.artist}</p>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn('text-sm font-medium', token.aiScore > 70 ? 'text-green-500' : token.aiScore > 40 ? 'text-yellow-500' : 'text-red-500')}>
                          {token.aiScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold">{formatCurrency(token.price, 'USDC', 4)}</td>
                      <td className={cn('py-3 px-4 text-right text-sm font-medium', token.trend === 'up' ? 'text-green-500' : 'text-red-500')}>
                        <div className="flex items-center justify-end gap-1">
                          {token.trend === 'up' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                          {token.change > 0 ? '+' : ''}{token.change}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm">{formatCurrency(token.volume24h, 'USDC', 0)}</td>
                      <td className="py-3 px-4 text-right text-sm">{formatNumber(token.holders)}</td>
                      <td className="py-3 px-4 text-right text-sm">{formatCurrency(token.marketCap, 'USDC', 0)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="h-8 w-20 mx-auto">
                          <svg viewBox="0 0 80 30" className="w-full h-full">
                            <path d="M0,25 L10,20 L20,22 L30,10 L40,15 L50,5 L60,12 L70,8 L80,3" 
                              fill="none" stroke={token.trend === 'up' ? '#22c55e' : '#ef4444'} strokeWidth="1.5" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/trade/${token.id}`}>
                            <Button variant="success" size="sm" className="!px-3 !py-1 text-xs">Buy</Button>
                          </Link>
                          <Link href={`/trade/${token.id}`}>
                            <Button variant="danger" size="sm" className="!px-3 !py-1 text-xs">Sell</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}