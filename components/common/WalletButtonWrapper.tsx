'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';
import { FiLogOut, FiCopy, FiExternalLink, FiDownload } from 'react-icons/fi';
import { formatAddress } from '@/lib/utils/formatters';
import { copyToClipboard } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';


interface PhantomProvider {
  isPhantom?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: unknown) => void) => void;
  publicKey?: { toString: () => string } | null;
}

interface SolflareProvider {
  isSolflare?: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  publicKey?: { toString: () => string } | null;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
    solflare?: SolflareProvider;
  }
}


interface InstalledWallets {
  phantom: boolean;
  solflare: boolean;
}

const detectWallets = (): InstalledWallets => {
  if (typeof window === 'undefined') {
    return { phantom: false, solflare: false };
  }
  
  return {
    phantom: !!window.phantom?.solana?.isPhantom || !!window.phantom?.solana,
    solflare: !!window.solflare?.isSolflare || !!window.solflare,
  };
};


export const WalletButtonWrapper: React.FC = () => {
  const { 
    connected, 
    publicKey, 
    disconnect, 
    connecting,
  } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState<boolean>(false);
  const [installedWallets, setInstalledWallets] = useState<InstalledWallets>({ 
    phantom: false, 
    solflare: false 
  });

  useEffect(() => {
    setMounted(true);
    setInstalledWallets(detectWallets());
  }, []);

  const handleConnect = useCallback(() => {
    const hasAnyWallet = installedWallets.phantom || installedWallets.solflare;
    
    if (!hasAnyWallet) {
      toast.error('No wallet detected. Please install a wallet.');
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    setVisible(true);
  }, [setVisible, installedWallets]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }, [disconnect]);

  const handleCopyAddress = useCallback(async () => {
    if (publicKey) {
      const success = await copyToClipboard(publicKey.toBase58());
      toast.success(success ? 'Address copied!' : 'Failed to copy address');
    }
  }, [publicKey]);

  const handleViewExplorer = useCallback(() => {
    if (publicKey) {
      window.open(`https://solscan.io/account/${publicKey.toBase58()}?cluster=devnet`, '_blank');
    }
  }, [publicKey]);

  const handleInstallWallet = useCallback(() => {
    window.open('https://phantom.app/', '_blank');
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <span className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </Button>
    );
  }

  // Connecting state
  if (connecting) {
    return (
      <Button variant="outline" size="sm" disabled>
        <span className="animate-pulse">Connecting...</span>
      </Button>
    );
  }

  // Connected state
  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAddress}
          className="flex items-center gap-2 rounded-r-none"
          title="Click to copy address"
        >
          <span className="font-mono text-sm">{formatAddress(publicKey.toBase58())}</span>
          <FiCopy className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewExplorer}
          className="rounded-none px-2"
          title="View on Solscan"
        >
          <FiExternalLink className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="rounded-l-none px-2"
          title="Disconnect"
        >
          <FiLogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  // Check if any wallet is installed
  const hasAnyWallet = installedWallets.phantom || installedWallets.solflare;

  // No wallet installed
  if (!hasAnyWallet) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={handleInstallWallet}
        className="flex items-center gap-2"
      >
        <FiDownload className="w-4 h-4" />
        Install Wallet
      </Button>
    );
  }

  // Not connected - show connect button
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleConnect}
    >
      Connect Wallet
    </Button>
  );
};