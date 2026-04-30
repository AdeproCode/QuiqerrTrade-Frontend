'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiTrendingUp, FiStar,
  FiBarChart2, FiActivity, FiSearch,
  FiArrowUp, FiArrowDown, FiDollarSign,
  FiRefreshCw, FiPlus, FiMinus
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/helpers';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

// ============================================
// MOCK DATA
// ============================================

const marketTabs: TabItem[] = [
  { value: 'all', label: 'All Tokens', icon: FiActivity },
  { value: 'trending', label: 'Trending', icon: FiTrendingUp },
  { value: 'gainers', label: 'Top Gainers', icon: FiArrowUp },
  { value: 'new', label: 'New', icon: FiStar },
];

const tradingTokens = [
  { _id: 'token1', symbol: 'RMX-NIGHT', name: 'Afro Beat Night Version', artist: 'DJ Wale', originalTrack: 'Afro Beat #01', price: 0.35, priceChange: 24.5, volume24h: 12400, holders: 86, marketCap: 35000, trend: 'up' as const, genre: 'afrobeats', style: 'night' },
  { _id: 'token2', symbol: 'RMX-CHILL', name: 'Summer Chill Remix', artist: 'Producer X', originalTrack: 'Summer Vibes', price: 0.22, priceChange: 18.3, volume24h: 8900, holders: 54, marketCap: 22000, trend: 'up' as const, genre: 'amapiano', style: 'chill' },
  { _id: 'token3', symbol: 'RMX-CLUB', name: 'Club Banger Edit', artist: 'BeatMaster', originalTrack: 'Party Anthem', price: 0.45, priceChange: -5.2, volume24h: 15600, holders: 120, marketCap: 45000, trend: 'down' as const, genre: 'edm', style: 'club' },
  { _id: 'token4', symbol: 'RMX-ACOUSTIC', name: 'Acoustic Love Version', artist: 'GuitarKing', originalTrack: 'Love Song', price: 0.18, priceChange: 12.1, volume24h: 6700, holders: 42, marketCap: 18000, trend: 'up' as const, genre: 'pop', style: 'acoustic' },
  { _id: 'token5', symbol: 'RMX-SPEDUP', name: 'Sped Up Dance Mix', artist: 'SpeedDemon', originalTrack: 'Slow Jam', price: 0.55, priceChange: -2.8, volume24h: 21000, holders: 200, marketCap: 55000, trend: 'down' as const, genre: 'hiphop', style: 'spedup' },
  { _id: 'token6', symbol: 'RMX-LOFI', name: 'LoFi Study Beats', artist: 'ChillVibes', originalTrack: 'Focus Track', price: 0.28, priceChange: 32.4, volume24h: 9800, holders: 95, marketCap: 28000, trend: 'up' as const, genre: 'rnb', style: 'chill' },
  { _id: 'token7', symbol: 'RMX-DRILL', name: 'UK Drill Remix', artist: 'LondonBeats', originalTrack: 'Street Anthem', price: 0.42, priceChange: 8.7, volume24h: 18500, holders: 150, marketCap: 42000, trend: 'up' as const, genre: 'drill', style: 'club' },
  { _id: 'token8', symbol: 'RMX-INSTRUMENTAL', name: 'Instrumental Version', artist: 'PianoMan', originalTrack: 'Vocal Hit', price: 0.15, priceChange: -1.2, volume24h: 5400, holders: 30, marketCap: 15000, trend: 'down' as const, genre: 'pop', style: 'instrumental' },
];

const priceChartData = [
  { time: 'Mon', price: 0.20, volume: 15000 },
  { time: 'Tue', price: 0.25, volume: 22000 },
  { time: 'Wed', price: 0.18, volume: 18000 },
  { time: 'Thu', price: 0.30, volume: 28000 },
  { time: 'Fri', price: 0.28, volume: 25000 },
  { time: 'Sat', price: 0.35, volume: 32000 },
  { time: 'Sun', price: 0.32, volume: 29000 },
];

const volumeData = [
  { genre: 'Afrobeats', volume: 45000 },
  { genre: 'Amapiano', volume: 32000 },
  { genre: 'Hip Hop', volume: 28000 },
  { genre: 'EDM', volume: 38000 },
  { genre: 'R&B', volume: 22000 },
  { genre: 'Drill', volume: 18500 },
  { genre: 'Pop', volume: 15000 },
];

