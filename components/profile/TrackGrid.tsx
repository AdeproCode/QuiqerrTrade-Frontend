'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMusic, FiTrendingUp, FiRepeat, FiPlay } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Track } from '@/lib/types';
import { formatCurrency} from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export interface TrackGridProps {
  tracks: Track[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  showStats?: boolean;
  variant?: 'grid' | 'list';
  className?: string;
}

export const TrackGrid: React.FC<TrackGridProps> = ({
  tracks,
  isLoading = false,
  emptyMessage = 'No tracks yet',
  emptyActionLabel = 'Upload Track',
  emptyActionHref = '/upload',
  showStats = true,
  variant = 'grid',
  className,
}) => {
  if (isLoading) {
    return <TrackGridSkeleton variant={variant} />;
  }

  if (tracks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMusic className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Upload your first track to start earning royalties
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
        {tracks.map((track) => (
          <TrackListItem key={track._id} track={track} showStats={showStats} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {tracks.map((track) => (
        <TrackCard key={track._id} track={track} showStats={showStats} />
      ))}
    </div>
  );
};

// ============================================
// TRACK CARD (GRID VIEW)
// ============================================

interface TrackCardProps {
  track: Track;
  showStats?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, showStats = true }) => {
  return (
    <Link href={`/track/${track._id}`}>
      <Card hoverable className="h-full overflow-hidden group">
        {/* Cover Image */}
        <div className="relative aspect-square">
          {track.coverImageUrl ? (
            <Image
              src={track.coverImageUrl}
              alt={track.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500/80 to-accent-500/80 flex items-center justify-center">
              <FiMusic className="w-12 h-12 text-white" />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <FiPlay className="w-5 h-5 text-black ml-0.5" />
            </div>
          </div>

          {/* Genre Badge */}
          <Badge variant="glass" className="absolute top-2 left-2">
            {track.genre}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-semibold truncate mb-1 group-hover:text-primary-500 transition-colors">
            {track.title}
          </h4>
          
          {track.bpm && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {track.bpm} BPM {track.key && `• ${track.key}`}
            </p>
          )}

          {showStats && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <FiRepeat className="w-3.5 h-3.5" />
                <span>{track.stats.remixCount}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <FiTrendingUp className="w-3.5 h-3.5" />
                <span>{formatCurrency(track.stats.totalVolume, 'USDC', 0)}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

// ============================================
// TRACK LIST ITEM (LIST VIEW)
// ============================================

interface TrackListItemProps {
  track: Track;
  showStats?: boolean;
}

const TrackListItem: React.FC<TrackListItemProps> = ({ track, showStats = true }) => {
  return (
    <Link href={`/track/${track._id}`}>
      <Card hoverable className="overflow-hidden group">
        <div className="flex items-center gap-4 p-3">
          {/* Thumbnail */}
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            {track.coverImageUrl ? (
              <Image
                src={track.coverImageUrl}
                alt={track.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate group-hover:text-primary-500 transition-colors">
              {track.title}
            </h4>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Badge size="sm" variant="outline">{track.genre}</Badge>
              {track.bpm && <span>{track.bpm} BPM</span>}
              {track.key && <span>{track.key}</span>}
            </div>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Remixes</p>
                <p className="font-semibold">{track.stats.remixCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Volume</p>
                <p className="font-semibold">{formatCurrency(track.stats.totalVolume, 'USDC', 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Earned</p>
                <p className="font-semibold text-green-500">
                  {formatCurrency(track.stats.totalEarned, 'USDC', 0)}
                </p>
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

interface TrackGridSkeletonProps {
  variant?: 'grid' | 'list';
  count?: number;
}

const TrackGridSkeleton: React.FC<TrackGridSkeletonProps> = ({ 
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
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse" />
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};