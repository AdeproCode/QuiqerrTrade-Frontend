'use client';

import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiInfo, FiLoader } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { aiAPI } from '@/lib/api/ai';
import { cn } from '@/lib/utils/helpers';

interface TraderInsightProps {
  remixId: string;
  className?: string;
}

export const TraderInsight: React.FC<TraderInsightProps> = ({ remixId, className }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['trader-insight', remixId],
    queryFn: () => aiAPI.getTraderInsight(remixId),
    enabled: !!remixId,
  });

  if (isLoading) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center gap-2">
          <FiLoader className="animate-spin w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-500">Generating insight...</span>
        </div>
      </Card>
    );
  }

  if (!data?.insight) return null;

  // Determine sentiment from insight text
  const insight = data.insight.toLowerCase();
  const isBullish = insight.includes('undervalued') || insight.includes('buy') || insight.includes('positive');
  const isBearish = insight.includes('overvalued') || insight.includes('sell') || insight.includes('negative');

  return (
    <Card className={cn(
      'border-l-4 p-4',
      isBullish ? 'border-l-green-500 bg-green-500/5' : 
      isBearish ? 'border-l-red-500 bg-red-500/5' : 
      'border-l-blue-500 bg-blue-500/5',
      className
    )}>
      <div className="flex items-start gap-3">
        {isBullish ? (
          <FiTrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
        ) : isBearish ? (
          <FiTrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
        ) : (
          <FiInfo className="w-5 h-5 text-blue-500 mt-0.5" />
        )}
        <div>
          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
            AI Trader Insight
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {data.insight}
          </p>
        </div>
      </div>
    </Card>
  );
};