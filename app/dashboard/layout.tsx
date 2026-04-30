'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { WalletWarning } from '@/components/dashboard/WalletWarning';
import { Button } from '@/components/ui/Button';
import { FiMenu } from 'react-icons/fi';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <div className="sticky top-16 z-20 bg-white/80 dark:bg-dark-200/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="!p-1.5"
            >
              <FiMenu className="w-5 h-5" />
            </Button>
            <span className="font-display font-bold gradient-text text-sm">QuiqerrTrade</span>
            <div className="w-8" />
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {/* ✅ Wallet Warning Banner - Shows when wallet not connected */}
          <WalletWarning />
          
          {children}
        </div>
      </div>
    </div>
  );
}