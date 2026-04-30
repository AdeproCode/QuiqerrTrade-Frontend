'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RemixCard } from './RemixCard';
import { MarketFeedItem } from '@/lib/types';
import apiClient from '@/lib/api/client';
import { GetMarketFeedResponse } from '@/lib/types/api';

const fetchTrending = async (): Promise<MarketFeedItem[]> => {
  const response = await apiClient.get<GetMarketFeedResponse>(
    '/remixes/market?filter=trending&limit=4'
  );
  return response.data;
};

const TrendingSection: React.FC = () => {
  const { data: trendingItems, isLoading } = useQuery({
    queryKey: ['trending-remixes'],
    queryFn: fetchTrending,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-6 h-6 text-primary-500" />
              <h2 className="text-3xl font-display font-bold">Trending Now</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="p-4">
                <div className="animate-pulse">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!trendingItems?.length) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold">Trending Now</h2>
              <span className="text-sm bg-primary-500/10 text-primary-500 px-3 py-1 rounded-full ml-3">
                🔥 Hot
              </span>
            </div>
            <Link href="/market?filter=trending">
              <Button variant="ghost">
                View All
                <FiArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingItems.map((item, index) => (
              <motion.div
                key={item.remix._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <RemixCard item={item} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingSection;