'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMusic, 
  FiRepeat, 
  FiDollarSign, 
  FiTrendingUp,
  FiUsers,
  FiPlus,
  FiX,
  FiHome,
  FiSettings,
  FiHelpCircle,
  FiBarChart2,
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/helpers';

interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  badge?: string;
  color?: string;
}

const sidebarNavItems: SidebarNavItem[] = [
  { 
    label: 'Overview', 
    href: '/dashboard', 
    icon: FiHome,
    color: 'text-blue-500'
  },
  { 
    label: 'Creator Hub', 
    href: '/dashboard/creator', 
    icon: FiMusic,
    requiresAuth: true,
    color: 'text-purple-500'
  },
  { 
    label: 'Remixer Studio', 
    href: '/dashboard/remixer', 
    icon: FiRepeat,
    requiresAuth: true,
    color: 'text-orange-500'
  },
  { 
    label: 'Trading Desk', 
    href: '/dashboard/trader', 
    icon: FiDollarSign,
    requiresAuth: true,
    color: 'text-emerald-500'
  },
];

const bottomNavItems: SidebarNavItem[] = [
  { label: 'Settings', href: '/settings', icon: FiSettings },
  { label: 'Help', href: '/help', icon: FiHelpCircle },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        
        {sidebarNavItems.map((item) => {
          if (item.requiresAuth && !isAuthenticated) return null;
          
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary-500/10 text-primary-500 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                isActive 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 dark:bg-dark-300 group-hover:bg-gray-200 dark:group-hover:bg-dark-400'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-8 mb-3">
          Quick Actions
        </p>

        {isAuthenticated && (
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <FiPlus className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Upload Track</span>
          </Link>
        )}

        <Link
          href="/market"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-primary-500/30 text-primary-500 hover:bg-primary-500/10 transition-all duration-200 mt-2"
        >
          <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <FiBarChart2 className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Live Market</span>
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* User Info */}
        {isAuthenticated && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-300 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">My Account</p>
                <p className="text-xs text-gray-500 truncate">View Profile</p>
              </div>
              <Link href="/profile">
                <FiUsers className="w-4 h-4 text-gray-400 hover:text-primary-500 transition-colors" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible */}
      <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-72 bg-white dark:bg-dark-200 border-r border-gray-200 dark:border-gray-700 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-dark-200 z-50 lg:hidden shadow-xl"
          >
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5">
                <FiX className="w-5 h-5" />
              </Button>
            </div>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};