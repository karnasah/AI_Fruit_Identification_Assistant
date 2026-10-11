import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';
import Input from '../common/Input';

const AccountSettings = () => {
  const { user, changePassword, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter and one number';
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    
    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    
    if (result.success) {
      showSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      showError(result.error || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      showError('Account deletion is not available in demo mode');
      setShowDeleteConfirm(false);
    }, 1500);
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* Change Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>🔒</span> Change Password
        </h2>
        
        <form onSubmit={handleSubmitPassword} className="space-y-4">
          <Input
            label="Current Password"
            type={showPasswords.current ? 'text' : 'password'}
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
            icon="🔐"
            error={errors.currentPassword}
            required
            rightElement={
              <button
                type="button"
                onClick={() => toggleShowPassword('current')}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? '🙈' : '👁️'}
              </button>
            }
          />
          
          <Input
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            icon="🔒"
            error={errors.newPassword}
            required
            rightElement={
              <button
                type="button"
                onClick={() => toggleShowPassword('new')}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? '🙈' : '👁️'}
              </button>
            }
          />
          
          <Input
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            icon="🔐"
            error={errors.confirmPassword}
            required
            rightElement={
              <button
                type="button"
                onClick={() => toggleShowPassword('confirm')}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? '🙈' : '👁️'}
              </button>
            }
          />
          
          {/* Password Requirements */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password requirements:
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <li className={passwordForm.newPassword.length >= 6 ? 'text-green-500' : ''}>
                {passwordForm.newPassword.length >= 6 ? '✓' : '○'} At least 6 characters
              </li>
              <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-500' : ''}>
                {/[A-Z]/.test(passwordForm.newPassword) ? '✓' : '○'} At least one uppercase letter
              </li>
              <li className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-500' : ''}>
                {/[0-9]/.test(passwordForm.newPassword) ? '✓' : '○'} At least one number
              </li>
            </ul>
          </div>
          
          <Button type="submit" isLoading={isLoading}>
            Update Password
          </Button>
        </form>
      </div>

      {/* Session Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>🌐</span> Active Sessions
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💻</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                <p className="text-xs text-gray-500">Chrome on Windows • Current device</p>
              </div>
            </div>
            <span className="text-xs text-green-500">Active now</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Mobile Device</p>
                <p className="text-xs text-gray-500">Safari on iPhone • Last active 2 days ago</p>
              </div>
            </div>
            <button className="text-sm text-red-500 hover:text-red-600">
              Revoke
            </button>
          </div>
        </div>
        
        <button className="mt-4 text-sm text-primary-500 hover:text-primary-600">
          Log out all other sessions
        </button>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
          <span>⚠️</span> Danger Zone
        </h2>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          Once you delete your account, all your data will be permanently removed. This action cannot be undone.
        </p>
        
        {!showDeleteConfirm ? (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600 dark:text-red-300">
              Are you absolutely sure? This will permanently delete your account and all associated data.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDeleteAccount} isLoading={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;