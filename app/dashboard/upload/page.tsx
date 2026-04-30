'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { 
  FiUpload,  
  FiImage, 
  FiInfo,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { cn } from '@/lib/utils/helpers';
import apiClient from '@/lib/api/client';
import { Genre, Track } from '@/lib/types';
import toast from 'react-hot-toast';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  genre: z.enum(['afrobeats', 'amapiano', 'drill', 'hiphop', 'edm', 'pop', 'rnb', 'other']),
  bpm: z.number().min(1).max(300).optional(),
  key: z.string().max(5).optional(),
  tags: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const genreOptions: SelectOption[] = [
  { value: 'afrobeats', label: 'Afrobeats' },
  { value: 'amapiano', label: 'Amapiano' },
  { value: 'drill', label: 'Drill' },
  { value: 'hiphop', label: 'Hip Hop' },
  { value: 'edm', label: 'EDM' },
  { value: 'pop', label: 'Pop' },
  { value: 'rnb', label: 'R&B' },
  { value: 'other', label: 'Other' },
];

const keyOptions: SelectOption[] = [
  { value: '', label: 'None' },
  { value: 'C', label: 'C Major' },
  { value: 'Cm', label: 'C Minor' },
  { value: 'C#', label: 'C# Major' },
  { value: 'C#m', label: 'C# Minor' },
  { value: 'D', label: 'D Major' },
  { value: 'Dm', label: 'D Minor' },
  { value: 'D#', label: 'D# Major' },
  { value: 'D#m', label: 'D# Minor' },
  { value: 'E', label: 'E Major' },
  { value: 'Em', label: 'E Minor' },
  { value: 'F', label: 'F Major' },
  { value: 'Fm', label: 'F Minor' },
  { value: 'F#', label: 'F# Major' },
  { value: 'F#m', label: 'F# Minor' },
  { value: 'G', label: 'G Major' },
  { value: 'Gm', label: 'G Minor' },
  { value: 'G#', label: 'G# Major' },
  { value: 'G#m', label: 'G# Minor' },
  { value: 'A', label: 'A Major' },
  { value: 'Am', label: 'A Minor' },
  { value: 'A#', label: 'A# Major' },
  { value: 'A#m', label: 'A# Minor' },
  { value: 'B', label: 'B Major' },
  { value: 'Bm', label: 'B Minor' },
];

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStep, setUploadStep] = useState<'form' | 'uploading' | 'success'>('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      genre: 'afrobeats',
      key: '',
    },
  });

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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

  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

const onSubmit = async (data: UploadFormData): Promise<void> => {
  if (!audioFile) {
    toast.error('Please select an audio file');
    return;
  }

  setIsUploading(true);
  setUploadStep('uploading');

  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  formData.append('genre', data.genre);
  if (data.bpm) formData.append('bpm', data.bpm.toString());
  if (data.key) formData.append('key', data.key);
  if (data.tags) formData.append('tags', data.tags);
  formData.append('audio', audioFile);
  if (coverImage) formData.append('coverImage', coverImage);

  try {
    // Make sure we're sending the auth token
    const token = localStorage.getItem('accessToken');
    
    const response = await apiClient.upload<{ success: boolean; track: Track; bagsTx: string }>(
      '/tracks',
      formData
    );

    setUploadStep('success');
    toast.success('Track uploaded successfully!');

    setTimeout(() => {
      router.push(`/track/${response.track._id}`);
    }, 2000);
  } catch (error) {
    console.error('Upload error:', error);
    
    // Better error handling
    const axiosError = error as { response?: { data?: { error?: string } } };
    const errorMessage = axiosError.response?.data?.error || 'Failed to upload track. Please try again.';
    
    toast.error(errorMessage);
    setUploadStep('form');
  } finally {
    setIsUploading(false);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Upload Track</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Share your original music and start earning royalties
          </p>
        </motion.div>

        {uploadStep === 'success' ? (
          <SuccessCard />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Audio Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Audio File <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                      audioFile
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                    )}
                    onClick={() => document.getElementById('audio-input')?.click()}
                  >
                    <input
                      id="audio-input"
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
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-1">
                          MP3, WAV, or FLAC (max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <Input
                  label="Title"
                  placeholder="Enter track title"
                  error={errors.title?.message ?? undefined}
                  {...register('title')}
                />

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your track..."
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

                {/* Genre & BPM */}
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="genre"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Genre"
                        options={genreOptions}
                        value={field.value}
                        onChange={(value: string) => field.onChange(value as Genre)}
                        error={errors.genre?.message ?? undefined}
                      />
                    )}
                  />
                  <Input
                    label="BPM (optional)"
                    type="number"
                    placeholder="120"
                    error={errors.bpm?.message ?? undefined}
                    {...register('bpm', { valueAsNumber: true })}
                  />
                </div>

                {/* Key & Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="key"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Key (optional)"
                        options={keyOptions}
                        value={field.value ?? ''}
                        onChange={(value: string) => field.onChange(value || undefined)}
                        error={errors.key?.message ?? undefined}
                      />
                    )}
                  />
                  <Input
                    label="Tags (comma separated)"
                    placeholder="chill, summer, vibes"
                    error={errors.tags?.message ?? undefined}
                    {...register('tags')}
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cover Image (optional)
                  </label>
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative',
                        coverPreview
                          ? 'border-green-500'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                      )}
                      onClick={() => document.getElementById('cover-input')?.click()}
                    >
                      <input
                        id="cover-input"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverSelect}
                        className="hidden"
                      />
                      {coverPreview ? (
                        <Image
                          src={coverPreview}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                          unoptimized={coverPreview.startsWith('data:')}
                        />
                      ) : (
                        <FiImage className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Recommended: 1000x1000px, JPG or PNG (max 5MB)
                      </p>
                      {coverImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCoverImage(null);
                            setCoverPreview('');
                          }}
                          className="mt-2"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Royalty Info */}
                <div className="bg-primary-500/5 rounded-xl p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FiInfo className="w-4 h-4" />
                    Royalty Split
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary-500">50%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Creator</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent-500">45%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Remixer</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-500">5%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Platform</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    You earn 50% of all trading fees from remixes of this track
                  </p>
                </div>
              </CardContent>

              <CardFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between w-full">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isUploading}
                    loadingText="Uploading..."
                    disabled={!audioFile || isUploading}
                  >
                    {!isUploading && 'Upload Track'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUCCESS CARD
// ============================================

const SuccessCard: React.FC = () => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="p-12 text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Track Uploaded!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your track has been successfully uploaded and tokenized on Bags.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button variant="primary" onClick={() => router.push('/upload')}>
            Upload Another
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};