'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiPieChart,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiAward,
  FiSearch
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import apiClient from '@/lib/api/client';
import { GetPortfolioResponse } from '@/lib/types/api';
import { User, PortfolioItem, Transaction } from '@/lib/types';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

interface TraderDashboardProps {
  user: User;
}

export default function TraderDashboard({ user }: TraderDashboardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio', user._id],
    queryFn: async () => {
      const response = await apiClient.get<GetPortfolioResponse>('/market/portfolio');
      return response;
    },
    enabled: !!user._id,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load portfolio</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  const { portfolio, earnings, transactions } = data;
  
  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalInvested = portfolio.reduce((sum, item) => sum + item.totalInvested, 0);
  const totalPnL = totalPortfolioValue - totalInvested;
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const traderLevel = user.traderProfile?.tradingLevel || 'novice';

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiDollarSign}
          label="Portfolio Value"
          value={formatCurrency(totalPortfolioValue, 'USDC', 2)}
          trend={totalPnLPercentage}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Total Invested"
          value={formatCurrency(totalInvested, 'USDC', 2)}
        />
        <StatCard
          icon={FiActivity}
          label="Total P&L"
          value={formatCurrency(totalPnL, 'USDC', 2)}
          trend={totalPnLPercentage}
        />
        <StatCard
          icon={FiPieChart}
          label="Total Trades"
          value={user.traderProfile?.totalTrades?.toString() || '0'}
          subValue={`${user.traderProfile?.winRate?.toFixed(1) || 0}% win rate`}
        />
      </div>

      {/* Trader Level */}
      <Card className="bg-gradient-to-r from-primary-500/5 to-accent-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiAward className="w-5 h-5 text-yellow-500" />
                <Badge variant="outline" className="capitalize">
                  {traderLevel.replace('_', ' ')}
                </Badge>
                <span>Trader Level</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Trade more to increase your level and unlock perks!
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold">
                {formatCurrency(user.traderProfile?.totalVolume || 0, 'USDC', 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holdings */}
        <Card>
          <CardHeader 
            title="Your Holdings" 
            subtitle={`${portfolio.length} tokens`}
          />
          <CardContent>
            {portfolio.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500">Token</span>
                  <span className="text-xs text-gray-500 text-right">Amount</span>
                  <span className="text-xs text-gray-500 text-right">Value</span>
                  <span className="text-xs text-gray-500 text-right">P&L</span>
                </div>
                {portfolio.map((item) => (
                  <HoldingItem key={item.token} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No holdings yet"
                description="Start trading to build your portfolio"
                buttonText="Explore Market"
                buttonHref="/market"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader 
            title="Recent Transactions" 
            action={
              <Link href="/dashboard/transactions">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            }
          />
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <TransactionItem key={transaction._id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No transactions yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings Summary */}
      <Card>
        <CardHeader title="Earnings Summary" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-dark-300 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(earnings.total, 'USDC', 2)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-dark-300 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">As Creator</p>
              <p className="text-2xl font-bold">
                {formatCurrency(earnings.asCreator, 'USDC', 2)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-dark-300 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">As Remixer</p>
              <p className="text-2xl font-bold">
                {formatCurrency(earnings.asRemixer, 'USDC', 2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/market">
              <Button variant="primary">
                <FiSearch className="mr-2" />
                Explore Market
              </Button>
            </Link>
            <Link href="/market?filter=trending">
              <Button variant="outline">
                <FiTrendingUp className="mr-2" />
                Trending Remixes
              </Button>
            </Link>
            <Link href="/market?filter=gainers">
              <Button variant="outline">
                <FiArrowUp className="mr-2 text-green-500" />
                Top Gainers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  trend 
}) => {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subValue && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend >= 0 ? (
                  <FiArrowUp className="w-3 h-3 text-green-500" />
                ) : (
                  <FiArrowDown className="w-3 h-3 text-red-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  trend >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {formatPercentage(Math.abs(trend), 1)}
                </span>
              </div>
            )}
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// HOLDING ITEM COMPONENT
// ============================================

interface HoldingItemProps {
  item: PortfolioItem;
}

const HoldingItem: React.FC<HoldingItemProps> = ({ item }) => {
  const isPositive = item.pnl >= 0;

  return (
    <Link
      href={`/remix/${item.token}`}
      className="grid grid-cols-4 gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
    >
      <span className="font-medium truncate">{item.symbol}</span>
      <span className="text-right">{item.amount.toFixed(2)}</span>
      <span className="text-right">{formatCurrency(item.currentValue, 'USDC', 2)}</span>
      <span className={cn(
        'text-right',
        isPositive ? 'text-green-500' : 'text-red-500'
      )}>
        {isPositive ? '+' : ''}{formatCurrency(item.pnl, 'USDC', 2)}
        <span className="text-xs ml-1">
          ({formatPercentage(item.pnlPercentage, 1)})
        </span>
      </span>
    </Link>
  );
};

// ============================================
// TRANSACTION ITEM COMPONENT
// ============================================

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isBuy = transaction.type === 'buy';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        isBuy ? 'bg-green-500/10' : 'bg-red-500/10'
      )}>
        <FiTrendingUp className={cn(
          'w-5 h-5',
          isBuy ? 'text-green-500' : 'text-red-500'
        )} />
      </div>
      <div className="flex-1">
        <p className="font-medium">
          {isBuy ? 'Bought' : 'Sold'}
          {' '}
          <span className="text-primary-500">
            {typeof transaction.remix === 'object' ? transaction.remix.title : 'Remix'}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(transaction.createdAt, 'relative')}
        </p>
      </div>
      <div className="text-right">
        <p className={cn(
          'font-semibold',
          isBuy ? 'text-red-500' : 'text-green-500'
        )}>
          {isBuy ? '-' : '+'}
          {formatCurrency(transaction.totalValue, 'USDC', 2)}
        </p>
        <p className="text-xs text-gray-500">
          {transaction.amount} @ {formatCurrency(transaction.pricePerToken, 'USDC', 4)}
        </p>
      </div>
    </div>
  );
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  buttonText, 
  buttonHref 
}) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-100 dark:bg-dark-300 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiTrendingUp className="w-8 h-8 text-gray-400" />
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>
      <Link href={buttonHref}>
        <Button variant="primary" size="sm">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

// ============================================
// SKELETON LOADER
// ============================================

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};