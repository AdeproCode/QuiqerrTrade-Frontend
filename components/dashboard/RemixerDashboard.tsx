'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  FiRepeat, 
  FiTrendingUp, 
  FiDollarSign, 
  FiPieChart,
  FiSearch,
  FiExternalLink,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import apiClient from '@/lib/api/client';
import { GetRemixerStatsResponse } from '@/lib/types/api';
import { User, Remix, Transaction } from '@/lib/types';
import { formatCurrency, formatDate, formatXP } from '@/lib/utils/formatters';
import { cn, getLevelColor } from '@/lib/utils/helpers';
import { 
  ResponsiveContainer,
  // Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { IconBase } from 'react-icons/lib';

interface RemixerDashboardProps {
  user: User;
}

export default function RemixerDashboard({ user }: RemixerDashboardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['remixer-stats', user._id],
    queryFn: async () => {
      const response = await apiClient.get<GetRemixerStatsResponse>('/users/me/remixer-stats');
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
        <p className="text-red-500 mb-4">Failed to load remixer stats</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  const { overview, recentTransactions, topRemixes, styleBreakdown, level } = data;
  const levelColor = getLevelColor(level?.level || 'beginner');

  // Prepare data for pie chart
  const pieData = styleBreakdown.map((item) => ({
    name: item._id ? item._id.replace('_', ' ').toUpperCase() : 'Other',
    value: item.totalVolume,
    count: item.count,
  }));

  const COLORS = ['#22c55e', '#a855f7', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Level Progress Card */}
      {level && (
        <Card className="bg-gradient-to-r from-primary-500/5 to-accent-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline" className={levelColor.text}>
                    {level.level.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <span>Remixer Level</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create more remixes to level up and increase your royalty share!
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatXP(level.levelProgress.currentXP)}</p>
                <p className="text-sm text-gray-500">
                  / {formatXP(level.levelProgress.nextLevelXP)} XP
                </p>
              </div>
            </div>
            <ProgressBar
              value={level.levelProgress.currentXP}
              max={level.levelProgress.nextLevelXP}
              className="h-3"
            />
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiRepeat}
          label="Total Remixes"
          value={overview.totalRemixes.toString()}
          subValue={`${overview.publishedRemixes} published`}
          trend={+8}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Total Volume"
          value={formatCurrency(overview.totalVolume, 'USDC', 0)}
          subValue="All time"
          trend={+15.2}
        />
        <StatCard
          icon={FiDollarSign}
          label="Total Earned"
          value={formatCurrency(overview.totalEarned, 'USDC', 2)}
          subValue="Remixer royalties"
          trend={+10.5}
        />
        <StatCard
          icon={FiPieChart}
          label="Average ROI"
          value={`${overview.averageROI.toFixed(1)}%`}
          subValue="Return on investment"
          trend={+2.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Style Breakdown Chart */}
        <Card>
          <CardHeader 
            title="Style Performance" 
            subtitle="Volume by remix style"
          />
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {/* {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />  
                      ))} */}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-16">
                No style data available yet
              </p>
            )}
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader 
            title="Recent Activity" 
            action={
              <Link href="/dashboard/activity">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            }
          />
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction._id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Remixes */}
      <Card>
        <CardHeader 
          title="Top Performing Remixes" 
          action={
            <Link href="/dashboard/remixes">
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          }
        />
        <CardContent>
          {topRemixes.length > 0 ? (
            <div className="space-y-3">
              {topRemixes.map((remix, index) => (
                <TopRemixItem key={remix._id} remix={remix} rank={index + 1} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No remixes yet"
              description="Create your first remix to start earning"
              buttonText="Explore Tracks"
              buttonHref="/market"
            />
          )}
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
                Find Tracks to Remix
              </Button>
            </Link>
            <Link href="/market?filter=trending">
              <Button variant="outline">
                <FiTrendingUp className="mr-2" />
                Trending Tracks
              </Button>
            </Link>
            <Link href={`/profile/${user._id}`}>
              <Button variant="outline">
                <FiRepeat className="mr-2" />
                View Profile
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
                  {Math.abs(trend)}%
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
// TOP REMIX ITEM COMPONENT
// ============================================

interface TopRemixItemProps {
  remix: Remix;
  rank: number;
}

const TopRemixItem: React.FC<TopRemixItemProps> = ({ remix, rank }) => {
  const priceChange = remix.stats.priceChange24h;
  const isPriceUp = priceChange >= 0;

  return (
    <Link
      href={`/remix/${remix._id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors group"
    >
      <div className="w-8 h-8 bg-gray-100 dark:bg-dark-300 rounded-lg flex items-center justify-center text-sm font-semibold">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-primary-500 transition-colors">
          {remix.title}
        </p>
        <div className="flex items-center gap-2">
          <Badge size="sm" variant="outline">
            {remix.style?.toUpperCase()}
          </Badge>
          <p className="text-sm text-gray-500">
            {remix.stats.holders} holders
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">
          {formatCurrency(remix.stats.currentPrice, 'USDC', 4)}
        </p>
        <p className={cn(
          'text-xs',
          isPriceUp ? 'text-green-500' : 'text-red-500'
        )}>
          {isPriceUp ? '+' : ''}{priceChange.toFixed(2)}%
        </p>
      </div>
      <FiExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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

  const getActivityColor = (): string => {
    switch (transaction.type) {
      case 'buy':
        return 'text-green-500';
      case 'sell':
        return 'text-red-500';
      case 'royalty_payout':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        transaction.type === 'buy' ? 'bg-green-500/10' : 
        transaction.type === 'sell' ? 'bg-red-500/10' : 
        'bg-blue-500/10'
      )}>
        <IconBase className={cn('w-5 h-5', getActivityColor())} />
      </div>
      <div className="flex-1">
        <p className="font-medium">
          {transaction.type === 'buy' && 'Bought'}
          {transaction.type === 'sell' && 'Sold'}
          {transaction.type === 'royalty_payout' && 'Earned royalties'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(transaction.createdAt, 'relative')}
        </p>
      </div>
      <div className="text-right">
        <p className={cn(
          'font-semibold',
          transaction.type === 'buy' ? 'text-red-500' : 'text-green-500'
        )}>
          {transaction.type === 'buy' ? '-' : '+'}
          {formatCurrency(transaction.totalValue, 'USDC', 2)}
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
        <FiRepeat className="w-8 h-8 text-gray-400" />
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
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </CardContent>
      </Card>
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
    </div>
  );
};