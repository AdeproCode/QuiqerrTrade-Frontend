'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  FiMusic, 
  FiTrendingUp, 
  FiDollarSign, 
  FiUsers,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiExternalLink
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import apiClient from '@/lib/api/client';
import { GetCreatorStatsResponse } from '@/lib/types/api';
import { User, Track, Transaction } from '@/lib/types';
import { formatCurrency, formatDate, formatXP } from '@/lib/utils/formatters';
import { cn, getLevelColor } from '@/lib/utils/helpers';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// ============================================
// TRANSACTION ITEM COMPONENT (Moved outside)
// ============================================

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  // Render the appropriate icon directly instead of creating a component
  const renderIcon = (): React.ReactNode => {
    const iconClassName = cn('w-5 h-5', getActivityColor());
    
    switch (transaction.type) {
      case 'buy':
        return <FiTrendingUp className={iconClassName} />;
      case 'sell':
        return <FiTrendingUp className={iconClassName} />;
      case 'royalty_payout':
        return <FiDollarSign className={iconClassName} />;
      default:
        return <FiMusic className={iconClassName} />;
    }
  };

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

  const getActivityLabel = (): string => {
    switch (transaction.type) {
      case 'buy':
        return 'Bought';
      case 'sell':
        return 'Sold';
      case 'royalty_payout':
        return 'Earned royalties';
      default:
        return 'Activity';
    }
  };

  const getBackgroundColor = (): string => {
    switch (transaction.type) {
      case 'buy':
        return 'bg-green-500/10';
      case 'sell':
        return 'bg-red-500/10';
      case 'royalty_payout':
        return 'bg-blue-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  const isPositive = transaction.type !== 'buy';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', getBackgroundColor())}>
        {renderIcon()}
      </div>
      <div className="flex-1">
        <p className="font-medium">
          {getActivityLabel()}
          {' from '}
          <span className="text-primary-500">
            {typeof transaction.remix === 'object' ? transaction.remix.title : 'Remix'}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(transaction.createdAt, 'relative')}
        </p>
      </div>
      <div className="text-right">
        <p className={cn('font-semibold', isPositive ? 'text-green-500' : 'text-red-500')}>
          {isPositive ? '+' : '-'}
          {formatCurrency(transaction.totalValue, 'USDC', 2)}
        </p>
      </div>
    </div>
  );
};

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
// TOP TRACK ITEM COMPONENT
// ============================================

interface TopTrackItemProps {
  track: Track;
  rank: number;
}

const TopTrackItem: React.FC<TopTrackItemProps> = ({ track, rank }) => {
  return (
    <Link
      href={`/track/${track._id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors group"
    >
      <div className="w-8 h-8 bg-gray-100 dark:bg-dark-300 rounded-lg flex items-center justify-center text-sm font-semibold">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-primary-500 transition-colors">
          {track.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {track.stats.remixCount} remixes
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold">
          {formatCurrency(track.stats.totalVolume, 'USDC', 0)}
        </p>
        <p className="text-xs text-green-500">
          +{formatCurrency(track.stats.totalEarned, 'USDC', 0)} earned
        </p>
      </div>
      <FiExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
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
        <FiMusic className="w-8 h-8 text-gray-400" />
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
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
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

// ============================================
// MAIN COMPONENT
// ============================================

interface CreatorDashboardProps {
  user: User;
}

export default function CreatorDashboard({ user }: CreatorDashboardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['creator-stats', user._id],
    queryFn: async () => {
      const response = await apiClient.get<GetCreatorStatsResponse>('/users/me/creator-stats');
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
        <p className="text-red-500 mb-4">Failed to load creator stats</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  const { overview, recentTransactions, topTracks, monthlyStats, level } = data;
  const levelColor = getLevelColor(level?.level || 'new_creator');

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
                  <span>Creator Level</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Keep creating to level up and unlock more rewards!
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
          icon={FiMusic}
          label="Total Tracks"
          value={overview.totalTracks.toString()}
          subValue={`${overview.publishedTracks} published`}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Total Volume"
          value={formatCurrency(overview.totalVolume, 'USDC', 0)}
          subValue="All time"
        />
        <StatCard
          icon={FiDollarSign}
          label="Total Earned"
          value={formatCurrency(overview.totalEarned, 'USDC', 2)}
          subValue="Creator royalties"
        />
        <StatCard
          icon={FiUsers}
          label="Remixes Received"
          value={overview.totalRemixesReceived.toString()}
          subValue="From other creators"
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader 
          title="Revenue Overview" 
          subtitle="Last 30 days"
        />
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="_id" 
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value: number) => formatCurrency(value, '', 0)}
                  className="text-xs"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1e2a', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [formatCurrency(value, 'USDC', 2), 'Volume']}
                  labelFormatter={(label: string) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fill="url(#colorVolume)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tracks */}
        <Card>
          <CardHeader 
            title="Top Performing Tracks" 
            action={
              <Link href="/dashboard/tracks">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            }
          />
          <CardContent>
            {topTracks.length > 0 ? (
              <div className="space-y-3">
                {topTracks.map((track, index) => (
                  <TopTrackItem key={track._id} track={track} rank={index + 1} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tracks yet"
                description="Upload your first track to start earning"
                buttonText="Upload Track"
                buttonHref="/upload"
              />
            )}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/upload">
              <Button variant="primary">
                <FiPlus className="mr-2" />
                Upload New Track
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="outline">
                <FiTrendingUp className="mr-2" />
                Explore Market
              </Button>
            </Link>
            <Link href={`/profile/${user._id}`}>
              <Button variant="outline">
                <FiUsers className="mr-2" />
                View Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}