'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiHelpCircle,
  FiMenu,
  FiX,
  FiTrendingUp,
  FiHome,
  FiMusic,
  FiCompass
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/helpers';
import { formatAddress } from '@/lib/utils/formatters';
import { WalletButtonWrapper } from './WalletButtonWrapper';

// ============================================
// TYPES
// ============================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  highlight?: boolean;
}

// ============================================
// NAVIGATION ITEMS - Added Discover & Trade
// ============================================

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: FiHome },
  { label: 'Discover', href: '/discover', icon: FiCompass },
  { label: 'Market', href: '/market', icon: FiTrendingUp },
  { label: 'Dashboard', href: '/dashboard', icon: FiMusic, requiresAuth: true },
];

// ============================================
// NOTIFICATION DROPDOWN
// ============================================

const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const notifications = [
    { id: '1', title: 'New remix of your track!', time: '5m ago', read: false },
    { id: '2', title: 'Your remix is trending!', time: '1h ago', read: false },
    { id: '3', title: 'Earnings update available', time: '3h ago', read: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-200 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'p-4 hover:bg-gray-50 dark:hover:bg-dark-300 cursor-pointer transition-colors',
              !notification.read && 'bg-primary-500/5'
            )}
            onClick={onClose}
          >
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {notification.time}
            </p>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/notifications"
          className="text-sm text-primary-500 hover:text-primary-600 text-center block"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </motion.div>
  );
};

// ============================================
// PROFILE DROPDOWN
// ============================================

const ProfileDropdown: React.FC<{ onClose: () => void; onLogout: () => void }> = ({ onClose, onLogout }) => {
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-200 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <p className="font-semibold truncate">
          {user?.displayName || user?.username || 'User'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {user?.walletAddress ? formatAddress(user.walletAddress) : ''}
        </p>
      </div>
      <div className="py-2">
        <Link href={`/profile/${user?._id || ''}`} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors" onClick={onClose}>
          <FiUser className="w-4 h-4" /><span>Profile</span>
        </Link>
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors" onClick={onClose}>
          <FiMusic className="w-4 h-4" /><span>Dashboard</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors" onClick={onClose}>
          <FiSettings className="w-4 h-4" /><span>Settings</span>
        </Link>
        <Link href="/help" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors" onClick={onClose}>
          <FiHelpCircle className="w-4 h-4" /><span>Help</span>
        </Link>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
        <button type="button" onClick={() => { onLogout(); onClose(); }}
          className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
          <FiLogOut className="w-4 h-4" /><span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// MOBILE MENU
// ============================================

const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void; onLogout: () => void }> = ({ isOpen, onClose, onLogout }) => {
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-dark-200 z-50 lg:hidden shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <Link href="/" className="flex items-center gap-2" onClick={onClose}>
                  <div className="relative w-8 h-8">
                    <Image src="/logo.png" alt="QuiqerrTrade" fill sizes="32px" className="object-contain" priority />
                  </div>
                  <span className="text-xl font-display font-bold gradient-text">QuiqerrTrade</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={onClose}><FiX className="w-6 h-6" /></Button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                  {navItems.map((item) => {
                    if (item.requiresAuth && !isAuthenticated) return null;
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}
                        className={cn('flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                          isActive ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300',
                          item.highlight && 'border-2 border-primary-500/30')}
                        onClick={onClose}>
                        <Icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                {isAuthenticated && user && (
                  <div className="mt-6 px-4">
                    <div className="p-4 bg-gray-50 dark:bg-dark-300 rounded-xl">
                      <p className="font-semibold">{user.displayName || user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatAddress(user.walletAddress)}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {isAuthenticated ? (
                  <Button variant="danger" fullWidth onClick={() => { onLogout(); onClose(); }}>
                    <FiLogOut className="w-4 h-4 mr-2" />Logout
                  </Button>
                ) : (<WalletButtonWrapper />)}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MAIN HEADER COMPONENT
// ============================================

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = (): void => { setIsScrolled(window.scrollY > 10); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback((): void => { logout(); router.push('/'); }, [logout, router]);
  const handleNotificationClick = useCallback((): void => { setShowNotifications((prev) => !prev); setShowProfile(false); }, []);
  const handleProfileClick = useCallback((): void => { setShowProfile((prev) => !prev); setShowNotifications(false); }, []);

  return (
    <>
      <header className={cn('fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled ? 'bg-white/95 dark:bg-dark-200/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm'
        : 'bg-white dark:bg-dark-200 border-b border-transparent')}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-8 h-8 lg:w-9 lg:h-9">
                <Image src="/logo.png" alt="QuiqerrTrade" fill sizes="(max-width: 768px) 32px, 36px" className="object-contain" priority />
              </div>
              <span className="text-lg lg:text-xl font-display font-bold gradient-text hidden sm:block">QuiqerrTrade</span>
            </Link>

            {/* Desktop Navigation - No Search Bar */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {navItems.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm',
                      isActive ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300',
                      item.highlight && !isActive && 'border border-primary-500/30 text-primary-500')}>
                    <Icon className="w-4 h-4" /><span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto lg:ml-4">
              {mounted && isAuthenticated && (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <Button variant="ghost" size="sm" onClick={handleNotificationClick} className="!p-2">
                      <FiBell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>
                    <AnimatePresence>
                      {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
                    </AnimatePresence>
                  </div>

                  {/* Profile Avatar */}
                  <div className="relative">
                    <Button variant="ghost" size="sm" onClick={handleProfileClick} className="!p-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {useAuthStore.getState().user?.displayName?.[0] || useAuthStore.getState().user?.username?.[0] || 'U'}
                      </div>
                    </Button>
                    <AnimatePresence>
                      {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} onLogout={handleLogout} />}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Wallet / Logout Button */}
              <div className="hidden lg:block ml-2">
                {mounted && !isAuthenticated && <WalletButtonWrapper />}
                {mounted && isAuthenticated && (
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="!p-2">
                    <FiLogOut className="w-4 h-4" />
                  </Button>
                )}
                {!mounted && (
                  <Button variant="outline" size="sm" disabled>
                    <span className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </Button>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <Button variant="ghost" size="sm" className="lg:hidden !p-2" onClick={() => setIsMobileMenuOpen(true)}>
                <FiMenu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onLogout={handleLogout} />
    </>
  );
};

export default Header;