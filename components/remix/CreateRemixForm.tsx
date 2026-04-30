'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiUpload, FiMusic, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Track } from '@/lib/types';
import apiClient from '@/lib/api/client';
import { CreateRemixResponse } from '@/lib/types/api';
import { cn } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

const remixSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  style: z.enum(['night', 'chill', 'club', 'acoustic', 'instrumental', 'spedup', 'slowed']),
  tags: z.string().optional(),
});

type RemixFormData = z.infer<typeof remixSchema>;

const styleOptions: SelectOption[] = [
  { value: 'night', label: 'Night Version' },
  { value: 'chill', label: 'Chill' },
  { value: 'club', label: 'Club' },
  { value: 'acoustic', label: 'Acoustic' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'spedup', label: 'Sped Up' },
  { value: 'slowed', label: 'Slowed' },
];

export interface CreateRemixFormProps {
  track: Track;
  onSuccess?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
  className?: string | undefined;
}

export const CreateRemixForm: React.FC<CreateRemixFormProps> = ({
  track,
  onSuccess,
  onCancel,
  className,
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RemixFormData>({
    resolver: zodResolver(remixSchema),
    defaultValues: {
      style: 'chill',
    },
  });

  const selectedStyle = watch('style');

  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select a valid audio file');
        return;
      }
      setAudioFile(file);
    }
  }, []);

  const onSubmit = async (data: RemixFormData): Promise<void> => {
    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('style', data.style);
    if (data.tags) formData.append('tags', data.tags);
    formData.append('parentTrackId', track._id);
    formData.append('audio', audioFile);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiClient.upload<CreateRemixResponse>('/remixes', formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Remix created successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to create remix. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Original Track Info */}
      <Card className="bg-gray-50 dark:bg-dark-300">
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">Remixing</p>
          <p className="font-semibold text-lg">{track.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {track.genre} • {track.bpm ? `${track.bpm} BPM` : ''} {track.key ? `• ${track.key}` : ''}
          </p>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Audio Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Audio File <span className="text-red-500">*</span>
          </label>
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
              audioFile
                ? 'border-green-500 bg-green-500/5'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
            )}
            onClick={() => document.getElementById('remix-audio-input')?.click()}
          >
            <input
              id="remix-audio-input"
              type="file"
              accept="audio/*"
              onChange={handleAudioSelect}
              className="hidden"
            />
            {audioFile ? (
              <div className="flex items-center justify-center gap-3">
                <FiCheckCircle className="w-8 h-8 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">{audioFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <FiUpload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="font-medium">Click to upload your remix</p>
                <p className="text-sm text-gray-500 mt-1">
                  MP3, WAV, or FLAC (max 50MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Remix Title"
          placeholder="Enter remix title"
          error={errors.title?.message ?? undefined}
          {...register('title')}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description (optional)</label>
          <textarea
            placeholder="Describe your remix..."
            rows={3}
            className={cn(
              'w-full px-4 py-3 bg-white dark:bg-dark-200 border rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'resize-none',
              errors.description
                ? 'border-red-500'
                : 'border-gray-200 dark:border-gray-700'
            )}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Style & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Remix Style"
            options={styleOptions}
            value={selectedStyle}
            onChange={(value: string) => setValue('style', value as RemixFormData['style'])}
            error={errors.style?.message ?? undefined}
          />
          <Input
            label="Tags (comma separated)"
            placeholder="chill, summer, vibes"
            error={errors.tags?.message ?? undefined}
            {...register('tags')}
          />
        </div>

        {/* Royalty Info */}
        <div className="bg-primary-500/5 rounded-xl p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <FiInfo className="w-4 h-4" />
            Royalty Split
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-500">45%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Creator</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-500">45%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">You (Remixer)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">10%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            You earn 45% of all trading fees from this remix
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isUploading || isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={isUploading || isSubmitting}
            loadingText="Creating..."
            disabled={!audioFile || isUploading || isSubmitting}
          >
            {!isUploading && !isSubmitting && (
              <>
                <FiMusic className="mr-2" />
                Create Remix
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};