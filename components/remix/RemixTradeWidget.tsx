'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { FiTrendingUp, FiTrendingDown, FiInfo, FiLoader } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Remix } from '@/lib/types';
import apiClient from '@/lib/api/client';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export interface RemixTradeWidgetProps {
  remix: Remix;
  defaultAction?: 'buy' | 'sell' | undefined;
  compact?: boolean | undefined;
  onTradeComplete?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
  className?: string | undefined;
}

export const RemixTradeWidget: React.FC<RemixTradeWidgetProps> = ({
  remix,
  defaultAction = 'buy',
  compact = true,
  onTradeComplete,
  onCancel,
  className,
}) => {
  const { connected, publicKey } = useWallet();
  const [action, setAction] = useState<'buy' | 'sell'>(defaultAction);
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [slippage, setSlippage] = useState<number>(1);

  const priceChange = remix.stats.priceChange24h;
  const isPriceUp = priceChange >= 0;

  // Use React Query for balance fetching - avoids effect cascading
  const { data: balanceData } = useQuery({
    queryKey: ['balance', remix._id, publicKey?.toString()],
    queryFn: async (): Promise<number> => {
      if (!connected || !publicKey) {
        return 0;
      }

      try {
        const response = await apiClient.get<{ balance: number }>(
          `/market/balance/${remix._id}`
        );
        return response.balance;
      } catch {
        return 0;
      }
    },
    enabled: !!connected && !!publicKey && !!remix._id,
    staleTime: 30000, // Consider balance stale after 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
    refetchOnWindowFocus: false,
  });

  const balance = balanceData ?? 0;

  // Calculate estimated cost with useMemo - no state needed
  const estimatedCost = useMemo((): number => {
    const amountNum = parseFloat(amount) || 0;
    if (action === 'buy') {
      const baseCost = amountNum * remix.stats.currentPrice;
      const slippageCost = baseCost * (slippage / 100);
      return baseCost + slippageCost;
    }
    return amountNum * remix.stats.currentPrice;
  }, [amount, action, remix.stats.currentPrice, slippage]);

  const handleAmountChange = useCallback((value: string): void => {
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  const handlePercentageClick = useCallback((percentage: number): void => {
    if (action === 'buy') {
      // For buy, use a default max based on typical trade size
      const maxAmount = 1000;
      setAmount((maxAmount * percentage / 100).toFixed(2));
    } else {
      const sellAmount = balance * percentage / 100;
      setAmount(sellAmount.toFixed(2));
    }
  }, [action, balance]);

  const handleMaxClick = useCallback((): void => {
    if (action === 'sell') {
      setAmount(balance.toFixed(2));
    } else {
      setAmount('100');
    }
  }, [action, balance]);

  const handleTrade = useCallback(async (): Promise<void> => {
    const amountNum = parseFloat(amount);
    
    if (!connected) {
      toast.error('Please connect your wallet to trade');
      return;
    }

    if (!amount || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (action === 'sell' && amountNum > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = action === 'buy' ? '/market/buy' : '/market/sell';
      
      await apiClient.post(endpoint, {
        remixId: remix._id,
        amount: amountNum,
        slippage,
      });

      toast.success(`${action === 'buy' ? 'Purchase' : 'Sale'} completed successfully!`);
      setAmount('');
      onTradeComplete?.();
    } catch (error) {
      console.error('Trade error:', error);
      toast.error(`Failed to ${action} tokens. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [connected, amount, action, remix._id, balance, slippage, onTradeComplete]);

  const isValidAmount = useMemo((): boolean => {
    const amountNum = parseFloat(amount);
    return amountNum > 0 && (action === 'buy' || amountNum <= balance);
  }, [amount, action, balance]);

  if (compact) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-4">
          {/* Price Info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-xl font-bold">
                {formatCurrency(remix.stats.currentPrice, 'USDC', 6)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">24h Change</p>
              <p className={cn(
                'font-semibold',
                isPriceUp ? 'text-green-500' : 'text-red-500'
              )}>
                {formatPercentage(priceChange, 2)}
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={action === 'buy' ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => setAction('buy')}
            >
              Buy
            </Button>
            <Button
              variant={action === 'sell' ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => setAction('sell')}
            >
              Sell
            </Button>
          </div>

          {/* Amount Input */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-500">Amount</label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs text-primary-500 hover:text-primary-600"
              >
                {action === 'sell' ? `Max: ${formatNumber(balance, true)}` : 'Max'}
              </button>
            </div>
            <Input
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              rightIcon={<span className="text-sm text-gray-500">{remix.tokenSymbol || 'RMX'}</span>}
            />
          </div>

          {/* Quick Percentage Buttons */}
          <div className="flex gap-1 mb-3">
            {[25, 50, 75, 100].map((pct) => (
              <Button
                key={pct}
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => handlePercentageClick(pct)}
              >
                {pct}%
              </Button>
            ))}
          </div>

          {/* Estimated Cost */}
          {amount && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-300 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estimated {action === 'buy' ? 'Cost' : 'Proceeds'}</span>
                <span className="font-semibold">
                  {formatCurrency(estimatedCost, 'USDC', 2)}
                </span>
              </div>
              {action === 'buy' && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-500">Slippage ({slippage}%)</span>
                  <span className="text-gray-500">
                    {formatCurrency(estimatedCost - (parseFloat(amount) * remix.stats.currentPrice), 'USDC', 2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button
            variant={action === 'buy' ? 'success' : 'danger'}
            fullWidth
            onClick={handleTrade}
            disabled={!isValidAmount || isLoading}
            loading={isLoading}
          >
            {!isLoading && (action === 'buy' ? 'Buy' : 'Sell')} {remix.tokenSymbol || 'RMX'}
          </Button>

          {/* Balance Display */}
          {connected && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Balance: {formatNumber(balance, true)} {remix.tokenSymbol || 'RMX'}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full widget (for modal)
  return (
    <div className={cn('space-y-4', className)}>
      {/* Price Summary */}
      <div className="bg-gray-50 dark:bg-dark-300 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Price</p>
            <p className="text-2xl font-bold">
              {formatCurrency(remix.stats.currentPrice, 'USDC', 6)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">24h Change</p>
            <p className={cn(
              'text-xl font-semibold',
              isPriceUp ? 'text-green-500' : 'text-red-500'
            )}>
              {isPriceUp ? <FiTrendingUp className="inline mr-1" /> : <FiTrendingDown className="inline mr-1" />}
              {formatPercentage(priceChange, 2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">24h Volume</p>
            <p className="font-semibold">{formatCurrency(remix.stats.volume24h, 'USDC', 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Your Balance</p>
            <p className="font-semibold">{formatNumber(balance, true)} {remix.tokenSymbol || 'RMX'}</p>
          </div>
        </div>
      </div>

      {/* Trade Form */}
      <Card>
        <CardHeader title={action === 'buy' ? 'Buy Tokens' : 'Sell Tokens'} />
        <CardContent className="space-y-4">
          {/* Action Selector */}
          <div className="flex gap-2">
            <Button
              variant={action === 'buy' ? 'primary' : 'outline'}
              fullWidth
              onClick={() => setAction('buy')}
            >
              Buy
            </Button>
            <Button
              variant={action === 'sell' ? 'primary' : 'outline'}
              fullWidth
              onClick={() => setAction('sell')}
            >
              Sell
            </Button>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium">Amount</label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                {action === 'sell' ? `Max: ${formatNumber(balance, true)}` : 'Max'}
              </button>
            </div>
            <Input
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              rightIcon={<span>{remix.tokenSymbol || 'RMX'}</span>}
            />
          </div>

          {/* Quick Amounts */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <Button
                key={pct}
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => handlePercentageClick(pct)}
              >
                {pct}%
              </Button>
            ))}
          </div>

          {/* Slippage Setting */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {[0.5, 1, 2].map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSlippage(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {/* Trade Summary */}
          {amount && (
            <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Rate</span>
                <span>1 {remix.tokenSymbol || 'RMX'} = {formatCurrency(remix.stats.currentPrice, 'USDC', 6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{action === 'buy' ? 'You Pay' : 'You Receive'}</span>
                <span className="font-semibold">{formatCurrency(estimatedCost, 'USDC', 2)}</span>
              </div>
              {action === 'buy' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Slippage ({slippage}%)</span>
                  <span className="text-gray-500">
                    {formatCurrency(estimatedCost - (parseFloat(amount) * remix.stats.currentPrice), 'USDC', 2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Warning for insufficient balance */}
          {action === 'sell' && parseFloat(amount) > balance && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400">
              <FiInfo className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">Insufficient balance. You only have {formatNumber(balance, true)} tokens.</p>
            </div>
          )}

          {/* Wallet not connected warning */}
          {!connected && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400">
              <FiInfo className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">Please connect your wallet to trade.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex gap-2 w-full">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              variant={action === 'buy' ? 'success' : 'danger'}
              fullWidth
              onClick={handleTrade}
              disabled={!isValidAmount || !connected || isLoading}
              loading={isLoading}
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `${action === 'buy' ? 'Buy' : 'Sell'} ${remix.tokenSymbol || 'RMX'}`
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};