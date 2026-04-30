'use client';

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiMusic, 
  FiRepeat, 
  FiUsers, 
  FiDollarSign,
  FiSettings,
  FiShare2,
  FiAward,
  FiTrendingUp,
  FiMail,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLink,
  FiExternalLink
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { TrackGrid } from '@/components/profile/TrackGrid';
import { RemixGrid } from '@/components/profile/RemixGrid';
import { FollowButton } from '@/components/profile/FollowButton';
import apiClient from '@/lib/api/client';
import { GetUserResponse } from '@/lib/types/api';
import { formatCurrency, formatAddress, formatDate } from '@/lib/utils/formatters';
import { cn, getLevelColor } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import { Transaction, Badge as BadgeType } from '@/lib/types';

const profileTabs: TabItem[] = [
  { value: 'tracks', label: 'Tracks', icon: FiMusic },
  { value: 'remixes', label: 'Remixes', icon: FiRepeat },
  { value: 'badges', label: 'Badges', icon: FiAward },
  { value: 'activity', label: 'Activity', icon: FiTrendingUp },
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params['id'] as string;
  
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('tracks');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const response = await apiClient.get<GetUserResponse>(`/users/${profileId}`);
      return response;
    },
    enabled: !!profileId,
  });

  const profileUser = data?.user;
  const tracks = data?.tracks || [];
  const remixes = data?.remixes || [];
  const isFollowing = data?.isFollowing || false;
  const isOwnProfile = currentUser?._id === profileUser?._id;

  const handleFollowChange = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleShare = useCallback((): void => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    toast.success('Profile link copied!');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The profile you are looking for does not exist.
          </p>
          <Button onClick={() => router.push('/market')}>
            Explore Market
          </Button>
        </Card>
      </div>
    );
  }

  const creatorLevelColor = getLevelColor(profileUser.creatorProfile?.level || 'new_creator');
  const remixerLevelColor = getLevelColor(profileUser.remixerProfile?.level || 'beginner');

  return (
    <div className="min-h-screen pb-8">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        {profileUser.coverImage ? (
          <Image
            src={profileUser.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-500/30 via-accent-500/30 to-primary-500/30" />
        )}
        
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4"
          >
            Edit Cover
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-dark-200 overflow-hidden bg-gradient-to-r from-primary-500 to-accent-500">
              {profileUser.profileImage ? (
                <Image
                  src={profileUser.profileImage}
                  alt={profileUser.displayName || profileUser.username || 'User'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {profileUser.displayName?.[0] || profileUser.username?.[0] || 'U'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold">
                  {profileUser.displayName || profileUser.username || formatAddress(profileUser.walletAddress)}
                </h1>
                {profileUser.isVerified && (
                  <Badge variant="success" className="!bg-blue-500">✓ Verified</Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                @{profileUser.username || formatAddress(profileUser.walletAddress)}
              </p>
              {profileUser.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                  {profileUser.bio}
                </p>
              )}
              
              {/* Social Links */}
              {profileUser.socialLinks && (
                <div className="flex items-center gap-3 mb-4">
                  {profileUser.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${profileUser.socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      <FiTwitter className="w-5 h-5" />
                    </a>
                  )}
                  {profileUser.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${profileUser.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      <FiInstagram className="w-5 h-5" />
                    </a>
                  )}
                  {profileUser.socialLinks.youtube && (
                    <a
                      href={profileUser.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      <FiYoutube className="w-5 h-5" />
                    </a>
                  )}
                  {profileUser.website && (
                    <a
                      href={profileUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      <FiLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              {/* Levels */}
              <div className="flex flex-wrap gap-3">
                {profileUser.creatorProfile && (
                  <Badge variant="outline" className={creatorLevelColor.text}>
                    <FiMusic className="mr-1" />
                    {profileUser.creatorProfile.level.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                )}
                {profileUser.remixerProfile && (
                  <Badge variant="outline" className={remixerLevelColor.text}>
                    <FiRepeat className="mr-1" />
                    {profileUser.remixerProfile.level.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/settings')}
                  >
                    <FiSettings className="mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="secondary" onClick={handleShare}>
                    <FiShare2 />
                  </Button>
                </>
              ) : (
                <>
                  <FollowButton
                    userId={profileUser._id}
                    initialIsFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                  />
                  <Button variant="secondary">
                    <FiMail />
                  </Button>
                  <Button variant="secondary" onClick={handleShare}>
                    <FiShare2 />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FiUsers}
            label="Followers"
            value={profileUser.stats.followers}
          />
          <StatCard
            icon={FiUsers}
            label="Following"
            value={profileUser.stats.following}
          />
          <StatCard
            icon={FiDollarSign}
            label="Total Earned"
            value={formatCurrency(profileUser.earnings.total, 'USDC', 0)}
          />
          <StatCard
            icon={FiTrendingUp}
            label="Total Volume"
            value={formatCurrency(
              (profileUser.creatorProfile?.totalVolume || 0) + 
              (profileUser.remixerProfile?.totalVolume || 0),
              'USDC',
              0
            )}
          />
        </div>

        {/* Tabs */}
        <Tabs
          items={profileTabs}
          value={activeTab}
          onChange={setActiveTab}
          variant="underline"
          className="mb-6"
        />

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'tracks' && (
            <TrackGrid tracks={tracks} />
          )}
          {activeTab === 'remixes' && (
            <RemixGrid remixes={remixes} />
          )}
          {activeTab === 'badges' && (
            <BadgesDisplay
              creatorBadges={profileUser.creatorProfile?.badges || []}
              remixerBadges={profileUser.remixerProfile?.badges || []}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityFeed userId={profileUser._id} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-dark-300 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// BADGES DISPLAY
// ============================================

interface BadgesDisplayProps {
  creatorBadges: BadgeType[];
  remixerBadges: BadgeType[];
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ creatorBadges, remixerBadges }) => {
  const allBadges = [...creatorBadges, ...remixerBadges];

  if (allBadges.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">🏅</div>
        <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Keep creating and trading to earn badges!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {allBadges.map((badge) => (
        <Card key={badge.name} className="text-center p-6">
          <div className="text-4xl mb-3">{badge.icon}</div>
          <h4 className="font-semibold mb-1">{badge.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {badge.description}
          </p>
          <Badge
            variant="outline"
            size="sm"
            className={cn(
              badge.rarity === 'legendary' && 'text-yellow-500 border-yellow-500',
              badge.rarity === 'epic' && 'text-purple-500 border-purple-500',
              badge.rarity === 'rare' && 'text-blue-500 border-blue-500'
            )}
          >
            {badge.rarity.toUpperCase()}
          </Badge>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// ACTIVITY FEED
// ============================================

interface ActivityFeedProps {
  userId: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      const response = await apiClient.get<Transaction[]>(`/users/${userId}/activity`);
      return response;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityItem key={activity._id} activity={activity} />
      ))}
    </div>
  );
};

// ============================================
// ACTIVITY ITEM COMPONENT
// ============================================

interface ActivityItemProps {
  activity: Transaction;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const renderIcon = (): React.ReactNode => {
    const iconClassName = cn('w-5 h-5', getActivityColor());
    
    switch (activity.type) {
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
    switch (activity.type) {
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

  const getBackgroundColor = (): string => {
    switch (activity.type) {
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

  const getActivityLabel = (): string => {
    switch (activity.type) {
      case 'buy':
        return 'Bought';
      case 'sell':
        return 'Sold';
      case 'royalty_payout':
        return 'Earned royalties from';
      default:
        return 'Activity';
    }
  };

  const isPositive = activity.type !== 'buy';
  const remixTitle = typeof activity.remix === 'object' ? activity.remix.title : 'Remix';

  return (
    <Card hoverable>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', getBackgroundColor())}>
            {renderIcon()}
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {getActivityLabel()}
              {' '}
              <Link 
                href={`/remix/${typeof activity.remix === 'object' ? activity.remix._id : activity.remix}`}
                className="text-primary-500 hover:underline"
              >
                {remixTitle}
              </Link>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(activity.createdAt, 'relative')}
            </p>
          </div>
          <div className="text-right">
            <p className={cn(
              'font-semibold',
              isPositive ? 'text-green-500' : 'text-red-500'
            )}>
              {isPositive ? '+' : '-'}
              {formatCurrency(activity.totalValue, 'USDC', 2)}
            </p>
            {activity.solanaTxSignature && (
              <a
                href={`https://solscan.io/tx/${activity.solanaTxSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-primary-500 flex items-center justify-end gap-1 mt-1"
              >
                View <FiExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};