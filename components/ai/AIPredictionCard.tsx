'use client';

import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiInfo, FiLoader, FiZap } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { aiAPI } from '@/lib/api/ai';
import { cn } from '@/lib/utils/helpers';

interface AIPredictionCardProps {
  remixId: string;
  initialPrediction?: {
    viralPotential: number;
    suggestedAction: 'BUY' | 'WATCH' | 'PASS';
    reasoning?: string;
  } | undefined;
  className?: string;
}

export const AIPredictionCard: React.FC<AIPredictionCardProps> = ({
  remixId,
  initialPrediction,
  className,
}) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-prediction', remixId],
    queryFn: () => aiAPI.predictViral(remixId),
    enabled: !initialPrediction && !!remixId,
  });

  const prediction = initialPrediction || data?.prediction;
  
  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 70) return 'bg-green-500/10 border-green-500/30';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'BUY':
        return { color: 'bg-green-500', text: '🟢 Strong Buy', icon: FiTrendingUp };
      case 'WATCH':
        return { color: 'bg-yellow-500', text: '🟡 Watch', icon: FiInfo };
      case 'PASS':
        return { color: 'bg-red-500', text: '🔴 Pass', icon: FiTrendingDown };
      default:
        return { color: 'bg-gray-500', text: '⚪ Hold', icon: FiInfo };
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <FiLoader className="animate-spin w-6 h-6 text-primary-500" />
          <span className="ml-2 text-sm text-gray-500">Analyzing viral potential...</span>
        </div>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <FiZap className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">AI analysis not available</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
          Retry Analysis
        </Button>
      </Card>
    );
  }

  const actionBadge = getActionBadge(prediction.suggestedAction);
  const ActionIcon = actionBadge.icon;

  return (
    <Card className={cn('overflow-hidden', getScoreBg(prediction.viralPotential), className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FiZap className="w-4 h-4 text-yellow-500" />
            AI Prediction
          </h3>
          <Badge variant="outline" className="text-xs">Powered by GPT-4</Badge>
        </div>

        {/* Score Circle */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
              <circle
                cx="60" cy="60" r="54" fill="none" strokeWidth="8"
                strokeLinecap="round"
                className={getScoreColor(prediction.viralPotential)}
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - prediction.viralPotential / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-xl font-bold', getScoreColor(prediction.viralPotential))}>
                {prediction.viralPotential}
              </span>
            </div>
          </div>
          <div>
            <Badge className={cn('mb-2', actionBadge.color)}>
              <ActionIcon className="w-3 h-3 mr-1" />
              {actionBadge.text}
            </Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Viral Potential Score
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Higher scores indicate greater viral likelihood
            </p>
          </div>
        </div>

        {/* Reasoning */}
        {prediction.reasoning && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-1">AI Analysis</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {prediction.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};