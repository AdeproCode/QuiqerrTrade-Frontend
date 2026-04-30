'use client';

import React, { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FiFilter } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { RemixCard } from './RemixCard';
import { MarketFilters as MarketFiltersType } from '@/lib/types/store';
import { MarketFeedItem } from '@/lib/types';
import apiClient from '@/lib/api/client';
import { GetMarketFeedResponse } from '@/lib/types/api';
import { cn } from '@/lib/utils/helpers';

interface MarketFeedProps {
  limit?: number | undefined;
  showFilters?: boolean | undefined;
  className?: string | undefined;
}

const sortOptions: SelectOption[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'new', label: 'Newest' },
  { value: 'gainers', label: 'Top Gainers' },
  { value: 'volume', label: 'Highest Volume' },
];

const genreOptions: SelectOption[] = [
  { value: '', label: 'All Genres' },
  { value: 'afrobeats', label: 'Afrobeats' },
  { value: 'amapiano', label: 'Amapiano' },
  { value: 'drill', label: 'Drill' },
  { value: 'hiphop', label: 'Hip Hop' },
  { value: 'edm', label: 'EDM' },
  { value: 'pop', label: 'Pop' },
  { value: 'rnb', label: 'R&B' },
];

const styleOptions: SelectOption[] = [
  { value: '', label: 'All Styles' },
  { value: 'night', label: 'Night Version' },
  { value: 'chill', label: 'Chill' },
  { value: 'club', label: 'Club' },
  { value: 'acoustic', label: 'Acoustic' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'spedup', label: 'Sped Up' },
  { value: 'slowed', label: 'Slowed' },
];

const fetchMarketFeed = async ({
  pageParam = 1,
  filters,
  limit = 20,
}: {
  pageParam?: number;
  filters: MarketFiltersType;
  limit?: number;
}): Promise<GetMarketFeedResponse> => {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: limit.toString(),
    filter: filters.sortBy,
  });

  if (filters.genre) params.append('genre', filters.genre);
  if (filters.style) params.append('style', filters.style);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

  const response = await apiClient.get<GetMarketFeedResponse>(
    `/remixes/market?${params.toString()}`
  );
  return response;
};

const MarketFeed: React.FC<MarketFeedProps> = ({
  limit = 20,
  showFilters = true,
  className,
}) => {
  const [filters, setFilters] = useState<MarketFiltersType>({
    sortBy: 'trending',
    genre: undefined,
    style: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['market-feed', filters, limit],
    queryFn: ({ pageParam }) => fetchMarketFeed({ pageParam, filters, limit }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const handleFilterChange = useCallback(
    <K extends keyof MarketFiltersType>(key: K, value: MarketFiltersType[K]): void => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleResetFilters = useCallback((): void => {
    setFilters({
      sortBy: 'trending',
      genre: undefined,
      style: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  }, []);

  // Fixed: Safely extract items with fallback
  const allItems: MarketFeedItem[] = React.useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flatMap((page) => page.data || [])
      .filter((item): item is MarketFeedItem => 
        item !== null && 
        item !== undefined && 
        item.remix !== null && 
        item.remix !== undefined
      );
  }, [data]);

  const totalItems = data?.pages[0]?.pagination.total ?? 0;

  // Debug: Log the data structure
  React.useEffect(() => {
    if (data?.pages) {
      console.log('Market feed data:', {
        pages: data.pages.length,
        firstPage: data.pages[0],
        firstItem: data.pages[0]?.data?.[0],
        hasRemix: !!data.pages[0]?.data?.[0]?.remix,
      });
    }
  }, [data]);

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load market feed</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select
            value={filters.sortBy}
            onChange={(value: string) => handleFilterChange('sortBy', value as MarketFiltersType['sortBy'])}
            options={sortOptions}
            className="w-40"
          />

          <Select
            value={filters.genre ?? ''}
            onChange={(value: string) => handleFilterChange('genre', value || undefined)}
            options={genreOptions}
            placeholder="Genre"
            className="w-36"
          />

          <Select
            value={filters.style ?? ''}
            onChange={(value: string) => handleFilterChange('style', value || undefined)}
            options={styleOptions}
            placeholder="Style"
            className="w-36"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
          >
            Reset
          </Button>

          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {totalItems} remixes
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-4">
              <div className="animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Feed Grid */}
      {!isLoading && allItems.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allItems.map((item) => (
              <RemixCard key={item.remix?._id || Math.random().toString()} item={item} />
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                loading={isFetchingNextPage}
                loadingText="Loading..."
              >
                {!isFetchingNextPage && 'Load More'}
              </Button>
            </div>
          )}

          {/* End of feed */}
          {!hasNextPage && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              You have reached the end!
            </p>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && allItems.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-semibold mb-2">No remixes found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your filters or check back later
          </p>
          <Button onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MarketFeed;