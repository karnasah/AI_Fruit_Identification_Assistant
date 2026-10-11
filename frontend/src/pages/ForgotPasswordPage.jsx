import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading } = useAuth();
  const { showToast } = useStore();
  
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
      showToast('Password reset link sent to your email!', 'success');
    } else {
      showToast(result.error || 'Failed to send reset link. Please try again.', 'error');
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container-custom max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card p-8 shadow-xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
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
                  className="mt-6"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-400">
                    ✉️ We've sent a password reset link to:
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
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                ← Back to Login
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Need help?{' '}
                <Link to="/contact" className="text-primary-600 hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ForgotPasswordPage;