// ============================================
// TRADE MODAL COMPONENT
// ============================================

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: typeof tradingTokens[0] | null;
  action: 'buy' | 'sell' | 'swap';
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, token, action }) => {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!token) return null;

  const estimatedCost = parseFloat(amount || '0') * token.price;
  const actionColors = {
    buy: { bg: 'bg-green-500', text: 'text-green-500', label: 'Buy' },
    sell: { bg: 'bg-red-500', text: 'text-red-500', label: 'Sell' },
    swap: { bg: 'bg-blue-500', text: 'text-blue-500', label: 'Swap' },
  };
  const colors = actionColors[action];

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    
    // Simulate trade
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`${colors.label} order placed for ${amount} ${token.symbol}!`);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${colors.label} ${token.symbol}`} size="md">
      <div className="space-y-4">
        {/* Token Info */}
        <div className="bg-gray-50 dark:bg-dark-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold">{token.symbol}</p>
              <p className="text-sm text-gray-500">{token.name}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatCurrency(token.price, 'USDC', 4)}</p>
              <p className={cn('text-sm', token.trend === 'up' ? 'text-green-500' : 'text-red-500')}>
                {token.trend === 'up' ? '+' : ''}{token.priceChange}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Vol: {formatCurrency(token.volume24h, 'USDC', 0)}</span>
            <span>Holders: {token.holders}</span>
            <span>MCap: {formatCurrency(token.marketCap, 'USDC', 0)}</span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={(value: string) => setAmount(value)}
              rightIcon={<span className="text-sm text-gray-500">{token.symbol}</span>}
            />
          </div>
          {/* Quick Amounts */}
          <div className="flex gap-2 mt-2">
            {[25, 50, 75, 100].map(pct => (
              <Button key={pct} variant="outline" size="sm" fullWidth onClick={() => setAmount((100 * pct / 100).toString())}>
                {pct}%
              </Button>
            ))}
          </div>
        </div>

        {/* Estimated Cost */}
        {amount && (
          <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rate</span>
              <span>1 {token.symbol} = {formatCurrency(token.price, 'USDC', 4)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{action === 'buy' ? 'You Pay' : action === 'sell' ? 'You Receive' : 'Estimated Output'}</span>
              <span className="font-semibold">{formatCurrency(estimatedCost, 'USDC', 2)}</span>
            </div>
            {action === 'swap' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Route</span>
                <span className="text-blue-500">SOL → {token.symbol}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Slippage</span>
              <span>1%</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant={action === 'buy' ? 'success' : action === 'sell' ? 'danger' : 'primary'}
          fullWidth
          size="lg"
          onClick={handleTrade}
          loading={isProcessing}
          loadingText="Processing..."
          disabled={!amount || parseFloat(amount) <= 0}
        >
          {!isProcessing && (
            <>
              {action === 'buy' && <FiPlus className="mr-2" />}
              {action === 'sell' && <FiMinus className="mr-2" />}
              {action === 'swap' && <FiRefreshCw className="mr-2" />}
              {colors.label} {token.symbol}
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeModal, setTradeModal] = useState<{ isOpen: boolean; token: typeof tradingTokens[0] | null; action: 'buy' | 'sell' | 'swap' }>({
    isOpen: false,
    token: null,
    action: 'buy',
  });

  const openTrade = (token: typeof tradingTokens[0], action: 'buy' | 'sell' | 'swap') => {
    setTradeModal({ isOpen: true, token, action });
  };

  const filteredTokens = tradingTokens.filter(token => {
    if (activeTab === 'trending') return token.volume24h > 10000;
    if (activeTab === 'gainers') return token.priceChange > 0 && token.priceChange > 10;
    if (activeTab === 'new') return token.price < 0.25;
    return true;
  }).filter(token => 
    !searchQuery || 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVolume = tradingTokens.reduce((sum, t) => sum + t.volume24h, 0);
  const avgPrice = tradingTokens.reduce((sum, t) => sum + t.price, 0) / tradingTokens.length;
  const gainersCount = tradingTokens.filter(t => t.priceChange > 0).length;
  const totalMarketCap = tradingTokens.reduce((sum, t) => sum + t.marketCap, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Trading Market</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Buy, Sell & Swap music remix tokens
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tokens, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-56"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard label="24h Volume" value={formatCurrency(totalVolume, 'USDC', 0)} change="+12.5%" icon={FiActivity} color="text-blue-500" bgColor="bg-blue-500/10" />
        <QuickStatCard label="Avg Token Price" value={formatCurrency(avgPrice, 'USDC', 4)} change="+5.3%" icon={FiDollarSign} color="text-green-500" bgColor="bg-green-500/10" />
        <QuickStatCard label="Gainers Today" value={`${gainersCount}/${tradingTokens.length}`} change="Tokens up" icon={FiTrendingUp} color="text-purple-500" bgColor="bg-purple-500/10" />
        <QuickStatCard label="Market Cap" value={formatCurrency(totalMarketCap, 'USDC', 0)} change="All tokens" icon={FiBarChart2} color="text-orange-500" bgColor="bg-orange-500/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Market Price Chart" subtitle="7-day price movement"
            action={<div className="flex gap-1">{['1H','24H','7D','30D'].map(range => <Badge key={range} variant="outline" className="cursor-pointer hover:bg-primary-500/10 text-xs">{range}</Badge>)}</div>}
          />
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceChartData}>
                  <defs><linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3}/>
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12}/>
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${v}`}/>
                  <Tooltip contentStyle={{backgroundColor:'#1F2937',border:'none',borderRadius:'12px',color:'#fff'}} formatter={(value:number) => [formatCurrency(value,'USDC',4),'Price']}/>
                  <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fill="url(#priceGradient)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Volume by Genre" subtitle="24h trading volume"/>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3}/>
                  <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickFormatter={(v) => formatCurrency(v,'',0)}/>
                  <YAxis dataKey="genre" type="category" stroke="#9CA3AF" fontSize={11} width={70}/>
                  <Tooltip contentStyle={{backgroundColor:'#1F2937',border:'none',borderRadius:'8px'}}/>
                  <Bar dataKey="volume" fill="#a855f7" radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs items={marketTabs} value={activeTab} onChange={setActiveTab}/>

      {/* Token List with Buy/Sell/Swap */}
      <Card>
        <CardHeader title="Tokens Available for Trading" subtitle={`${filteredTokens.length} tokens listed`}/>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Token</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">24h Change</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Volume</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Holders</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Market Cap</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map((token, index) => (
                  <tr key={token._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <Link href={`/remix/${token._id}`} className="hover:text-primary-500">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold', token.trend === 'up' ? 'bg-green-500' : 'bg-red-500')}>
                            {token.symbol.slice(0,2)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{token.symbol}</p>
                            <p className="text-xs text-gray-500">{token.name}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold">{formatCurrency(token.price,'USDC',4)}</td>
                    <td className={cn('py-3 px-4 text-right text-sm font-medium',token.trend==='up'?'text-green-500':'text-red-500')}>
                      <div className="flex items-center justify-end gap-1">
                        {token.trend==='up'?<FiArrowUp className="w-3 h-3"/>:<FiArrowDown className="w-3 h-3"/>}
                        {token.priceChange>0?'+':''}{token.priceChange}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm">{formatCurrency(token.volume24h,'USDC',0)}</td>
                    <td className="py-3 px-4 text-right text-sm">{formatNumber(token.holders)}</td>
                    <td className="py-3 px-4 text-right text-sm">{formatCurrency(token.marketCap,'USDC',0)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button variant="success" size="sm" onClick={() => openTrade(token, 'buy')}>
                          <FiPlus className="w-3 h-3 mr-1"/>Buy
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => openTrade(token, 'sell')}>
                          <FiMinus className="w-3 h-3 mr-1"/>Sell
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => openTrade(token, 'swap')}>
                          <FiRefreshCw className="w-3 h-3 mr-1"/>Swap
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModal.isOpen}
        onClose={() => setTradeModal({ isOpen: false, token: null, action: 'buy' })}
        token={tradeModal.token}
        action={tradeModal.action}
      />
    </div>
  );
}

// Quick Stat Card
interface QuickStatCardProps {
  label: string; value: string; change: string;
  icon: React.ElementType; color: string; bgColor: string; isPositive?: boolean;
}
const QuickStatCard: React.FC<QuickStatCardProps> = ({ label, value, change, icon: Icon, color, bgColor, isPositive = true }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div><p className="text-sm text-gray-500 mb-1">{label}</p><p className="text-2xl font-bold">{value}</p><p className={cn('text-xs mt-1',isPositive?'text-green-500':'text-red-500')}>{change}</p></div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',bgColor)}><Icon className={cn('w-5 h-5',color)}/></div>
      </div>
    </CardContent>
  </Card>
);