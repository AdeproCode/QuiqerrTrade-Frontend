import { Genre, RemixStyle } from './index';

// ============================================
// UPLOAD TRACK FORM
// ============================================

export interface UploadTrackFormData {
  title: string;
  description?: string | undefined;
  genre: Genre;
  bpm?: number | undefined;
  key?: string | undefined;
  tags?: string | undefined;
  audio: File;
  coverImage?: File | undefined;
}

// ============================================
// CREATE REMIX FORM
// ============================================

export interface CreateRemixFormData {
  title: string;
  description?: string | undefined;
  parentTrackId: string;
  style: RemixStyle;
  tags?: string | undefined;
  audio: File;
}

// ============================================
// UPDATE PROFILE FORM
// ============================================

export interface UpdateProfileFormData {
  username?: string | undefined;
  displayName?: string | undefined;
  bio?: string | undefined;
  profileImage?: File | undefined;
  coverImage?: File | undefined;
  website?: string | undefined;
  socialLinks?: {
    twitter?: string | undefined;
    instagram?: string | undefined;
    tiktok?: string | undefined;
    youtube?: string | undefined;
    soundcloud?: string | undefined;
    spotify?: string | undefined;
  } | undefined;
}

// ============================================
// TRADE FORM
// ============================================

export interface TradeFormData {
  remixId: string;
  amount: number;
  action: 'buy' | 'sell';
  slippage?: number | undefined;
}

// ============================================
// LOGIN FORM
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean | undefined;
}

// ============================================
// REGISTER FORM
// ============================================

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  agreeToTerms?: boolean | undefined;
}

// ============================================
// FORGOT PASSWORD FORM
// ============================================

export interface ForgotPasswordFormData {
  email: string;
}

// ============================================
// RESET PASSWORD FORM
// ============================================

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

// ============================================
// CHANGE PASSWORD FORM
// ============================================

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// SEARCH FORM
// ============================================

export interface SearchFormData {
  query: string;
  genre?: Genre | undefined;
  style?: RemixStyle | undefined;
  sortBy?: 'trending' | 'new' | 'gainers' | 'volume' | undefined;
}

// ============================================
// CONTACT FORM
// ============================================

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ============================================
// NEWSLETTER FORM
// ============================================

export interface NewsletterFormData {
  email: string;
}

// ============================================
// WALLET AUTH FORM (For signature)
// ============================================

export interface WalletAuthFormData {
  walletAddress: string;
  signature: string;
  message: string;
}