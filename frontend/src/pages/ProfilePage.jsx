import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ProfilePage = () => {
  const { user, updateUserProfile, changePassword, isLoading } = useAuth();
  const { showToast } = useStore();

  const [activeTab, setActiveTab] = useState('profile'); // profile, password, preferences
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    bio: '',
    location: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    fontSize: 'medium',
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    autoSave: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'general',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!profileForm.name) newErrors.name = 'Name is required';
    if (!profileForm.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileForm.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    const result = await updateUserProfile(profileForm);
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } else {
      showToast(result.error || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (result.success) {
      showToast('Password changed successfully!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      showToast(result.error || 'Failed to change password', 'error');
    }
  };

  const handleSavePreferences = async () => {
    // Save preferences to backend
    showToast('Preferences saved successfully!', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'password', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              My Profile
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Manage your account settings and preferences
            </motion.p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-soft">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-5xl shadow-lg">
                {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                📷
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile}>
                <div className="grid md:grid-cols-2 gap-5">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    placeholder="+1 234 567 8900"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Type
                    </label>
                    <input
                      type="text"
                      value={profileForm.role === 'farmer' ? '🌾 Farmer' : profileForm.role === 'vendor' ? '🏪 Vendor' : '👤 General User'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Location"
                      type="text"
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" isLoading={isLoading}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      ✏️ Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword}>
                <div className="space-y-5">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    error={errors.currentPassword}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    error={errors.newPassword}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    error={errors.confirmPassword}
                    required
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="submit" isLoading={isLoading}>
                    Change Password
                  </Button>
                </div>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <div className="space-y-6">
                  {/* Language Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <div className="flex gap-3">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handlePreferenceChange('fontSize', size)}
                          className={`px-4 py-2 rounded-lg capitalize ${
                            preferences.fontSize === size
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-600 dark:text-gray-400">Push Notifications</span>
                        <input
                          type="checkbox"
                          checked={preferences.notifications}
                          onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-600 dark:text-gray-400">Email Updates</span>
                        <input
                          type="checkbox"
                          checked={preferences.emailUpdates}
                          onChange={(e) => handlePreferenceChange('emailUpdates', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-600 dark:text-gray-400">Auto-save Identifications</span>
                        <input
                          type="checkbox"
                          checked={preferences.autoSave}
                          onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Danger Zone */}
          <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
              ⚠️ Danger Zone
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              Once you delete your account, all your data will be permanently removed.
            </p>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProfilePage;