// ============================================
// USER TYPES
// ============================================
export interface User {
  _id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  role: 'listener' | 'creator' | 'remixer' | 'both';
  accountStatus: 'active' | 'suspended' | 'banned' | 'deactivated';
  isVerified: boolean;
  
  creatorProfile?: CreatorProfile;
  remixerProfile?: RemixerProfile;
  traderProfile?: TraderProfile;
  
  earnings: Earnings;
  stats: UserStats;
website?: string; // Add this line
  
  socialLinks?: SocialLinks;
  preferences?: UserPreferences;
  
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProfile {
  level: 'new_creator' | 'rising_creator' | 'viral_creator' | 'top_creator';
  levelProgress: LevelProgress;
  totalTracks: number;
  publishedTracks: number;
  totalRemixesReceived: number;
  totalVolume: number;
  totalEarned: number;
  primaryGenre?: string;
  artistName?: string;
  badges: Badge[];
}

export interface RemixerProfile {
  level: 'beginner' | 'skilled' | 'pro' | 'elite';
  levelProgress: LevelProgress;
  totalRemixes: number;
  publishedRemixes: number;
  totalVolume: number;
  totalEarned: number;
  primaryStyle?: string;
  preferredGenres?: string;
  remixerName?: string;
  badges: Badge[];
}

export interface TraderProfile {
  totalTrades: number;
  totalVolume: number;
  totalPnL: number;
  winRate: number;
  tradingLevel: 'novice' | 'intermediate' | 'advanced' | 'pro' | 'whale';
}

export interface LevelProgress {
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  percentage?: number;
}


export interface Badge {
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Earnings {
  total: number;
  asCreator: number;
  asRemixer: number;
  asTrader: number;
}

export interface UserStats {
  followers: number;
  following: number;
  likesReceived: number;
  totalPlays: number;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  soundcloud?: string;
  spotify?: string;
website?: string;
}

export interface UserPreferences {
  emailNotifications: EmailNotifications;
  privacy: PrivacySettings;
  theme: 'light' | 'dark' | 'system';
}

export interface EmailNotifications {
  newRemix: boolean;
  tradeActivity: boolean;
  earningsUpdate: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'followers_only' | 'private';
  showEarnings: boolean;
}

// ============================================
// TRACK TYPES
// ============================================
export interface Track {
  _id: string;
  title: string;
  description?: string;
  creator: User | string;
  creatorWallet: string;
  audioUrl: string;
  coverImageUrl?: string;
  genre: Genre;
  bpm?: number;
  key?: string;
  duration?: number;
  bagsTokenAddress?: string;
  royaltySplit: RoyaltySplit;
  stats: TrackStats;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type Genre = 'afrobeats' | 'amapiano' | 'drill' | 'hiphop' | 'edm' | 'pop' | 'rnb' | 'other';

export interface RoyaltySplit {
  creator: number;
  remixer: number;
  platform: number;
}

export interface TrackStats {
  totalVolume: number;
  remixCount: number;
  totalEarned: number;
  trendingScore: number;
}

// ============================================
// REMIX TYPES
// ============================================
export interface Remix {
  _id: string;
  title: string;
  description?: string;
  parentTrack: Track | string;
  remixer: User | string;
  remixerWallet: string;
  audioUrl: string;
  bagsTokenAddress?: string;
  tokenSymbol?: string;
  royaltySplit: RoyaltySplit;
  stats: RemixStats;
  style?: RemixStyle;
  tags?: string[];
  aiPrediction?: AIPrediction;
  status: 'pending' | 'active' | 'delisted';
  createdAt: string;
  updatedAt: string;
}

export type RemixStyle = 'night' | 'chill' | 'club' | 'acoustic' | 'instrumental' | 'spedup' | 'slowed';

export interface RemixStats {
  currentPrice: number;
  volume24h: number;
  totalVolume: number;
  holders: number;
  priceChange24h: number;
  trendingScore: number;
}

export interface AIPrediction {
  viralPotential: number;
  suggestedAction: 'BUY' | 'WATCH' | 'PASS';
  reasoning?: string;
  lastUpdated: string;
}

// ============================================
// MARKET TYPES
// ============================================
export interface MarketFeedItem {
  remix: Remix;
  parentTrack: Track;
  remixer: User;
}

export interface MarketFilters {
  genre?: Genre;
  style?: RemixStyle;
  sortBy?: 'trending' | 'new' | 'gainers' | 'volume';
  minPrice?: number;
  maxPrice?: number;
}

export interface PortfolioItem {
  token: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
}

// ============================================
// TRANSACTION TYPES
// ============================================
export interface Transaction {
  _id: string;
  type: 'buy' | 'sell' | 'royalty_payout' | 'platform_fee';
  remix: Remix | string;
  buyer?: User | string;
  buyerWallet?: string;
  seller?: User | string;
  sellerWallet?: string;
  amount: number;
  pricePerToken: number;
  totalValue: number;
  solanaTxSignature?: string;
  bagsTxId?: string;
  feeBreakdown: FeeBreakdown;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

export interface FeeBreakdown {
  creatorFee: number;
  remixerFee: number;
  platformFee: number;
}

// ============================================
// AI TYPES
// ============================================
export interface AISuggestion {
  track: Track;
  reason: string;
  potentialScore: number;
}

export interface TraderInsight {
  remix: Remix;
  insight: string;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================
export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

export type NotificationType = 
  | 'new_follower'
  | 'new_remix'
  | 'remix_milestone'
  | 'trade_executed'
  | 'price_alert'
  | 'earnings_update'
  | 'mention'
  | 'like'
  | 'comment'
  | 'badge_earned'
  | 'level_up'
  | 'security_alert'
  | 'system';

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// AUTH TYPES
// ============================================
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  success: boolean;
  isNewUser?: boolean;
  user: User;
  tokens: AuthTokens;
  sessionId: string;
}

export interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
  referralCode?: string;
}

// ============================================
// FORM TYPES
// ============================================
export interface UploadTrackForm {
  title: string;
  description?: string;
  genre: Genre;
  bpm?: number;
  key?: string;
  tags?: string;
  audio: File;
  coverImage?: File;
}

export interface CreateRemixForm {
  title: string;
  description?: string;
  parentTrackId: string;
  style: RemixStyle;
  tags?: string;
  audio: File;
}

export interface UpdateProfileForm {
  username?: string;
  displayName?: string;
  bio?: string;
  profileImage?: File;
  coverImage?: File;
  socialLinks?: SocialLinks;
  preferences?: Partial<UserPreferences>;
}