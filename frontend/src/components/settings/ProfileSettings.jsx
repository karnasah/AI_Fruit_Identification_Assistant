import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';
import Input from '../common/Input';

const ProfileSettings = () => {
  const { user, updateUserProfile, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    occupation: '',
    website: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        occupation: user.occupation || '',
        website: user.website || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.website && !/^https?:\/\//.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Avatar image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }
    
    const result = await updateUserProfile(formDataToSend);
    
    if (result.success) {
      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      showError(result.error || 'Failed to update profile');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>👤</span> Profile Information
        </h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Avatar Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-4xl overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{formData.name?.charAt(0) || '👤'}</span>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary-600">
                <span>📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            error={errors.name}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            error={errors.email}
            required
          />
          
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="+1 234 567 8900"
            error={errors.phone}
          />
          
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="City, Country"
          />
          
          <Input
            label="Occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="e.g., Farmer, Vendor, Student"
          />
          
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="https://example.com"
            error={errors.website}
          />
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              placeholder="Tell us a little about yourself..."
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        )}
      </form>

      {/* Account Stats */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">--</p>
            <p className="text-xs text-gray-500">Identifications</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">--</p>
            <p className="text-xs text-gray-500">Favorites</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">--</p>
            <p className="text-xs text-gray-500">Days Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">--</p>
            <p className="text-xs text-gray-500">Current Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;