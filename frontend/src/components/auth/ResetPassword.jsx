import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';
import Input from '../common/Input';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      showError('Invalid reset link. Please request a new one.');
      setTimeout(() => navigate('/forgot-password'), 2000);
    }
  }, [token, navigate, showError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await resetPassword(token, formData.password);

    if (result.success) {
      setIsSubmitted(true);
      showSuccess('Password reset successfully! Please login with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      showError(result.error || 'Failed to reset password. Please try again.');
    }
  };

  if (!isTokenValid) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Password
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {!isSubmitted 
              ? "Please enter your new password below"
              : "Password reset successful!"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              icon="🔒"
              error={errors.password}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              icon="🔐"
              error={errors.confirmPassword}
              required
            />

            {/* Password Requirements */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password must contain:
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <li className={formData.password.length >= 6 ? 'text-green-500' : ''}>
                  {formData.password.length >= 6 ? '✓' : '○'} At least 6 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-500' : ''}>
                  {/[A-Z]/.test(formData.password) ? '✓' : '○'} At least one uppercase letter
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-500' : ''}>
                  {/[0-9]/.test(formData.password) ? '✓' : '○'} At least one number
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-700 dark:text-green-400 font-medium">
                Password reset successful!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Redirecting you to login page...
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        )}

        {/* Back to Login */}
        {!isSubmitted && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              ← Back to Login
            </Link>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Having trouble?{' '}
            <Link to="/contact" className="text-primary-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;