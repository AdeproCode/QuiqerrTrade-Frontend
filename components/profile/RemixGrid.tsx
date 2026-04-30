'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiRepeat, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiPlay,
  FiDollarSign 
} from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Remix, Track } from '@/lib/types';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export interface RemixGridProps {
  remixes: Remix[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  showStats?: boolean;
  variant?: 'grid' | 'list';
  className?: string;
}

export const RemixGrid: React.FC<RemixGridProps> = ({
  remixes,
  isLoading = false,
  emptyMessage = 'No remixes yet',
  emptyActionLabel = 'Explore Tracks',
  emptyActionHref = '/market',
  showStats = true,
  variant = 'grid',
  className,
}) => {
  if (isLoading) {
    return <RemixGridSkeleton variant={variant} />;
  }

  if (remixes.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiRepeat className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Create your first remix to start earning royalties
        </p>
        <Link href={emptyActionHref}>
          <Button variant="primary">{emptyActionLabel}</Button>
        </Link>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {remixes.map((remix) => (
          <RemixListItem key={remix._id} remix={remix} showStats={showStats} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {remixes.map((remix) => (
        <RemixCard key={remix._id} remix={remix} showStats={showStats} />
      ))}
    </div>
  );
};

// ============================================
// REMIX CARD (GRID VIEW)
// ============================================

interface RemixCardProps {
  remix: Remix;
  showStats?: boolean;
}

const RemixCard: React.FC<RemixCardProps> = ({ remix, showStats = true }) => {
  const parentTrack = remix.parentTrack as Track;
  const priceChange = remix.stats.priceChange24h;
  const isPriceUp = priceChange >= 0;

  return (
    <Link href={`/remix/${remix._id}`}>
      <Card hoverable className="h-full overflow-hidden group">
        {/* Cover Image */}
        <div className="relative aspect-square">
          {parentTrack?.coverImageUrl ? (
            <Image
              src={parentTrack.coverImageUrl}
              alt={remix.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-500/80 to-primary-500/80 flex items-center justify-center">
              <FiRepeat className="w-12 h-12 text-white" />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <FiPlay className="w-5 h-5 text-black ml-0.5" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge variant="glass">REMIX</Badge>
            {remix.style && (
              <Badge variant="glass">{remix.style.toUpperCase()}</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-semibold truncate mb-1 group-hover:text-primary-500 transition-colors">
            {remix.title}
          </h4>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
            {parentTrack?.title || 'Original Track'}
          </p>

          {showStats && (
            <div className="space-y-2">
              {/* Price & Change */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  {formatCurrency(remix.stats.currentPrice, 'USDC', 4)}
                </span>
                <span className={cn(
                  'text-sm font-medium',
                  isPriceUp ? 'text-green-500' : 'text-red-500'
                )}>
                  {isPriceUp ? <FiTrendingUp className="inline mr-0.5" /> : <FiTrendingDown className="inline mr-0.5" />}
                  {formatPercentage(priceChange, 1)}
                </span>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiDollarSign className="w-3 h-3" />
                  <span>{formatNumber(remix.stats.volume24h, true)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiUsers className="w-3 h-3" />
                  <span>{remix.stats.holders}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiTrendingUp className="w-3 h-3" />
                  <span>#{Math.floor(remix.stats.trendingScore)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

// ============================================
// REMIX LIST ITEM (LIST VIEW)
// ============================================

interface RemixListItemProps {
  remix: Remix;
  showStats?: boolean;
}

const RemixListItem: React.FC<RemixListItemProps> = ({ remix, showStats = true }) => {
  const parentTrack = remix.parentTrack as Track;
  const priceChange = remix.stats.priceChange24h;
  const isPriceUp = priceChange >= 0;

  return (
    <Link href={`/remix/${remix._id}`}>
      <Card hoverable className="overflow-hidden group">
        <div className="flex items-center gap-4 p-3">
          {/* Thumbnail */}
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            {parentTrack?.coverImageUrl ? (
              <Image
                src={parentTrack.coverImageUrl}
                alt={remix.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                <FiRepeat className="w-5 h-5 text-white" />
              </div>
            )}
            <Badge variant="glass" size="sm" className="absolute -bottom-1 -right-1">
              {remix.style?.charAt(0).toUpperCase()}
            </Badge>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate group-hover:text-primary-500 transition-colors">
              {remix.title}
            </h4>
            <p className="text-sm text-gray-500 truncate">
              {parentTrack?.title || 'Original Track'}
            </p>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Price</p>
                <p className="font-semibold">{formatCurrency(remix.stats.currentPrice, 'USDC', 4)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">24h</p>
                <p className={cn('font-semibold', isPriceUp ? 'text-green-500' : 'text-red-500')}>
                  {formatPercentage(priceChange, 1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Volume</p>
                <p className="font-semibold">{formatCurrency(remix.stats.volume24h, 'USDC', 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Holders</p>
                <p className="font-semibold">{remix.stats.holders}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

// ============================================
// SKELETON LOADER
// ============================================

interface RemixGridSkeletonProps {
  variant?: 'grid' | 'list';
  count?: number;
}

const RemixGridSkeleton: React.FC<RemixGridSkeletonProps> = ({ 
  variant = 'grid', 
  count = 8 
}) => {
  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <Card key={i}>
            <div className="flex items-center gap-4 p-3">
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3 animate-pulse" />
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};