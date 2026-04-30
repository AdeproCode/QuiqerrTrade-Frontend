'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuthStore } from '@/lib/store/authStore';
import { FiAlertTriangle, FiDownload, FiMusic, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { WalletButtonWrapper } from '@/components/common/WalletButtonWrapper';

export const WalletWarning: React.FC = () => {
  const { connected } = useWallet();
  const { user } = useAuthStore();

  // Only show if user is authenticated but wallet not connected
  if (!user || connected) return null;

  return (
    <Card className="bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-2 border-yellow-200/50 dark:border-yellow-800/50 mb-6 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              Connect Your Solana Wallet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              To trade tokens, upload tracks, and earn royalties, connect your Solana wallet.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FiMusic className="w-3.5 h-3.5 text-purple-500" />
                Upload Tracks
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FiTrendingUp className="w-3.5 h-3.5 text-green-500" />
                Trade Tokens
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FiDollarSign className="w-3.5 h-3.5 text-blue-500" />
                Earn Royalties
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <WalletButtonWrapper />
              <button
                onClick={() => window.open('https://phantom.app/', '_blank')}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-500 transition-colors"
              >
                <FiDownload className="w-3.5 h-3.5" />
                Get Phantom
              </button>
              <button
                onClick={() => window.open('https://solflare.com/', '_blank')}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-500 transition-colors"
              >
                <FiDownload className="w-3.5 h-3.5" />
                Get Solflare
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};