'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLogIn,
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WalletButtonWrapper } from '@/components/common/WalletButtonWrapper';
import apiClient from '@/lib/api/client';
import { LoginResponse } from '@/lib/types/api';
import { LoginFormData } from '@/lib/types/forms';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ============================================
// FORM SCHEMA
// ============================================

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// ============================================
// MAIN COMPONENT
// ============================================

export default function LoginPage() {
  const router = useRouter();
  const { login: loginStore, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit = useCallback(async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });

      loginStore({
        user: response.user,
        tokens: response.tokens,
      });

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }, [loginStore, router]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="QuiqerrTrade"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                QuiqerrTrade
              </span>
            </Link>
            <h1 className="text-3xl font-display font-bold mt-6 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Wallet Login Option */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-center text-gray-500 dark:text-gray-400 mb-3">
                  Quick login with wallet
                </label>
                <div className="flex justify-center">
                  <WalletButtonWrapper />
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white dark:bg-dark-200 text-gray-500">
                      or continue with email
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<FiMail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    leftIcon={<FiLock className="w-4 h-4" />}
                    rightIcon={showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      {...register('rememberMe')}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  loadingText="Signing in..."
                  className="mt-6"
                >
                  {!isLoading && (
                    <>
                      Sign In
                      <FiLogIn className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Create account
                  <FiArrowRight className="inline ml-1 w-3 h-3" />
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Back to Home */}
          <p className="text-center mt-6">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-primary-500 transition-colors"
            >
              ← Back to Home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}