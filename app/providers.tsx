'use client';

import { FC, ReactNode, useMemo, useEffect } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';

import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

// ✅ Inner component that handles auth hydration
const AuthHydrator: FC<{ children: ReactNode }> = ({ children }) => {
  const { tokens } = useAuthStore();

  useEffect(() => {
    // On mount, restore tokens to the API client
    if (tokens?.accessToken && tokens?.refreshToken) {
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
      console.log('✅ Auth tokens restored to API client');
    } else {
      // Try loading from localStorage directly
      apiClient.loadTokens();
      if (apiClient.isAuthenticated()) {
        console.log('✅ Auth tokens loaded from localStorage');
      }
    }
  }, []); // Only run once on mount

  return <>{children}</>;
};

export const Providers: FC<ProvidersProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  
  const endpoint = useMemo(() => {
    return process.env['NEXT_PUBLIC_API_URL'] || clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <AuthHydrator>
                {children}
              </AuthHydrator>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;