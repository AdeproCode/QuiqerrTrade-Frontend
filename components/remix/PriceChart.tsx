'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

interface PriceDataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

interface PriceChartProps {
  remixId: string;
  defaultRange?: TimeRange;
  showVolume?: boolean;
  height?: number;
  className?: string;
}

type TimeRange = '1H' | '24H' | '7D' | '30D' | 'ALL';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1H', label: '1H' },
  { value: '24H', label: '24H' },
  { value: '7D', label: '7D' },
  { value: '30D', label: '30D' },
  { value: 'ALL', label: 'ALL' },
];

export const PriceChart: React.FC<PriceChartProps> = ({
  remixId,
  defaultRange = '7D',
  height = 300,
  className,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultRange);
  const [chartType, setChartType] = useState<'price' | 'volume'>('price');

  const { data, isLoading, error } = useQuery({
    queryKey: ['price-chart', remixId, timeRange],
    queryFn: async (): Promise<PriceDataPoint[]> => {
      const response = await apiClient.get<PriceDataPoint[]>(
        `/remixes/${remixId}/price-history?range=${timeRange}`
      );
      return response;
    },
    enabled: !!remixId,
  });

  const formatXAxis = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    
    switch (timeRange) {
      case '1H':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '24H':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7D':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '30D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }, [timeRange]);

  const formatYAxis = useCallback((value: number): string => {
    if (chartType === 'price') {
      return formatCurrency(value, '', 4);
    }
    return formatCurrency(value, '', 0);
  }, [chartType]);

  const formatTooltip = useCallback((value: number, name: string): [string, string] => {
    if (name === 'price') {
      return [formatCurrency(value, 'USDC', 6), 'Price'];
    }
    return [formatCurrency(value, 'USDC', 0), 'Volume'];
  }, []);

  const getChartColor = useCallback((): { stroke: string; fill: string } => {
    if (!data || data.length < 2) {
      return { stroke: '#22c55e', fill: '#22c55e' };
    }
    
    const firstPrice = data[0]?.price ?? 0;
    const lastPrice = data[data.length - 1]?.price ?? 0;
    const isPositive = lastPrice >= firstPrice;
    
    return {
      stroke: isPositive ? '#22c55e' : '#ef4444',
      fill: isPositive ? '#22c55e' : '#ef4444',
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500 dark:text-gray-400">Failed to load chart data</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500 dark:text-gray-400">No price data available</p>
      </div>
    );
  }

  const chartColor = getChartColor();
  const currentPrice = data[data.length - 1]?.price ?? 0;
  const firstPrice = data[0]?.price ?? 0;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercentage = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  const totalVolume = data.reduce((sum, point) => sum + point.volume, 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{formatCurrency(currentPrice, 'USDC', 6)}</p>
          <p className={cn(
            'text-sm font-medium',
            isPositive ? 'text-green-500' : 'text-red-500'
          )}>
            {isPositive ? '+' : ''}{formatCurrency(priceChange, 'USDC', 6)} ({priceChangePercentage.toFixed(2)}%)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">24h Volume</p>
          <p className="font-semibold">{formatCurrency(totalVolume, 'USDC', 0)}</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        
        <div className="flex-1" />
        
        <div className="flex gap-1">
          <Button
            variant={chartType === 'price' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('price')}
          >
            Price
          </Button>
          <Button
            variant={chartType === 'volume' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('volume')}
          >
            Volume
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'price' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor.stroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 11 }}
                className="text-gray-500"
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11 }}
                className="text-gray-500"
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e2a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={formatTooltip}
                labelFormatter={(label: string) => formatDate(label, 'long')}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor.stroke}
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 11 }}
                className="text-gray-500"
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11 }}
                className="text-gray-500"
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e2a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={formatTooltip}
                labelFormatter={(label: string) => formatDate(label, 'long')}
              />
              <Bar
                dataKey="volume"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};