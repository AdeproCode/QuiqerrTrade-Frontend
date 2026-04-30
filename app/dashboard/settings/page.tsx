'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiBell, 
  FiGlobe,
  FiMoon,
  FiSun,
  FiMonitor,
  FiSave,
  FiLogOut,
  FiTrash2,
  FiAlertTriangle,
  FiYoutube,
  FiInstagram,
  FiTwitter
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/helpers';
import { User } from '@/lib/types';

// ============================================
// TABS CONFIGURATION
// ============================================

interface SettingsTab {
  value: string;
  label: string;
  icon: React.ElementType;
}

const settingsTabs: SettingsTab[] = [
  { value: 'profile', label: 'Profile', icon: FiUser },
  { value: 'account', label: 'Account', icon: FiMail },
  { value: 'notifications', label: 'Notifications', icon: FiBell },
  { value: 'appearance', label: 'Appearance', icon: FiGlobe },
  { value: 'security', label: 'Security', icon: FiLock },
];

// ============================================
// FORM SCHEMAS
// ============================================

const profileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// ============================================
// MAIN COMPONENT
// ============================================

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      website: user?.socialLinks?.website || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || '',
      youtube: user?.socialLinks?.youtube || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const onProfileSubmit = async (data: ProfileFormData): Promise<void> => {
    setIsSaving(true);
    try {
      const response = await apiClient.patch<{ user: User }>('/users/me', data);
      updateUser(response.user);
      resetProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData): Promise<void> => {
    try {
      await apiClient.patch('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleLogout = useCallback((): void => {
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  }, [logout, router]);

  const handleDeleteAccount = useCallback(async (): Promise<void> => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await apiClient.delete('/users/me', {
        data: { confirmation: 'DELETE' },
      });
      logout();
      router.push('/');
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  }, [deleteConfirmation, logout, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {settingsTabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
                          activeTab === tab.value
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-dark-300'
                        )}
                      >
                        {TabIcon && <TabIcon className="w-5 h-5" />}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader title="Profile Settings" subtitle="Update your public profile information" />
                <CardContent>
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <Input
                      label="Username"
                      placeholder="johndoe"
                      error={profileErrors.username?.message}
                      {...registerProfile('username')}
                    />
                    <Input
                      label="Display Name"
                      placeholder="John Doe"
                      error={profileErrors.displayName?.message}
                      {...registerProfile('displayName')}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <textarea
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        {...registerProfile('bio')}
                      />
                      {profileErrors.bio && (
                        <p className="mt-1 text-sm text-red-500">{profileErrors.bio.message}</p>
                      )}
                    </div>
                    <Input
                      label="Website"
                      placeholder="https://yourwebsite.com"
                      error={profileErrors.website?.message}
                      {...registerProfile('website')}
                    />
                    
                    <div className="pt-4">
                      <h4 className="font-semibold mb-3">Social Links</h4>
                      <div className="space-y-3">
                        <Input
                          label="Twitter"
                          placeholder="@username"
                          leftIcon={<FiTwitter />}
                          error={profileErrors.twitter?.message}
                          {...registerProfile('twitter')}
                        />
                        <Input
                          label="Instagram"
                          placeholder="@username"
                          leftIcon={<FiInstagram />}
                          error={profileErrors.instagram?.message}
                          {...registerProfile('instagram')}
                        />
                        <Input
                          label="YouTube"
                          placeholder="Channel URL"
                          leftIcon={<FiYoutube />}
                          error={profileErrors.youtube?.message}
                          {...registerProfile('youtube')}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isSaving}
                        disabled={!isProfileDirty}
                      >
                        <FiSave className="mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'account' && (
              <Card>
                <CardHeader title="Account Settings" subtitle="Manage your email and account preferences" />
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Email Address</h4>
                    <div className="flex items-center gap-3">
                      <Input
                        value={user.email || 'No email set'}
                        disabled
                        className="flex-1"
                      />
                      <Button variant="outline">Change</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Wallet Address</h4>
                    <Input
                      value={user.walletAddress}
                      disabled
                      className="font-mono"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-red-500 mb-3">Danger Zone</h4>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white"
                        onClick={handleLogout}
                      >
                        <FiLogOut className="mr-2" />
                        Logout from all devices
                      </Button>
                      <Button
                        variant="outline"
                        className="!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <FiTrash2 className="mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader title="Security Settings" subtitle="Change your password and security preferences" />
                <CardContent>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      error={passwordErrors.currentPassword?.message}
                      {...registerPassword('currentPassword')}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      error={passwordErrors.newPassword?.message}
                      {...registerPassword('newPassword')}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      error={passwordErrors.confirmPassword?.message}
                      {...registerPassword('confirmPassword')}
                    />
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isPasswordSubmitting}
                      >
                        Change Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader title="Notification Preferences" subtitle="Choose what notifications you receive" />
                <CardContent>
                  <div className="space-y-4">
                    <NotificationToggle
                      label="New Remixes"
                      description="When someone remixes your track"
                      defaultChecked
                    />
                    <NotificationToggle
                      label="Trade Activity"
                      description="When your remixes are bought or sold"
                      defaultChecked
                    />
                    <NotificationToggle
                      label="Earnings Updates"
                      description="Weekly summary of your earnings"
                      defaultChecked
                    />
                    <NotificationToggle
                      label="Marketing Emails"
                      description="News and updates about QuiqerrTrade"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardHeader title="Appearance Settings" subtitle="Customize your visual experience" />
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        <ThemeOption icon={FiSun} label="Light" value="light" />
                        <ThemeOption icon={FiMoon} label="Dark" value="dark" />
                        <ThemeOption icon={FiMonitor} label="System" value="system" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal - FIXED: Using native input instead of Input component */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl">
            <FiAlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Please type <strong>DELETE</strong> to confirm.
          </p>
          {/* Use native input for simple cases where react-hook-form isn't needed */}
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-4 py-3 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// NOTIFICATION TOGGLE COMPONENT
// ============================================

interface NotificationToggleProps {
  label: string;
  description: string;
  defaultChecked?: boolean;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  description,
  defaultChecked = false,
}) => {
  const [checked, setChecked] = useState<boolean>(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
        )}
        aria-label={label}
        aria-pressed={checked}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked && 'translate-x-6'
          )}
        />
      </button>
    </div>
  );
};

// ============================================
// THEME OPTION COMPONENT
// ============================================

interface ThemeOptionProps {
  icon: React.ElementType;
  label: string;
  value: 'light' | 'dark' | 'system';
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ icon: Icon, label, value }) => {
  const [selected, setSelected] = useState<string>('system');

  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
        selected === value
          ? 'border-primary-500 bg-primary-500/5'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      )}
      aria-label={`${label} theme`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};