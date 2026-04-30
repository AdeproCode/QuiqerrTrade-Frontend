'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  FiTrendingUp, FiDollarSign, FiPieChart, FiActivity, FiSearch,
  FiBarChart2
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';
import { GetPortfolioResponse } from '@/lib/types/api';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AISuggestions } from '@/components/ai/AISuggestions';

const portfolioData = [
  { date: 'Mon', value: 1000 },
  { date: 'Tue', value: 1250 },
  { date: 'Wed', value: 1100 },
  { date: 'Thu', value: 1500 },
  { date: 'Fri', value: 1350 },
  { date: 'Sat', value: 1800 },
  { date: 'Sun', value: 2100 },
];

export default function TradingDeskPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio', user?._id],
    queryFn: async () => {
      const response = await apiClient.get<GetPortfolioResponse>('/market/portfolio');
      return response;
    },
    enabled: !!user?._id,
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <FiBarChart2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Trading Desk</h2>
        <p className="text-gray-500 mb-6">Connect your wallet to start trading</p>
        <Link href="/market"><Button variant="primary">Explore Market</Button></Link>
      </div>
    );
  }

  if (isLoading || !data) return <Skeleton />;

  const { portfolio, transactions } = data;
  const totalValue = portfolio.reduce((s, i) => s + i.currentValue, 0);
  const totalInvested = portfolio.reduce((s, i) => s + i.totalInvested, 0);
  const totalPnL = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Trading Desk</h1>
          <p className="text-gray-500 mt-1">Manage your portfolio and track performance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/market"><Button variant="primary"><FiSearch className="mr-2" />Trade Now</Button></Link>
          <Link href="/market?filter=trending"><Button variant="outline"><FiTrendingUp className="mr-2" />Trending</Button></Link>
        </div>
      </motion.div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiDollarSign} label="Portfolio Value" value={formatCurrency(totalValue, 'USDC', 2)} trend={pnlPercent} color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={FiTrendingUp} label="Total Invested" value={formatCurrency(totalInvested, 'USDC', 2)} color="text-purple-500" bg="bg-purple-500/10" />
        <StatCard icon={FiActivity} label="Total P&L" value={formatCurrency(totalPnL, 'USDC', 2)} trend={pnlPercent} color="text-green-500" bg="bg-green-500/10" />
        <StatCard icon={FiPieChart} label="Total Trades" value={user.traderProfile?.totalTrades?.toString() || '0'} sub={`${user.traderProfile?.winRate?.toFixed(1) || 0}% win rate`} color="text-orange-500" bg="bg-orange-500/10" />
      </div>
      <AISuggestions />
      {/* Portfolio Chart */}
      <Card>
        <CardHeader title="Portfolio Performance" subtitle="7-day value tracking" />
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px' }} formatter={(v: number) => [formatCurrency(v, 'USDC', 2), 'Value']} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fill="url(#portfolioGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Holdings & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Holdings" subtitle={`${portfolio.length} tokens`} />
          <CardContent>
            {portfolio.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                  <span>Token</span><span className="text-right">Amount</span><span className="text-right">Value</span><span className="text-right">P&L</span>
                </div>
                {portfolio.map(item => (
                  <Link key={item.token} href={`/remix/${item.token}`} className="grid grid-cols-4 gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors text-sm">
                    <span className="font-medium truncate">{item.symbol}</span>
                    <span className="text-right">{item.amount.toFixed(2)}</span>
                    <span className="text-right">{formatCurrency(item.currentValue, 'USDC', 2)}</span>
                    <span className={cn('text-right', item.pnl >= 0 ? 'text-green-500' : 'text-red-500')}>{item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl, 'USDC', 2)}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No holdings yet. Start trading!</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recent Trades" subtitle="Latest transactions" />
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 8).map(tx => {
                  const isBuy = tx.type === 'buy';
                  return (
                    <div key={tx._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', isBuy ? 'bg-green-500/10' : 'bg-red-500/10')}>
                        <FiTrendingUp className={cn('w-4 h-4', isBuy ? 'text-green-500' : 'text-red-500')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{isBuy ? 'Bought' : 'Sold'} {typeof tx.remix === 'object' ? tx.remix.title : 'Token'}</p>
                        <p className="text-xs text-gray-500">{formatDate(tx.createdAt, 'relative')}</p>
                      </div>
                      <p className={cn('text-sm font-semibold', isBuy ? 'text-red-500' : 'text-green-500')}>{isBuy ? '-' : '+'}{formatCurrency(tx.totalValue, 'USDC', 2)}</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No transactions yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps { icon: React.ElementType; label: string; value: string; trend?: number; sub?: string; color: string; bg: string; }
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, sub, color, bg }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-gray-500 mb-1">{label}</p><p className="text-2xl font-bold">{value}</p>
          {trend !== undefined && <p className={cn('text-xs mt-1', trend >= 0 ? 'text-green-500' : 'text-red-500')}>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</p>}
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}><Icon className={cn('w-5 h-5', color)} /></div>
      </div>
    </CardContent>
  </Card>
);

const Skeleton: React.FC = () => <div className="space-y-6"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div></div>;