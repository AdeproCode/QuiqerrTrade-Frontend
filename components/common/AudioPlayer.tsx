'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FiPlay, 
  FiPause, 
  FiSkipBack, 
  FiSkipForward, 
  FiVolume2,
  FiVolumeX,
  FiRepeat,
  FiShuffle,
  FiHeart,
  FiMoreVertical
} from 'react-icons/fi';
import { useAudioStore } from '@/lib/store/audioStore';
import { formatTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

interface AudioPlayerProps {
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ className }) => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    queue,
    toggle,
    seek,
    setVolume,
    playNext,
    playPrevious,
    clearQueue,
  } = useAudioStore();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !duration) return;
      
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      seek(percentage);
    },
    [duration, seek]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
    },
    [setVolume]
  );

  const handleVolumeIconClick = useCallback(() => {
    setShowVolumeSlider((prev) => !prev);
    
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 3000);
  }, []);

  const handleToggleMute = useCallback(() => {
    setVolume(volume > 0 ? 0 : 0.8);
  }, [volume, setVolume]);

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  if (!currentTrack) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700 shadow-2xl',
        isExpanded ? 'h-96' : 'h-20',
        'transition-all duration-300',
        className
      )}
    >
      <div className="h-full max-w-7xl mx-auto px-4">
        <div className="flex items-center h-20">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-80">
            {currentTrack.coverImage ? (
              <Image
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">
                  {currentTrack.type === 'track' ? '🎵' : '🔁'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{currentTrack.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {currentTrack.artist}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={cn(isLiked && 'text-red-500')}
            >
              <FiHeart className={cn('w-5 h-5', isLiked && 'fill-current')} />
            </Button>
          </div>

          {/* Playback Controls */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" disabled={queue.length === 0}>
                <FiShuffle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={playPrevious}
                disabled={queue.length === 0}
              >
                <FiSkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={toggle}
                className="!p-3 rounded-full"
              >
                {isPlaying ? (
                  <FiPause className="w-5 h-5" />
                ) : (
                  <FiPlay className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={playNext}
                disabled={queue.length === 0}
              >
                <FiSkipForward className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <FiRepeat className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                {formatTime(progress * duration)}
              </span>
              <div
                ref={progressBarRef}
                className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Extra Controls */}
          <div className="w-80 flex items-center justify-end gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVolumeIconClick}
              >
                {volume === 0 ? (
                  <FiVolumeX className="w-5 h-5" />
                ) : (
                  <FiVolume2 className="w-5 h-5" />
                )}
              </Button>
              
              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white dark:bg-dark-200 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleMute}
                      className="mt-2 w-full"
                    >
                      {volume === 0 ? 'Unmute' : 'Mute'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <FiMoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Expanded Queue View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between p-4">
                <h3 className="font-semibold">Queue ({queue.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearQueue}
                  disabled={queue.length === 0}
                >
                  Clear
                </Button>
              </div>
              {queue.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No tracks in queue
                </p>
              ) : (
                <div className="space-y-2 px-4 pb-4">
                  {queue.map((track, index) => (
                    <div
                      key={`${track.id}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300"
                    >
                      <span className="text-sm text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-gray-500">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Button component (inline for this file)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };

  return (
    <button
      className={cn(
        'rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default AudioPlayer;