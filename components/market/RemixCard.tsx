'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiPlay, 
  FiPause, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiDollarSign,
  FiHeart,
  FiMoreHorizontal
} from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarketFeedItem } from '@/lib/types';
import { useAudioStore } from '@/lib/store/audioStore';
import { formatCurrency, formatNumber, formatPercentage, formatAddress } from '@/lib/utils/formatters';
import { cn, getLevelColor } from '@/lib/utils/helpers';

interface RemixCardProps {
  item: MarketFeedItem;
  variant?: 'default' | 'compact' | 'featured';
  onPlay?: () => void;
  onTrade?: () => void;
  className?: string;
}

export const RemixCard: React.FC<RemixCardProps> = ({
  item,
  variant = 'default',
  onPlay,
  onTrade,
  className,
}) => {
  const { remix, parentTrack, remixer } = item;
  const { currentTrack, isPlaying, setTrack, toggle } = useAudioStore();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const isCurrentTrack = currentTrack?.id === remix._id;
  const priceChange = remix.stats.priceChange24h;
  const isPriceUp = priceChange >= 0;

  const handlePlay = useCallback((): void => {
    if (isCurrentTrack) {
      toggle();
    } else {
      setTrack({
        id: remix._id,
        title: remix.title,
        artist: remixer.displayName || remixer.username || formatAddress(remixer.walletAddress),
        audioUrl: remix.audioUrl,
        coverImage: parentTrack.coverImageUrl,
        type: 'remix',
      });
    }
    onPlay?.();
  }, [isCurrentTrack, remix, remixer, parentTrack, setTrack, toggle, onPlay]);

  const handleLike = useCallback((): void => {
    setIsLiked((prev) => !prev);
  }, []);

  const handleTrade = useCallback((): void => {
    onTrade?.();
  }, [onTrade]);

  const remixerLevelColor = getLevelColor(remixer.remixerProfile?.level || 'beginner');

  if (variant === 'compact') {
    return (
      <Card
        hoverable
        className={cn('cursor-pointer', className)}
        onClick={() => window.location.href = `/remix/${remix._id}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            {parentTrack.coverImageUrl ? (
              <Image
                src={parentTrack.coverImageUrl}
                alt={remix.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white text-xl">🔁</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{remix.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {remixer.displayName || remixer.username}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(remix.stats.currentPrice, 'USDC', 4)}</p>
            <p className={cn(
              'text-sm',
              isPriceUp ? 'text-green-500' : 'text-red-500'
            )}>
              {formatPercentage(priceChange, 2)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card hoverable className={cn('overflow-hidden', className)}>
      {/* Cover Image */}
      <div className="relative h-48 group">
        {parentTrack.coverImageUrl ? (
          <Image
            src={parentTrack.coverImageUrl}
            alt={remix.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500" />
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlay}
            className="!p-4 rounded-full"
          >
            {isCurrentTrack && isPlaying ? (
              <FiPause className="w-6 h-6" />
            ) : (
              <FiPlay className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="glass">
            {remix.style?.toUpperCase() || 'REMIX'}
          </Badge>
          {remix.aiPrediction && remix.aiPrediction.viralPotential > 70 && (
            <Badge variant="success" className="!bg-green-500">
              🔥 Viral Potential
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              '!p-2 bg-black/20 backdrop-blur-sm',
              isLiked && 'text-red-500'
            )}
          >
            <FiHeart className={cn('w-4 h-4', isLiked && 'fill-current')} />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="!p-2 bg-black/20 backdrop-blur-sm"
            >
              <FiMoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/remix/${remix._id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-primary-500 transition-colors line-clamp-1">
            {remix.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/profile/${remixer._id}`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
          >
            by {remixer.displayName || remixer.username || formatAddress(remixer.walletAddress)}
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            href={`/track/${parentTrack._id}`}
            className="text-sm text-gray-500 dark:text-gray-500 hover:text-primary-500 transition-colors"
          >
            {parentTrack.title}
          </Link>
        </div>

        {/* Level Badge */}
        {remixer.remixerProfile && (
          <div className="mb-3">
            <Badge variant="outline" className={remixerLevelColor.text}>
              {remixer.remixerProfile.level.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-2">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
              <FiDollarSign className="w-3 h-3" />
              Price
            </div>
            <p className="font-semibold">
              {formatCurrency(remix.stats.currentPrice, 'USDC', 4)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-2">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
              {isPriceUp ? (
                <FiTrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <FiTrendingDown className="w-3 h-3 text-red-500" />
              )}
              24h
            </div>
            <p className={cn(
              'font-semibold',
              isPriceUp ? 'text-green-500' : 'text-red-500'
            )}>
              {formatPercentage(priceChange, 2)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-2">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
              <FiTrendingUp className="w-3 h-3" />
              Volume
            </div>
            <p className="font-semibold">
              {formatNumber(remix.stats.volume24h, true)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-2">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-1">
              <FiUsers className="w-3 h-3" />
              Holders
            </div>
            <p className="font-semibold">{remix.stats.holders}</p>
          </div>
        </div>

        {/* Trade Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleTrade}
        >
          Trade Now
        </Button>

        {/* AI Prediction */}
        {remix.aiPrediction && (
          <div className="mt-3 p-2 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Prediction</p>
            <p className="text-sm font-medium">
              {remix.aiPrediction.suggestedAction === 'BUY' && '🟢 Strong Buy'}
              {remix.aiPrediction.suggestedAction === 'WATCH' && '🟡 Watch'}
              {remix.aiPrediction.suggestedAction === 'PASS' && '🔴 Pass'}
              {' • '}
              {remix.aiPrediction.viralPotential}% viral potential
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};