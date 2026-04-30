'use client';

import React from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  FiMusic,  
  FiDollarSign, 
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiGrid
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';
import { Transaction } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { AISuggestions } from '@/components/ai/AISuggestions';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStatCard
              title="Total Earnings"
              value={user.earnings.total}
              icon={FiDollarSign}
              trend={+12.5}
              format="currency"
              gradient="from-emerald-500 to-teal-500"
            />
            <QuickStatCard
              title="Followers"
              value={user.stats.followers}
              icon={FiUsers}
              trend={+8.2}
              format="number"
              gradient="from-blue-500 to-indigo-500"
            />
            <QuickStatCard
              title="Total Volume"
              value={(user.creatorProfile?.totalVolume || 0) + (user.remixerProfile?.totalVolume || 0)}
              icon={FiTrendingUp}
              trend={+23.1}
              format="currency"
              gradient="from-purple-500 to-pink-500"
            />
            <QuickStatCard
              title="Level"
              value={user.creatorProfile?.level || user.remixerProfile?.level || 'beginner'}
              icon={FiAward}
              format="level"
              gradient="from-orange-500 to-yellow-500"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="xl:col-span-2 space-y-6">

              {/* Overview Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Creator Summary */}
                {user.creatorProfile && (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader
                      title="Creator Performance"
                      subtitle="Your track statistics"
                      action={
                        <Link href="/dashboard/creator">
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary-500/10">
                            View Details →
                          </Badge>
                        </Link>
                      }
                    />
                    <CardContent>
                      <div className="space-y-4">
                        <ProgressRow
                          label="Total Tracks"
                          value={user.creatorProfile.totalTracks}
                          max={50}
                          color="bg-purple-500"
                        />
                        <ProgressRow
                          label="Remixes Received"
                          value={user.creatorProfile.totalRemixesReceived}
                          max={100}
                          color="bg-blue-500"
                        />
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Level Progress</span>
                            <span className="text-sm text-gray-500">
                              {user.creatorProfile.levelProgress.currentXP} / {user.creatorProfile.levelProgress.nextLevelXP} XP
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ 
                                width: `${(user.creatorProfile.levelProgress.currentXP / user.creatorProfile.levelProgress.nextLevelXP) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Remixer Summary */}
                {user.remixerProfile && (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader
                      title="Remixer Performance"
                      subtitle="Your remix statistics"
                      action={
                        <Link href="/dashboard/remixer">
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary-500/10">
                            View Details →
                          </Badge>
                        </Link>
                      }
                    />
                    <CardContent>
                      <div className="space-y-4">
                        <ProgressRow
                          label="Total Remixes"
                          value={user.remixerProfile.totalRemixes}
                          max={100}
                          color="bg-orange-500"
                        />
                        <ProgressRow
                          label="Total Volume"
                          value={user.remixerProfile.totalVolume}
                          max={10000}
                          color="bg-green-500"
                          format="currency"
                        />
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Level Progress</span>
                            <span className="text-sm text-gray-500">
                              {user.remixerProfile.levelProgress.currentXP} / {user.remixerProfile.levelProgress.nextLevelXP} XP
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                              style={{ 
                                width: `${(user.remixerProfile.levelProgress.currentXP / user.remixerProfile.levelProgress.nextLevelXP) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Activity */}
              <RecentActivity userId={user._id} />
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">

              {/* Market Overview Card */}
              <Card>
                <CardHeader 
                  title="Market Overview" 
                  subtitle="Live trading activity"
                  action={
                    <Link href="/market">
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary-500/10">
                        View All →
                      </Badge>
                    </Link>
                  }
                />
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-green-500/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="text-green-500" />
                        <span className="text-sm">Trending Now</span>
                      </div>
                      <span className="text-sm font-semibold text-green-500">+5.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-500/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiActivity className="text-blue-500" />
                        <span className="text-sm">24h Volume</span>
                      </div>
                      <span className="text-sm font-semibold">$12,450</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-500/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiGrid className="text-purple-500" />
                        <span className="text-sm">Active Remixes</span>
                      </div>
                      <span className="text-sm font-semibold">234</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <AISuggestions 
                  genre={user.creatorProfile?.primaryGenre || user.remixerProfile?.preferredGenres?.[0]} 
              />
            </div>
          </div>
        </div>
      </div>
  );
}

// ============================================
// QUICK STAT CARD (REDESIGNED)
// ============================================

interface QuickStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  format: 'currency' | 'number' | 'level';
  gradient: string;
  className?: string;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  format,
  gradient,
  className,
}) => {
  const formattedValue = (): string => {
    if (format === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value).replace('$', '') + ' USDC';
    }
    if (format === 'number' && typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    }
    if (format === 'level' && typeof value === 'string') {
      return value.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return String(value);
  };

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold">{formattedValue()}</p>
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
                <span className="text-xs text-gray-500 ml-1">vs last week</span>
              </div>
            )}
          </div>
          <div className={cn('w-10 h-10 bg-gradient-to-r rounded-xl flex items-center justify-center', gradient)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// PROGRESS ROW
// ============================================

interface ProgressRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
  format?: 'number' | 'currency';
}

const ProgressRow: React.FC<ProgressRowProps> = ({ label, value, max, color, format = 'number' }) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  const displayValue = format === 'currency' 
    ? `$${value.toLocaleString()}`
    : value.toString();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-medium">{displayValue}</span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

// ============================================
// RECENT ACTIVITY
// ============================================

interface RecentActivityProps {
  userId: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ userId }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity', userId],
    queryFn: async () => {
      const response = await apiClient.get<Transaction[]>(`/users/${userId}/activity?limit=5`);
      return response;
    },
  });

  return (
    <Card>
      <CardHeader 
        title="Recent Activity" 
        action={
          <Link href="/dashboard/activity">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary-500/10">
              View All →
            </Badge>
          </Link>
        }
      />
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// ACTIVITY ITEM
// ============================================

interface ActivityItemProps {
  activity: Transaction;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getConfig = () => {
    switch (activity.type) {
      case 'buy':
        return { icon: FiTrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' };
      case 'sell':
        return { icon: FiTrendingUp, color: 'text-red-500', bg: 'bg-red-500/10' };
      case 'royalty_payout':
        return { icon: FiDollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      default:
        return { icon: FiMusic, color: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const isPositive = activity.type !== 'buy';

  const getLabel = () => {
    switch (activity.type) {
      case 'buy': return 'Bought';
      case 'sell': return 'Sold';
      case 'royalty_payout': return 'Earned royalties from';
      default: return 'Activity';
    }
  };

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', config.bg)}>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {getLabel()}{' '}
          <span className="text-primary-500">
            {typeof activity.remix === 'object' ? activity.remix.title : 'Remix'}
          </span>
        </p>
        <p className="text-xs text-gray-500">{formatDate(activity.createdAt, 'relative')}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn('text-sm font-semibold', isPositive ? 'text-green-500' : 'text-red-500')}>
          {isPositive ? '+' : '-'}{formatCurrency(activity.totalValue, 'USDC', 2)}
        </p>
      </div>
    </div>
  );
};