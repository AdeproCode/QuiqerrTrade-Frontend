import { User, AuthTokens, Remix, Notification } from './index';

// ============================================
// AUTH STORE
// ============================================

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: { user: User; tokens: AuthTokens }) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

// ============================================
// AUDIO STORE
// ============================================

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string;
  type: 'track' | 'remix';
}

export interface AudioState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  sound: Howl | null;
  queue: AudioTrack[];
  setTrack: (track: AudioTrack | null) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: AudioTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

// ============================================
// UI STORE
// ============================================

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  isMobileMenuOpen: boolean;
  activeModal: ModalType | null;
  modalData: Record<string, unknown> | null;
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: UIState['theme']) => void;
  toggleMobileMenu: () => void;
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export type ModalType = 
  | 'upload-track'
  | 'create-remix'
  | 'trade'
  | 'wallet-connect'
  | 'edit-profile'
  | 'confirm-delete'
  | null;

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ============================================
// MARKET STORE
// ============================================

export interface MarketFilters {
  genre?: string | undefined;
  style?: string | undefined;
  sortBy: 'trending' | 'new' | 'gainers' | 'volume';
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
}

export interface MarketState {
  filters: MarketFilters;
  selectedRemix: Remix | null;
  watchlist: string[];
  setFilters: (filters: Partial<MarketFilters>) => void;
  resetFilters: () => void;
  setSelectedRemix: (remix: Remix | null) => void;
  addToWatchlist: (remixId: string) => void;
  removeFromWatchlist: (remixId: string) => void;
  isInWatchlist: (remixId: string) => boolean;
}

// ============================================
// NOTIFICATION STORE
// ============================================

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  setLoading: (loading: boolean) => void;
}