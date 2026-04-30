'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FiPlus, FiMinus, FiRefreshCw, FiStar, FiBell,
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/helpers';
import { formatCurrency } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TraderInsight } from '@/components/ai/TraderInsight';

// Mock chart data
const generateChartData = () => {
  const data: { time: number; price: number; volume: number }[] = [];
  let price = 0.35;
  for (let i = 0; i < 100; i++) {
    price = price + (Math.random() - 0.48) * 0.02;
    if (price < 0.2) price = 0.2;
    if (price > 0.6) price = 0.6;
    data.push({ 
      time: i, 
      price: Math.round(price * 10000) / 10000, 
      volume: Math.floor(Math.random() * 5000) + 2000 
    });
  }
  return data;
};

const chartData = generateChartData();

// Safe access with fallback defaults
const firstDataPoint = chartData[0] ?? { price: 0.35 };
const lastDataPoint = chartData[chartData.length - 1] ?? { price: 0.35 };
const currentPrice = lastDataPoint.price;
const prevPrice = firstDataPoint.price;
const priceChange = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;

export default function TradePage() {
  const params = useParams();
  const tokenId = params['id'] as string;
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'swap'>('buy');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [chartTimeframe, setChartTimeframe] = useState('1H');

  const estimatedTotal = parseFloat(amount || '0') * currentPrice;

  const handleAmountChange = (value: string): void => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleTrade = () => {
    toast.success(`${activeTab === 'buy' ? 'Buy' : activeTab === 'sell' ? 'Sell' : 'Swap'} order placed!`);
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <div className="max-w-[1600px] mx-auto p-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-bold">RMX-NIGHT</h1>
            <Badge variant="outline" className="text-xs">Afrobeat Night Remix</Badge>
            <span className={cn('text-sm font-medium', priceChange >= 0 ? 'text-green-500' : 'text-red-500')}>
              {formatCurrency(currentPrice, 'USDC', 4)} ({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><FiStar className="mr-1" /> Watch</Button>
            <Button variant="ghost" size="sm"><FiBell className="mr-1" /> Alert</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left: Chart */}
          <div className="lg:col-span-3 space-y-4">
            {/* Chart */}
            <Card>
              <CardHeader 
                title="Price Chart"
                action={
                  <div className="flex gap-1">
                    {['1m', '5m', '15m', '1H', '4H', '1D'].map(tf => (
                      <button 
                        key={tf} 
                        type="button"
                        onClick={() => setChartTimeframe(tf)} 
                        className={cn('px-2 py-1 text-xs rounded', 
                          chartTimeframe === tf ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-300')}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                }
              />
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="chartGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="time" hide />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={(v: number) => `$${v}`} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} 
                        formatter={(value: number) => [formatCurrency(value, 'USDC', 4), 'Price']} 
                      />
                      <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fill="url(#chartGreen)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Market Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: '24h High', value: formatCurrency(0.48, 'USDC', 4) },
                { label: '24h Low', value: formatCurrency(0.28, 'USDC', 4) },
                { label: '24h Volume', value: formatCurrency(125400, 'USDC', 0) },
                { label: 'Market Cap', value: formatCurrency(452300, 'USDC', 0) },
              ].map(item => (
                <Card key={item.label}>
                  <CardContent className="p-3 text-sm">
                    <p className="text-gray-500 text-xs">{item.label}</p>
                    <p className="font-semibold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Trade Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                {/* Trade Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-dark-200 rounded-xl p-1 mb-4">
                  {(['buy', 'sell', 'swap'] as const).map(tab => (
                    <button 
                      key={tab} 
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn('flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                        activeTab === tab 
                          ? tab === 'buy' ? 'bg-green-500 text-white' : tab === 'sell' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                          : 'text-gray-500'
                      )}
                    >
                      {activeTab === tab && (
                        <>
                          {tab === 'buy' && <FiPlus className="inline mr-1 w-3 h-3" />}
                          {tab === 'sell' && <FiMinus className="inline mr-1 w-3 h-3" />}
                          {tab === 'swap' && <FiRefreshCw className="inline mr-1 w-3 h-3" />}
                        </>
                      )}
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Order Type */}
                <div className="flex gap-2 mb-4">
                  <button 
                    type="button"
                    onClick={() => setOrderType('market')} 
                    className={cn('flex-1 py-1.5 text-xs rounded-lg', 
                      orderType === 'market' ? 'bg-primary-500/10 text-primary-500 font-medium' : 'text-gray-500')}
                  >
                    Market
                  </button>
                  <button 
                    type="button"
                    onClick={() => setOrderType('limit')} 
                    className={cn('flex-1 py-1.5 text-xs rounded-lg', 
                      orderType === 'limit' ? 'bg-primary-500/10 text-primary-500 font-medium' : 'text-gray-500')}
                  >
                    Limit
                  </button>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Price</label>
                  <div className="text-lg font-bold">{formatCurrency(currentPrice, 'USDC', 6)}</div>
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Amount (Tokens)</label>
                  <Input 
                    type="text" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={handleAmountChange} 
                  />
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-1 mb-3">
                  {[25, 50, 75, 100].map(pct => (
                    <button 
                      key={pct} 
                      type="button"
                      onClick={() => setAmount(String(100 * pct / 100))} 
                      className="flex-1 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Estimated Total */}
                {amount && (
                  <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-3 mb-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate</span>
                      <span>1 RMX = {formatCurrency(currentPrice, 'USDC', 4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total</span>
                      <span className="font-semibold">{formatCurrency(estimatedTotal, 'USDC', 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fee</span>
                      <span>0.5%</span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  variant={activeTab === 'buy' ? 'success' : activeTab === 'sell' ? 'danger' : 'primary'} 
                  fullWidth 
                  size="lg" 
                  onClick={handleTrade}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  {activeTab === 'buy' ? 'Buy' : activeTab === 'sell' ? 'Sell' : 'Swap'} RMX
                </Button>

                {/* Balance */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Available: 0.00 USDC | 0 RMX
                </div>
              </CardContent>
            </Card>
            <div className="mt-3">
            <TraderInsight remixId={tokenId} />
            </div>
            {/* Order Book Preview */}
            <Card className="mt-3">
              <CardHeader title="Order Book" />
              <CardContent className="p-0">
                <div className="text-xs">
                  {/* Asks (Sells) */}
                  {[...Array(6)].map((_, i) => (
                    <div key={`ask-${i}`} className="flex justify-between px-4 py-1 hover:bg-red-500/5">
                      <span className="text-red-500">
                        {formatCurrency(currentPrice + (6-i) * 0.005, 'USDC', 4)}
                      </span>
                      <span className="text-gray-500">{Math.floor(Math.random() * 5000)}</span>
                    </div>
                  ))}
                  {/* Spread */}
                  <div className="flex justify-between px-4 py-2 bg-gray-50 dark:bg-dark-300 font-medium">
                    <span className="text-green-500">{formatCurrency(currentPrice, 'USDC', 4)}</span>
                    <span className="text-gray-400">Spread: 0.12%</span>
                  </div>
                  {/* Bids (Buys) */}
                  {[...Array(6)].map((_, i) => (
                    <div key={`bid-${i}`} className="flex justify-between px-4 py-1 hover:bg-green-500/5">
                      <span className="text-green-500">
                        {formatCurrency(currentPrice - (i+1) * 0.005, 'USDC', 4)}
                      </span>
                      <span className="text-gray-500">{Math.floor(Math.random() * 5000)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}