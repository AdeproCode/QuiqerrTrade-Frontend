'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiSearch, FiMusic, FiPlay, FiHeadphones, FiTrendingUp, FiRepeat, FiArrowRight
} from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { CreateRemixForm } from '@/components/remix/CreateRemixForm';
import { cn } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import { Track } from '@/lib/types';
import { AISuggestions } from '@/components/ai/AISuggestions';

const discoverTabs: TabItem[] = [
  { value: 'trending', label: 'Trending Tracks', icon: FiTrendingUp },
  { value: 'new', label: 'New Uploads', icon: FiMusic },
  { value: 'popular', label: 'Most Remixed', icon: FiRepeat },
  { value: 'genre', label: 'By Genre', icon: FiHeadphones },
];

// Mock tracks that match the Track type
const tracksToRemix: Track[] = [
  { _id: '1', title: 'Afro Beat Original', creator: { _id: 'c1', username: 'wizkid_type', displayName: 'Wizkid Type', walletAddress: 'wallet1' } as any, creatorWallet: 'wallet1', genre: 'afrobeats' as any, bpm: 118, key: 'Am', audioUrl: '', stats: { remixCount: 12, totalVolume: 45000, totalEarned: 2250, trendingScore: 85}, plays: 89000, royaltySplit: { creator: 50, remixer: 45, platform: 5 }, status: 'published' as any, coverColor: 'from-purple-500 to-pink-500', createdAt: '', updatedAt: '' },
  { _id: '2', title: 'Summer Vibes Loop', creator: { _id: 'c2', username: 'burna_style', displayName: 'Burna Boy Style', walletAddress: 'wallet2' } as any, creatorWallet: 'wallet2', genre: 'amapiano' as any, bpm: 112, key: 'Fm', audioUrl: '', stats: { remixCount: 8, totalVolume: 32000, totalEarned: 1600, trendingScore: 72}, plays: 67000, royaltySplit: { creator: 50, remixer: 45, platform: 5 }, status: 'published' as any, coverColor: 'from-orange-500 to-yellow-500', createdAt: '', updatedAt: '' },
  { _id: '3', title: 'Dark Drill Beat', creator: { _id: 'c3', username: 'central_cee', displayName: 'Central Cee Type', walletAddress: 'wallet3' } as any, creatorWallet: 'wallet3', genre: 'drill' as any, bpm: 142, key: 'Dm', audioUrl: '', stats: { remixCount: 15, totalVolume: 52000, totalEarned: 2600, trendingScore: 91}, plays: 92000, royaltySplit: { creator: 50, remixer: 45, platform: 5 }, status: 'published' as any, coverColor: 'from-blue-500 to-cyan-500', createdAt: '', updatedAt: '' },
  { _id: '4', title: 'Love R&B Chords', creator: { _id: 'c4', username: 'sza_style', displayName: 'SZA Style', walletAddress: 'wallet4' } as any, creatorWallet: 'wallet4', genre: 'rnb' as any, bpm: 85, key: 'Cm', audioUrl: '', stats: { remixCount: 6, totalVolume: 28000, totalEarned: 1400, trendingScore: 65}, plays: 54000, royaltySplit: { creator: 50, remixer: 45, platform: 5 }, status: 'published' as any, coverColor: 'from-red-500 to-pink-500', createdAt: '', updatedAt: '' },
  { _id: '5', title: 'Club Banger Drop', creator: { _id: 'c5', username: 'garrix_type', displayName: 'Martin Garrix Type', walletAddress: 'wallet5' } as any, creatorWallet: 'wallet5', genre: 'edm' as any, bpm: 128, key: 'Gm', audioUrl: '', stats: { remixCount: 20, totalVolume: 78000, totalEarned: 3900, trendingScore: 95}, plays: 145000, royaltySplit: { creator: 50, remixer: 45, platform: 5 }, status: 'published' as any, coverColor: 'from-green-500 to-emerald-500', createdAt: '', updatedAt: '' },
  { _id: '6', title: 'Trap Bass Loop', creator: { _id: 'c6', username: 'trav_type', displayName: 'Travis Scott Type', walletAddress: 'wallet6' } as any, creatorWallet: 'wallet6', genre: 'hiphop' as any, bpm: 140, key: 'Ebm', audioUrl: '', stats: { remixCount: 10, totalVolume: 38000, totalEarned: 1900, trendingScore: 78}, plays: 72000, royaltySplit: { creator: 50, remixer: 45, platform: 5 }, status: 'published' as any, coverColor: 'from-violet-500 to-purple-500', createdAt: '', updatedAt: '' },
].map(track => ({
  ...track,
  description: '',
  tags: [],
  coverImageUrl: '',
  bagsTokenAddress: `token_${track._id}`,
}));

const coverColors = [
  'from-purple-500 to-pink-500',
  'from-orange-500 to-yellow-500',
  'from-blue-500 to-cyan-500',
  'from-red-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-violet-500 to-purple-500',
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [remixModal, setRemixModal] = useState<{ isOpen: boolean; track: Track | null }>({
    isOpen: false,
    track: null,
  });

  const handleRemixClick = (track: Track) => {
    setRemixModal({ isOpen: true, track });
  };

  const handleRemixSuccess = () => {
    setRemixModal({ isOpen: false, track: null });
    toast.success('Remix created successfully!');
  };

  const handleRemixCancel = () => {
    setRemixModal({ isOpen: false, track: null });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">🎧 Discover Tracks</h1>
              <p className="text-gray-500 mt-1">Find original tracks to remix and earn royalties</p>
            </div>
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search tracks..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" 
              />
            </div>
          </div>
        </motion.div>

        <div className="mb-2">
            <AISuggestions genre={activeTab === 'genre' ? 'afrobeats' : undefined} />
        </div>

        {/* Tabs */}
        <Tabs items={discoverTabs} value={activeTab} onChange={setActiveTab} className='flex flex-row' />

        {/* Track Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracksToRemix.map((track, index) => (
            <motion.div 
              key={track._id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Cover */}
                <Link href={`/track/${track._id}`}>
                  <div className={cn('h-32 bg-gradient-to-br flex items-center justify-center relative', coverColors[index])}>
                    <FiMusic className="w-12 h-12 text-white/50" />
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="glass" className="text-xs">{track.genre.toUpperCase()}</Badge>
                    </div>
                    <button 
                      type="button"
                      className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                      <FiPlay className="w-4 h-4 text-gray-900 ml-0.5" />
                    </button>
                  </div>
                </Link>
                
                <CardContent className="p-4">
                  <Link href={`/track/${track._id}`}>
                    <h3 className="font-semibold text-lg mb-1 hover:text-primary-500 transition-colors">
                      {track.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-3">
                    {typeof track.creator === 'object' ? track.creator.displayName || track.creator.username : 'Unknown'}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>🎵 {track.bpm} BPM</span>
                    <span>🎹 {track.key}</span>
                    <span>🔁 {track.stats.remixCount} remixes</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-500">
                        <FiTrendingUp className="w-3 h-3" /> ${track.stats.totalVolume.toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="!px-3 !py-1 text-xs"
                      onClick={() => handleRemixClick(track)}
                    >
                      Remix <FiArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Remix Modal with CreateRemixForm */}
      <Modal
        isOpen={remixModal.isOpen}
        onClose={handleRemixCancel}
        title="Create Remix"
        size="lg"
      >
        {remixModal.track && (
          <CreateRemixForm
            track={remixModal.track}
            onSuccess={handleRemixSuccess}
            onCancel={handleRemixCancel}
          />
        )}
      </Modal>
    </div>
  );
}