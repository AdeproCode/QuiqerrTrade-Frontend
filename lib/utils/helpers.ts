import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateRandomId = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const getLevelColor = (
  level: string
): { bg: string; text: string; border: string } => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    new_creator: { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' },
    rising_creator: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
    viral_creator: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
    top_creator: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
    beginner: { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' },
    skilled: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
    pro: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
    elite: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
  };
  
  return colors[level] || { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' };
};

export const getRarityColor = (
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
): string => {
  const colors: Record<typeof rarity, string> = {
    common: 'text-gray-500 border-gray-500',
    rare: 'text-blue-500 border-blue-500',
    epic: 'text-purple-500 border-purple-500',
    legendary: 'text-yellow-500 border-yellow-500',
  };
  
  return colors[rarity];
};