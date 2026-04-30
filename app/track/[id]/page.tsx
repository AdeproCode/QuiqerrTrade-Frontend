'use client';

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiPlay, 
  FiPause, 
  FiShare2, 
  FiHeart, 
  FiMoreHorizontal,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiMusic,
  FiRepeat,
  FiCopy,
  FiCheck,
  FiPlus
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { useAudioStore } from '@/lib/store/audioStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { RemixCard } from '@/components/market/RemixCard';
import { CreateRemixForm } from '@/components/remix/CreateRemixForm';
import apiClient from '@/lib/api/client';
import { GetTrackResponse } from '@/lib/types/api';
import { formatCurrency, formatDate, formatAddress } from '@/lib/utils/formatters';
import { cn, copyToClipboard, getLevelColor } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import { Track, User } from '@/lib/types';
import { AISuggestions } from '@/components/ai/AISuggestions';

const trackTabs: TabItem[] = [
  { value: 'remixes', label: 'Remixes', icon: FiRepeat },
  { value: 'stats', label: 'Stats', icon: FiTrendingUp },
  { value: 'about', label: 'About', icon: FiMusic },
];

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = params['id'] as string; // FIXED: Use bracket notation
  
  const { isAuthenticated, user } = useAuthStore();
  const { currentTrack, isPlaying, setTrack, toggle } = useAudioStore();
  
  const [activeTab, setActiveTab] = useState<string>('remixes');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showRemixModal, setShowRemixModal] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      const response = await apiClient.get<GetTrackResponse>(`/tracks/${trackId}`);
      return response;
    },
    enabled: !!trackId,
  });

  const track = data?.track;
  const remixes = data?.remixes || [];
  const creator = track?.creator as User | undefined;

  const isCurrentTrack = currentTrack?.id === track?._id && currentTrack?.type === 'track';
  const isOwner = user?._id === creator?._id;

  const handlePlay = useCallback((): void => {
    if (!track) return;
    
    if (isCurrentTrack) {
      toggle();
    } else {
      setTrack({
        id: track._id,
        title: track.title,
        artist: creator?.displayName || creator?.username || formatAddress(track.creatorWallet),
        audioUrl: track.audioUrl,
        coverImage: track.coverImageUrl ?? undefined,
        type: 'track',
      });
    }
  }, [track, creator, isCurrentTrack, setTrack, toggle]);

  const handleShare = useCallback((): void => {
    setShowShareModal(true);
  }, []);

  const handleCopyLink = useCallback(async (): Promise<void> => {
    const url = window.location.href;
    const success = await copyToClipboard(url);
    if (success) {
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  }, []);

  const handleLike = useCallback((): void => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like tracks');
      return;
    }
    setIsLiked((prev) => !prev);
  }, [isAuthenticated]);

  const handleRemix = useCallback((): void => {
    if (!isAuthenticated) {
      toast.error('Please sign in to create remixes');
      return;
    }
    setShowRemixModal(true);
  }, [isAuthenticated]);

  const creatorLevelColor = getLevelColor(creator?.creatorProfile?.level ?? 'new_creator');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Track Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The track you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => router.push('/market')}>
            Explore Market
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-80 md:h-96">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-dark-300" />
        
        {track.coverImageUrl && (
          <Image
            src={track.coverImageUrl}
            alt={track.title}
            fill
            className="object-cover opacity-30 blur-sm"
          />
        )}

        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-8">
          <div className="flex items-end gap-6">
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
              {track.coverImageUrl ? (
                <Image
                  src={track.coverImageUrl}
                  alt={track.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <FiMusic className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-4">
              <Badge variant="glass" className="mb-3">
                {track.genre.toUpperCase()}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-2 text-white">
                {track.title}
              </h1>
              <div className="flex items-center gap-4 text-white/80">
                <Link
                  href={`/profile/${creator?._id ?? ''}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  <span>{creator?.displayName || creator?.username || formatAddress(track.creatorWallet)}</span>
                </Link>
                <span>•</span>
                <span>{formatDate(track.createdAt, 'medium')}</span>
                {track.bpm && (
                  <>
                    <span>•</span>
                    <span>{track.bpm} BPM</span>
                  </>
                )}
                {track.key && (
                  <>
                    <span>•</span>
                    <span>{track.key}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pb-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlay}
                className="!px-8"
              >
                {isCurrentTrack && isPlaying ? (
                  <>
                    <FiPause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <FiPlay className="w-5 h-5 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button variant="secondary" size="lg" onClick={handleLike}>
                <FiHeart className={cn('w-5 h-5', isLiked && 'fill-current text-red-500')} />
              </Button>
              <Button variant="secondary" size="lg" onClick={handleShare}>
                <FiShare2 className="w-5 h-5" />
              </Button>
              <div className="relative">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <FiMoreHorizontal className="w-5 h-5" />
                </Button>
                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-200 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                      onClick={handleCopyLink}
                    >
                      <FiCopy className="inline w-4 h-4 mr-2" />
                      Copy Link
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors text-red-500"
                      >
                        Delete Track
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 py-4">
            <StatItem
              icon={FiTrendingUp}
              label="Total Volume"
              value={formatCurrency(track.stats.totalVolume, 'USDC', 0)}
            />
            <StatItem
              icon={FiRepeat}
              label="Remixes"
              value={track.stats.remixCount.toString()}
            />
            <StatItem
              icon={FiDollarSign}
              label="Creator Earnings"
              value={formatCurrency(track.stats.totalEarned, 'USDC', 0)}
            />
            <StatItem
              icon={FiUsers}
              label="Trending Score"
              value={`#${Math.floor(track.stats.trendingScore)}`}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Tabs
              items={trackTabs}
              value={activeTab}
              onChange={setActiveTab}
              variant="underline"
              className="mb-6"
            />

            {activeTab === 'remixes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {remixes.length} Remixes
                  </h3>
                  <Button variant="primary" onClick={handleRemix}>
                    <FiPlus className="mr-2" />
                    Create Remix
                  </Button>
                </div>

                {remixes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {remixes.map((remix) => (
                      <RemixCard
                        key={remix._id}
                        item={{
                          remix,
                          parentTrack: track,
                          remixer: remix.remixer as User,
                        }}
                        variant="compact"
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <div className="text-6xl mb-4">🔁</div>
                    <h3 className="text-xl font-semibold mb-2">No remixes yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Be the first to create a remix of this track!
                    </p>
                    <Button variant="primary" onClick={handleRemix}>
                      Create Remix
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <TrackStats track={track} />
            )}

            {activeTab === 'about' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {track.description || 'No description provided.'}
                  </p>

                  <h3 className="font-semibold text-lg mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Genre</p>
                      <p className="font-medium">{track.genre}</p>
                    </div>
                    {track.bpm && (
                      <div>
                        <p className="text-sm text-gray-500">BPM</p>
                        <p className="font-medium">{track.bpm}</p>
                      </div>
                    )}
                    {track.key && (
                      <div>
                        <p className="text-sm text-gray-500">Key</p>
                        <p className="font-medium">{track.key}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Token Address</p>
                      <p className="font-medium font-mono text-sm">
                        {track.bagsTokenAddress
                          ? formatAddress(track.bagsTokenAddress, 8, 8)
                          : 'Not minted'}
                      </p>
                    </div>
                  </div>

                  {track.tags && track.tags.length > 0 && (
                    <>
                      <h3 className="font-semibold text-lg mt-6 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {track.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {creator && (
              <Card>
                <CardHeader title="Creator" />
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                      {creator.displayName?.[0] || creator.username?.[0] || 'C'}
                    </div>
                    <div>
                      <Link
                        href={`/profile/${creator._id}`}
                        className="font-semibold hover:text-primary-500 transition-colors"
                      >
                        {creator.displayName || creator.username || 'Creator'}
                      </Link>
                      <Badge
                        variant="outline"
                        size="sm"
                        className={cn('ml-2', creatorLevelColor.text)}
                      >
                        {creator.creatorProfile?.level.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      {/* <p className="text-sm text-gray-500">
                        {creator.stats.followers || 0} followers
                      </p> */}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {creator.bio || 'No bio yet.'}
                  </p>
                  <Button
                    variant={isOwner ? 'outline' : 'primary'}
                    fullWidth
                    onClick={() => router.push(`/profile/${creator._id}`)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            )}
            <AISuggestions genre={track.genre} />
            <Card>
              <CardHeader title="Royalty Split" />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Creator</span>
                    <span className="font-semibold text-primary-500">
                      {track.royaltySplit.creator}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Remixer</span>
                    <span className="font-semibold text-accent-500">
                      {track.royaltySplit.remixer}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform</span>
                    <span className="font-semibold text-gray-500">
                      {track.royaltySplit.platform}%
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 text-center">
                      Creators earn {track.royaltySplit.creator}% of all trading fees from remixes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Track"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-dark-300 rounded-lg">
            <input
              type="text"
              value={typeof window !== 'undefined' ? window.location.href : ''}
              readOnly
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyLink}
            >
              {isCopied ? (
                <>
                  <FiCheck className="mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <FiCopy className="mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out "${track.title}" on QuiqerrTrade Market! 🎵💹\n\n${window.location.href}`
                )}`, '_blank');
              }}
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(
                  window.location.href
                )}&text=${encodeURIComponent(`Check out "${track.title}" on QuiqerrTrade Market!`)}`, '_blank');
              }}
            >
              Telegram
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remix Modal */}
      <Modal
        isOpen={showRemixModal}
        onClose={() => setShowRemixModal(false)}
        title="Create Remix"
        size="lg"
      >
        <CreateRemixForm
          track={track}
          onSuccess={() => {
            setShowRemixModal(false);
            refetch();
            toast.success('Remix created successfully!');
          }}
          onCancel={() => setShowRemixModal(false)}
        />
      </Modal>
    </div>
  );
}

// ============================================
// STAT ITEM COMPONENT
// ============================================

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 dark:bg-dark-300 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-lg">{value}</p>
      </div>
    </div>
  );
};

// ============================================
// TRACK STATS COMPONENT
// ============================================

interface TrackStatsProps {
  track: Track;
}

const TrackStats: React.FC<TrackStatsProps> = ({ track }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Performance Stats</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold">
                {formatCurrency(track.stats.totalVolume, 'USDC', 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remixes Created</p>
              <p className="text-2xl font-bold">{track.stats.remixCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Creator Earnings</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(track.stats.totalEarned, 'USDC', 2)}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Trending Score</p>
              <p className="text-2xl font-bold">
                {Math.floor(track.stats.trendingScore)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-2xl font-bold">
                {formatDate(track.createdAt, 'short')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};