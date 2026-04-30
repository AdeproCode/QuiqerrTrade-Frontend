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
  FiUser,
  FiUserPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WalletButtonWrapper } from '@/components/common/WalletButtonWrapper';
import apiClient from '@/lib/api/client';
import { RegisterResponse } from '@/lib/types/api';
import { RegisterFormData } from '@/lib/types/forms';
import { cn } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ============================================
// FORM SCHEMA
// ============================================

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  firstName: z.string().max(50, 'First name must be at most 50 characters').optional(),
  lastName: z.string().max(50, 'Last name must be at most 50 characters').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: 'Enter a password', color: 'bg-gray-300' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength();

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', strength.color)}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{strength.label}</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function RegisterPage() {
  const router = useRouter();
  const { login: loginStore, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

const onSubmit = useCallback(async (data: RegisterFormData): Promise<void> => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
    });

    // Check if response has the expected structure
    if (response.success && response.user && response.tokens) {
      loginStore({
        user: response.user,
        tokens: response.tokens,
      });

      setIsSuccess(true);
      toast.success('Account created successfully!');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    // Extract error message from response if available
    const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error 
      || 'Registration failed. This email or username may already be in use.';
    
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
}, [loginStore, router]);
    

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your account has been successfully created. Redirecting you to the dashboard...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500 mx-auto" />
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join the future of music creation and trading
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-center text-gray-500 dark:text-gray-400 mb-3">
                  Quick signup with wallet
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
                      or sign up with email
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Username"
                  type="text"
                  placeholder="johndoe"
                  leftIcon={<FiUser className="w-4 h-4" />}
                  error={errors.username?.message}
                  {...register('username')}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<FiMail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>

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
                  <PasswordStrength password={password || ''} />
                </div>

                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<FiLock className="w-4 h-4" />}
                  rightIcon={showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      {...register('agreeToTerms')}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary-500 hover:text-primary-600">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-500 hover:text-primary-600">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  loadingText="Creating account..."
                  className="mt-6"
                >
                  {!isLoading && (
                    <>
                      Create Account
                      <FiUserPlus className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign in
                  <FiArrowRight className="inline ml-1 w-3 h-3" />
                </Link>
              </p>
            </CardFooter>
          </Card>

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