import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';
import Input from '../common/Input';

const ForgotPassword = () => {
  const { forgotPassword, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await forgotPassword(email);

    if (result.success) {
      setIsSubmitted(true);
      showSuccess('Password reset link sent to your email!');
    } else {
      showError(result.error || 'Failed to send reset link. Please try again.');
    }
  };

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
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot Password?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {!isSubmitted 
              ? "Enter your email address and we'll send you a reset link"
              : "Check your email for the reset link"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              icon="📧"
              error={error}
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">✉️</div>
              <p className="text-green-700 dark:text-green-400 font-medium">
                Reset link sent to:
              </p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {email}
              </p>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ← Back to Login
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Need help?{' '}
            <Link to="/contact" className="text-primary-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;