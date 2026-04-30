import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, dots, and underscores');

export const walletAddressSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana wallet address');

export const trackTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(100, 'Title must be at most 100 characters');

export const remixTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(100, 'Title must be at most 100 characters');

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validateUsername = (username: string): boolean => {
  return usernameSchema.safeParse(username).success;
};

export const validateWalletAddress = (address: string): boolean => {
  return walletAddressSchema.safeParse(address).success;
};