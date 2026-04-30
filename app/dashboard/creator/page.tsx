'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  FiMusic, FiTrendingUp, FiDollarSign, FiUsers, FiPlus, FiPlay,
  FiExternalLink, FiAward
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';
import { GetCreatorStatsResponse } from '@/lib/types/api';
import { formatCurrency, formatXP} from '@/lib/utils/formatters';
import { cn, getLevelColor } from '@/lib/utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer} from 'recharts';
import { AISuggestions } from '@/components/ai/AISuggestions';

const analyticsData = [
  { date: 'Mon', streams: 120, volume: 450 },
  { date: 'Tue', streams: 200, volume: 680 },
  { date: 'Wed', streams: 150, volume: 520 },
  { date: 'Thu', streams: 300, volume: 890 },
  { date: 'Fri', streams: 250, volume: 750 },
  { date: 'Sat', streams: 400, volume: 1200 },
  { date: 'Sun', streams: 350, volume: 950 },
];

export default function CreatorHubPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['creator-stats', user?._id],
    queryFn: async () => {
      const response = await apiClient.get<GetCreatorStatsResponse>('/users/me/creator-stats');
      return response;
    },
    enabled: !!user?._id,
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <FiMusic className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Become a Creator</h2>
        <p className="text-gray-500 mb-6">Upload your first track to access the Creator Hub</p>
        <Link href="/upload"><Button variant="primary">Upload Track</Button></Link>
      </div>
    );
  }

  if (isLoading || !data) return <Skeleton />;

  const { overview, topTracks, level } = data;
  const levelColor = getLevelColor(level?.level || 'new_creator');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Creator Hub</h1>
            <p className="text-gray-500 mt-1">Manage your tracks, earnings, and growth</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/upload">
              <Button variant="primary"><FiPlus className="mr-2" />Upload Track</Button>
            </Link>
            <Link href={`/profile/${user._id}`}>
              <Button variant="outline"><FiPlay className="mr-2" />View Profile</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Level Card */}
      {level && (
        <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', levelColor.bg)}>
                  <FiAward className={cn('w-7 h-7', levelColor.text)} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Badge variant="outline" className={levelColor.text}>
                      {level.level.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-500">{formatXP(level.levelProgress.currentXP)} / {formatXP(level.levelProgress.nextLevelXP)} XP to next level</p>
                </div>
              </div>
              <ProgressBar value={level.levelProgress.currentXP} max={level.levelProgress.nextLevelXP} className="w-full sm:w-48 h-2.5" color="from-purple-500 to-pink-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiMusic} label="Total Tracks" value={overview.totalTracks.toString()} subValue={`${overview.publishedTracks} published`} color="text-purple-500" bg="bg-purple-500/10" />
        <StatCard icon={FiTrendingUp} label="Total Volume" value={formatCurrency(overview.totalVolume, 'USDC', 0)} subValue="All time" color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={FiDollarSign} label="Earned" value={formatCurrency(overview.totalEarned, 'USDC', 2)} subValue="Royalties" color="text-green-500" bg="bg-green-500/10" />
        <StatCard icon={FiUsers} label="Remixes Received" value={overview.totalRemixesReceived.toString()} subValue="From community" color="text-orange-500" bg="bg-orange-500/10" />
      </div>
      <AISuggestions genre={data?.overview?.primaryGenre || 'afrobeats'} />
      {/* Analytics Chart */}
      <Card>
        <CardHeader title="Performance Analytics" subtitle="Last 7 days" />
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="streams" stroke="#a855f7" strokeWidth={2} fill="url(#streamGradient)" name="Streams" />
                <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} fill="none" name="Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Tracks */}
      <Card>
        <CardHeader title="Your Top Tracks" subtitle="Best performing tracks" action={<Link href="/dashboard/creator/tracks"><Button variant="ghost" size="sm">View All →</Button></Link>} />
        <CardContent>
          <div className="space-y-3">
            {topTracks.slice(0, 5).map((track, i) => (
              <Link key={track._id} href={`/track/${track._id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors group">
                <span className="text-lg font-bold text-gray-400 w-8">{i + 1}</span>
                <div className="flex-1"><p className="font-medium group-hover:text-primary-500">{track.title}</p></div>
                <div className="text-right"><p className="font-semibold">{formatCurrency(track.stats.totalVolume, 'USDC', 0)}</p><p className="text-xs text-gray-500">{track.stats.remixCount} remixes</p></div>
                <FiExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components
interface StatCardProps { icon: React.ElementType; label: string; value: string; subValue: string; color: string; bg: string; }
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, subValue, color, bg }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-gray-500 mb-1">{label}</p><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500 mt-1">{subValue}</p></div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}><Icon className={cn('w-5 h-5', color)} /></div>
      </div>
    </CardContent>
  </Card>
);

const Skeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
    <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
  </div>
);