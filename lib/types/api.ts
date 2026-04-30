import { 
  User, 
  Track, 
  Remix, 
  Transaction, 
  MarketFeedItem,
  PortfolioItem,
  AISuggestion,
  TraderInsight,
  Notification 
} from './index';

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string | undefined;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string | undefined;
  statusCode?: number | undefined;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ============================================
// AUTH RESPONSES
// ============================================

export interface NonceResponse {
  message: string;
  nonce: string;
}

export interface WalletAuthResponse {
  success: boolean;
  isNewUser: boolean;
  user: User;
  tokens: AuthTokens;
  sessionId: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  user: User;
  tokens: AuthTokens;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: string;
}

// ============================================
// TRACK RESPONSES
// ============================================

export interface CreateTrackResponse {
  success: boolean;
  track: Track;
  bagsTx: string;
}

// Use type alias instead of empty interface
export type GetTracksResponse = PaginatedResponse<Track>;

export interface GetTrackResponse {
  track: Track;
  remixes: Remix[];
}

// ============================================
// REMIX RESPONSES
// ============================================

export interface CreateRemixResponse {
  success: boolean;
  remix: Remix;
  bagsTx: string;
  aiPrediction?: {
    viralPotential: number;
    suggestedAction: 'BUY' | 'WATCH' | 'PASS';
  } | undefined;
}

// Use type alias instead of empty interface
export type GetMarketFeedResponse = PaginatedResponse<MarketFeedItem>;

export interface GetRemixResponse {
  remix: Remix;
  traderInsight?: string | undefined;
}

// ============================================
// MARKET RESPONSES
// ============================================

export interface BuyTokensResponse {
  success: boolean;
  transaction: Transaction;
  txSignature: string;
}

export interface GetPortfolioResponse {
  portfolio: PortfolioItem[];
  earnings: {
    total: number;
    asCreator: number;
    asRemixer: number;
    asTrader: number;
  };
  transactions: Transaction[];
}

// ============================================
// USER RESPONSES
// ============================================

export interface GetUserResponse {
  user: User;
  tracks: Track[];
  remixes: Remix[];
  isFollowing: boolean;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: User;
}

export interface GetCreatorStatsResponse {
  overview: {
    totalTracks: number;
    publishedTracks: number;
    totalRemixesReceived: number;
    totalVolume: number;
    totalEarned: number;
    primaryGenre: string;
  };
  recentTransactions: Transaction[];
  topTracks: Track[];
  monthlyStats: MonthlyStat[];
  level: User['creatorProfile'];
}

export interface GetRemixerStatsResponse {
  overview: {
    totalRemixes: number;
    publishedRemixes: number;
    totalVolume: number;
    totalEarned: number;
    averageROI: number;
  };
  recentTransactions: Transaction[];
  topRemixes: Remix[];
  styleBreakdown: StyleBreakdown[];
  level: User['remixerProfile'];
}

export interface MonthlyStat {
  _id: string;
  volume: number;
  trades: number;
}

export interface StyleBreakdown {
  _id: string;
  count: number;
  totalVolume: number;
}

// ============================================
// SOCIAL RESPONSES
// ============================================

export interface FollowResponse {
  success: boolean;
  status: 'accepted' | 'pending';
}

// Use type aliases instead of empty interfaces
export type GetFollowersResponse = PaginatedResponse<User>;
export type GetFollowingResponse = PaginatedResponse<User>;

// ============================================
// AI RESPONSES
// ============================================

export interface GetAISuggestionsResponse {
  suggestions: AISuggestion[];
}

export interface GetTraderInsightResponse {
  insight: TraderInsight;
}

// ============================================
// NOTIFICATION RESPONSES
// ============================================

// Use type alias instead of empty interface
export type GetNotificationsResponse = PaginatedResponse<Notification>;

export interface MarkAsReadResponse {
  success: boolean;
  modifiedCount: number;
}

// ============================================
// ADDITIONAL RESPONSE TYPES
// ============================================

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string | undefined;
  statusCode: number;
  stack?: string | undefined;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface UploadUrlResponse {
  success: boolean;
  uploadUrl: string;
  fileKey: string;
}