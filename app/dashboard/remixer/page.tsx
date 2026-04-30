'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  FiRepeat, FiTrendingUp, FiDollarSign, FiPieChart,
  FiSearch, FiAward
} from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';
import { GetRemixerStatsResponse } from '@/lib/types/api';
import { formatCurrency, formatXP } from '@/lib/utils/formatters';
import { cn, getLevelColor } from '@/lib/utils/helpers';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { AISuggestions } from '@/components/ai/AISuggestions';

const styleData = [
  { name: 'Night', value: 35, color: '#3b82f6' },
  { name: 'Chill', value: 25, color: '#22c55e' },
  { name: 'Club', value: 20, color: '#f59e0b' },
  { name: 'Acoustic', value: 10, color: '#ef4444' },
  { name: 'Sped Up', value: 8, color: '#a855f7' },
  { name: 'Slowed', value: 2, color: '#ec4899' },
];

export default function RemixerStudioPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['remixer-stats', user?._id],
    queryFn: async () => {
      const response = await apiClient.get<GetRemixerStatsResponse>('/users/me/remixer-stats');
      return response;
    },
    enabled: !!user?._id,
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <FiRepeat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Become a Remixer</h2>
        <p className="text-gray-500 mb-6">Create your first remix to access the Remixer Studio</p>
        <Link href="/market"><Button variant="primary">Find Tracks to Remix</Button></Link>
      </div>
    );
  }

  if (isLoading || !data) return <Skeleton />;

  const { overview, topRemixes, level } = data;
  const levelColor = getLevelColor(level?.level || 'beginner');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Remixer Studio</h1>
          <p className="text-gray-500 mt-1">Create remixes and earn royalties from every trade</p>
        </div>
        <Link href="/discover"><Button variant="primary"><FiSearch className="mr-2" />Find Tracks</Button></Link>
      </motion.div>

      {/* Level Card */}
      {level && (
        <Card className="bg-gradient-to-r from-orange-500/5 to-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', levelColor.bg)}>
                  <FiAward className={cn('w-7 h-7', levelColor.text)} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Badge variant="outline" className={levelColor.text}>{level.level.replace(/_/g, ' ').toUpperCase()}</Badge>
                  </h3>
                  <p className="text-sm text-gray-500">{formatXP(level.levelProgress.currentXP)} / {formatXP(level.levelProgress.nextLevelXP)} XP</p>
                </div>
              </div>
              <ProgressBar value={level.levelProgress.currentXP} max={level.levelProgress.nextLevelXP} className="w-full sm:w-48 h-2.5" color="from-orange-500 to-yellow-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiRepeat} label="Total Remixes" value={overview.totalRemixes.toString()} sub={`${overview.publishedRemixes} published`} color="text-orange-500" bg="bg-orange-500/10" />
        <StatCard icon={FiTrendingUp} label="Total Volume" value={formatCurrency(overview.totalVolume, 'USDC', 0)} sub="All time" color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={FiDollarSign} label="Earned" value={formatCurrency(overview.totalEarned, 'USDC', 2)} sub="Royalties" color="text-green-500" bg="bg-green-500/10" />
        <StatCard icon={FiPieChart} label="Avg ROI" value={`${overview.averageROI.toFixed(1)}%`} sub="Return" color="text-purple-500" bg="bg-purple-500/10" />
      </div>
      <AISuggestions />
      {/* Style Distribution & Top Remixes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Style Distribution" subtitle="Volume by remix style" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={styleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {styleData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {styleData.map(s => <div key={s.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-xs">{s.name} ({s.value}%)</span></div>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Top Remixes" subtitle="Best performing" />
          <CardContent>
            <div className="space-y-3">
              {topRemixes.slice(0, 5).map((remix, i) => (
                <Link key={remix._id} href={`/remix/${remix._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors group">
                  <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                  <div className="flex-1"><p className="font-medium group-hover:text-primary-500 text-sm">{remix.title}</p><Badge size="sm" variant="outline">{remix.style}</Badge></div>
                  <div className="text-right"><p className="font-semibold text-sm">{formatCurrency(remix.stats.currentPrice, 'USDC', 4)}</p></div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps { icon: React.ElementType; label: string; value: string; sub: string; color: string; bg: string; }
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, sub, color, bg }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-gray-500 mb-1">{label}</p><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500 mt-1">{sub}</p></div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}><Icon className={cn('w-5 h-5', color)} /></div>
      </div>
    </CardContent>
  </Card>
);

const Skeleton: React.FC = () => <div className="space-y-6"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div></div>;