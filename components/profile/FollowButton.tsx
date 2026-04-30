'use client';

import React, { useState, useCallback } from 'react';
import { FiUserPlus, FiUserCheck, FiLoader } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { FollowResponse } from '@/lib/types/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/helpers';

export interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  onFollowChange?: ((isFollowing: boolean) => void) | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | undefined;
  showCount?: boolean | undefined;
  followerCount?: number | undefined;
  className?: string | undefined;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialIsFollowing,
  onFollowChange,
  size = 'md',
  variant = 'primary',
  showCount = false,
  followerCount,
  className,
}) => {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number | undefined>(followerCount);

  const isOwnProfile = currentUser?._id === userId;

  const handleFollowToggle = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (isOwnProfile) {
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await apiClient.delete(`/users/${userId}/follow`);
        setIsFollowing(false);
        setCount((prev) => prev !== undefined ? prev - 1 : undefined);
        onFollowChange?.(false);
        toast.success('Unfollowed');
      } else {
        // Follow
        const response = await apiClient.post<FollowResponse>(`/users/${userId}/follow`);
        setIsFollowing(true);
        setCount((prev) => prev !== undefined ? prev + 1 : undefined);
        onFollowChange?.(true);
        
        if (response.status === 'pending') {
          toast.success('Follow request sent');
        } else {
          toast.success('Following');
        }
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error(isFollowing ? 'Failed to unfollow' : 'Failed to follow');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isOwnProfile, userId, isFollowing, onFollowChange]);

  // Don't show follow button for own profile
  if (isOwnProfile) {
    return null;
  }

  const getButtonContent = (): React.ReactNode => {
    if (isLoading) {
      return <FiLoader className="animate-spin" />;
    }

    if (isFollowing) {
      return (
        <>
          <FiUserCheck className={cn(size === 'sm' ? 'mr-1' : 'mr-2')} />
          <span>Following</span>
        </>
      );
    }

    return (
      <>
        <FiUserPlus className={cn(size === 'sm' ? 'mr-1' : 'mr-2')} />
        <span>Follow</span>
      </>
    );
  };

  const buttonContent = getButtonContent();

  if (showCount && count !== undefined) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Button
          variant={isFollowing ? 'outline' : variant}
          size={size}
          onClick={handleFollowToggle}
          disabled={isLoading}
          className={cn(
            isFollowing && 'border-green-500 text-green-500 hover:bg-green-500/10'
          )}
        >
          {buttonContent}
        </Button>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          {count.toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={cn(
        isFollowing && 'border-green-500 text-green-500 hover:bg-green-500/10',
        className
      )}
    >
      {buttonContent}
    </Button>
  );
};

// ============================================
// FOLLOW BUTTON WITH COUNT (ALTERNATIVE)
// ============================================

export interface FollowButtonWithCountProps extends Omit<FollowButtonProps, 'showCount' | 'followerCount'> {
  followerCount?: number | undefined;
  countPosition?: 'left' | 'right' | undefined;
}

export const FollowButtonWithCount: React.FC<FollowButtonWithCountProps> = ({
  userId,
  initialIsFollowing,
  onFollowChange,
  size = 'md',
  variant = 'primary',
  followerCount: initialCount = 0,
  countPosition = 'right',
  className,
}) => {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(initialCount);

  const isOwnProfile = currentUser?._id === userId;

  const handleFollowToggle = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (isOwnProfile) {
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        await apiClient.delete(`/users/${userId}/follow`);
        setIsFollowing(false);
        setCount((prev) => prev - 1);
        onFollowChange?.(false);
        toast.success('Unfollowed');
      } else {
        const response = await apiClient.post<FollowResponse>(`/users/${userId}/follow`);
        setIsFollowing(true);
        setCount((prev) => prev + 1);
        onFollowChange?.(true);
        
        if (response.status === 'pending') {
          toast.success('Follow request sent');
        } else {
          toast.success('Following');
        }
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error(isFollowing ? 'Failed to unfollow' : 'Failed to follow');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isOwnProfile, userId, isFollowing, onFollowChange]);

  if (isOwnProfile) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="font-semibold">{count.toLocaleString()}</span>
        <span className="text-gray-500">Followers</span>
      </div>
    );
  }

  const countElement = (
    <span className="font-semibold text-sm">
      {count.toLocaleString()}
    </span>
  );

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {countPosition === 'left' && countElement}
      
      <Button
        variant={isFollowing ? 'outline' : variant}
        size={size}
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={cn(
          'min-w-[90px]',
          isFollowing && 'border-green-500 text-green-500 hover:bg-green-500/10'
        )}
      >
        {isLoading ? (
          <FiLoader className="animate-spin" />
        ) : isFollowing ? (
          <>
            <FiUserCheck className="mr-1" />
            Following
          </>
        ) : (
          <>
            <FiUserPlus className="mr-1" />
            Follow
          </>
        )}
      </Button>
      
      {countPosition === 'right' && countElement}
    </div>
  );
};