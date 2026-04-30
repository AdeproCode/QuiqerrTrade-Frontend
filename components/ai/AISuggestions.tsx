'use client';

import React from 'react';
import { FiCloudLightning, FiArrowRight, FiLoader, FiMusic } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { aiAPI } from '@/lib/api/ai';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils/helpers';
import Link from 'next/link';

interface AISuggestionsProps {
  genre?: string | undefined;
  className?: string;
    preferredGenres?: string;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ genre, className }) => {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['ai-suggestions', genre],
    queryFn: () => aiAPI.getSuggestions(genre),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <FiCloudLightning className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Sign in to get AI-powered suggestions</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center gap-2">
          <FiLoader className="animate-spin w-4 h-4 text-primary-500" />
          <span className="text-sm text-gray-500">AI is analyzing trends...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden border-l-4 border-l-yellow-500', className)}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
            <FiCloudLightning className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Suggestion</h3>
            <p className="text-xs text-gray-500">Powered by GPT-4</p>
          </div>
          {data?.generic && (
            <Badge variant="outline" className="ml-auto text-xs">Generic</Badge>
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {data?.suggestion || 'Explore trending tracks to find remix opportunities.'}
        </p>

        <div className="flex gap-2 mt-4">
          <Link href="/discover">
            <Button variant="primary" size="sm">
              <FiMusic className="w-3 h-3 mr-1" />
              Discover Tracks
            </Button>
          </Link>
          <Link href="/market">
            <Button variant="outline" size="sm">
              View Market
              <FiArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};