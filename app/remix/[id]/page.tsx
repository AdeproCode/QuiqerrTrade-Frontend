'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiPlay, 
  FiPause, 
  FiShare2, 
  FiHeart, 
  FiTrendingUp,
  FiTrendingDown,
  FiMusic,
  FiCopy,
  FiCheck,
  FiExternalLink
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { useAudioStore } from '@/lib/store/audioStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PriceChart } from '@/components/remix/PriceChart';
import { RemixTradeWidget } from '@/components/remix/RemixTradeWidget';
import apiClient from '@/lib/api/client';
import { GetRemixResponse } from '@/lib/types/api';
import { Track, User } from '@/lib/types';
import { formatCurrency, formatPercentage, formatDate, formatAddress } from '@/lib/utils/formatters';
import { cn, copyToClipboard, getLevelColor } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import { TraderInsight } from '@/components/ai/TraderInsight';
import { AIPredictionCard } from '@/components/ai/AIPredictionCard';

export default function RemixDetailPage() {
  const params = useParams();
  const router = useRouter();
  const remixId = params['id'] as string;
  
  const { isAuthenticated} = useAuthStore();
  const { currentTrack, isPlaying, setTrack, toggle } = useAudioStore();
  
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showTradeModal, setShowTradeModal] = useState<boolean>(false);
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['remix', remixId],
    queryFn: async () => {
      const response = await apiClient.get<GetRemixResponse>(`/remixes/${remixId}`);
      return response;
    },
    enabled: !!remixId,
  });

  const remix = data?.remix;
  const parentTrack = remix?.parentTrack as Track;
  const remixer = remix?.remixer as User;

  const isCurrentTrack = currentTrack?.id === remix?._id && currentTrack?.type === 'remix';
  const priceChange = remix?.stats.priceChange24h ?? 0;
  const isPriceUp = priceChange >= 0;

  const handlePlay = useCallback((): void => {
    if (!remix || !parentTrack) return;
    
    if (isCurrentTrack) {
      toggle();
    } else {
      setTrack({
        id: remix._id,
        title: remix.title,
        artist: remixer?.displayName || remixer?.username || formatAddress(remix.remixerWallet),
        audioUrl: remix.audioUrl,
        coverImage: parentTrack.coverImageUrl,
        type: 'remix',
      });
    }
  }, [remix, parentTrack, remixer, isCurrentTrack, setTrack, toggle]);

  const handleTrade = useCallback((action: 'buy' | 'sell'): void => {
    if (!isAuthenticated) {
      toast.error('Please sign in to trade');
      return;
    }
    setTradeAction(action);
    setShowTradeModal(true);
  }, [isAuthenticated]);

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
      toast.error('Please sign in to like remixes');
      return;
    }
    setIsLiked((prev) => !prev);
  }, [isAuthenticated]);

  const remixerLevelColor = getLevelColor(remixer?.remixerProfile?.level ?? 'beginner');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !remix || !parentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Remix Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The remix you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => router.push('/market')}>
            Explore Market
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Section */}
      <div className="relative h-80 md:h-96">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-dark-300" />
        
        {parentTrack.coverImageUrl && (
          <Image
            src={parentTrack.coverImageUrl}
            alt={remix.title}
            fill
            className="object-cover opacity-30 blur-sm"
          />
        )}

        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-8">
          <div className="flex items-end gap-6">
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
              {parentTrack.coverImageUrl ? (
                <Image
                  src={parentTrack.coverImageUrl}
                  alt={remix.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <FiMusic className="w-16 h-16 text-white" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge variant="glass">REMIX</Badge>
              </div>
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="glass">{remix.style?.toUpperCase()}</Badge>
                <Badge variant="glass">{parentTrack.genre.toUpperCase()}</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-2 text-white">
                {remix.title}
              </h1>
              <div className="flex items-center gap-4 text-white/80">
                <Link
                  href={`/profile/${remixer?._id}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  <span>{remixer?.displayName || remixer?.username || formatAddress(remix.remixerWallet)}</span>
                </Link>
                <span>•</span>
                <Link
                  href={`/track/${parentTrack._id}`}
                  className="hover:text-white transition-colors"
                >
                  Remix of &quot;{parentTrack.title}&quot;
                </Link>
                <span>•</span>
                <span>{formatDate(remix.createdAt, 'medium')}</span>
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
            </div>
          </div>
        </div>
      </div>

      {/* Price & Stats Bar */}
      <div className="bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(remix.stats.currentPrice, 'USDC', 4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Change</p>
                <p className={cn(
                  'text-lg font-semibold',
                  isPriceUp ? 'text-green-500' : 'text-red-500'
                )}>
                  {isPriceUp ? <FiTrendingUp className="inline mr-1" /> : <FiTrendingDown className="inline mr-1" />}
                  {formatPercentage(priceChange, 2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Volume</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(remix.stats.volume24h, 'USDC', 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Holders</p>
                <p className="text-lg font-semibold">{remix.stats.holders}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="success" size="lg" onClick={() => handleTrade('buy')}>
                Buy
              </Button>
              <Button variant="danger" size="lg" onClick={() => handleTrade('sell')}>
                Sell
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Price Chart */}
            <Card>
              <CardHeader title="Price Chart" />
              <CardContent>
                <PriceChart remixId={remix._id} />
              </CardContent>
            </Card>

            {/* Description */}
            {remix.description && (
              <Card>
                <CardHeader title="About this Remix" />
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {remix.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* AI Prediction */}
            <AIPredictionCard 
              remixId={remix._id} 
              initialPrediction={remix.aiPrediction}
            />

            {/* ✅ Trader Insight */}
            <TraderInsight remixId={remix._id} />
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-96 space-y-6">
            {/* Trade Widget */}
            <RemixTradeWidget
              remix={remix}
              onTradeComplete={() => refetch()}
            />

            {/* Remixer Card */}
            <Card>
              <CardHeader title="Remixer" />
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                    {remixer?.displayName?.[0] || remixer?.username?.[0] || 'R'}
                  </div>
                  <div>
                    <Link
                      href={`/profile/${remixer?._id}`}
                      className="font-semibold hover:text-primary-500 transition-colors"
                    >
                      {remixer?.displayName || remixer?.username || 'Remixer'}
                    </Link>
                    <Badge
                      variant="outline"
                      size="sm"
                      className={cn('ml-2', remixerLevelColor.text)}
                    >
                      {remixer?.remixerProfile?.level.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      {remixer?.remixerProfile?.totalRemixes || 0} remixes
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => router.push(`/profile/${remixer?._id}`)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Original Track Card */}
            <Card>
              <CardHeader title="Original Track" />
              <CardContent>
                <Link
                  href={`/track/${parentTrack._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <FiMusic className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{parentTrack.title}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {parentTrack.genre} • {parentTrack.stats.remixCount} remixes
                    </p>
                  </div>
                  <FiExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              </CardContent>
            </Card>

            {/* Royalty Info */}
            <Card>
              <CardHeader title="Royalty Split" />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Creator</span>
                    <span className="font-semibold text-primary-500">
                      {remix.royaltySplit.creator}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Remixer</span>
                    <span className="font-semibold text-accent-500">
                      {remix.royaltySplit.remixer}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform</span>
                    <span className="font-semibold text-gray-500">
                      {remix.royaltySplit.platform}%
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 text-center">
                      Every trade distributes fees to creator, remixer, and platform
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Info */}
            <Card>
              <CardHeader title="Token Info" />
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Symbol</span>
                    <span className="font-mono">{remix.tokenSymbol || 'RMX'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Token Address</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">
                        {remix.bagsTokenAddress
                          ? formatAddress(remix.bagsTokenAddress, 6, 4)
                          : 'Not minted'}
                      </span>
                      {remix.bagsTokenAddress && (
                        <button
                          onClick={() => copyToClipboard(remix.bagsTokenAddress!)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiCopy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Supply</span>
                    <span>1,000,000</span>
                  </div>
                </div>
                {remix.bagsTokenAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="mt-4"
                    onClick={() => window.open(
                      `https://solscan.io/token/${remix.bagsTokenAddress}?cluster=devnet`,
                      '_blank'
                    )}
                  >
                    View on Solscan
                    <FiExternalLink className="ml-2 w-3 h-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Remix"
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
                  `Check out this remix on QuiqerrTrade Market! 🎵💹\n\n${window.location.href}`
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
                )}&text=${encodeURIComponent(`Check out this remix on QuiqerrTrade Market!`)}`, '_blank');
              }}
            >
              Telegram
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trade Modal */}
      <Modal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        title={tradeAction === 'buy' ? 'Buy Remix Tokens' : 'Sell Remix Tokens'}
        size="md"
      >
        <RemixTradeWidget
          remix={remix}
          defaultAction={tradeAction}
          compact={false}
          onTradeComplete={() => {
            setShowTradeModal(false);
            refetch();
            toast.success(`${tradeAction === 'buy' ? 'Purchase' : 'Sale'} completed!`);
          }}
          onCancel={() => setShowTradeModal(false)}
        />
      </Modal>
    </div>
  );
}