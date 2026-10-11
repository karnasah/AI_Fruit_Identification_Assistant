import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container-custom max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 404 Illustration */}
            <div className="relative mb-8">
              <div className="text-8xl md:text-9xl font-bold text-primary-200 dark:text-primary-800">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl md:text-7xl">🍎</div>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, 
              or is temporarily unavailable.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="px-8">
                  🏠 Back to Home
                </Button>
              </Link>
              <Link to="/identify">
                <Button variant="outline" size="lg" className="px-8">
                  🍎 Start Identifying
                </Button>
              </Link>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Or try one of these links:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/about" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
                  About Us
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
                  Contact Support
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/help" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
                  Help Center
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/encyclopedia" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
                  Fruit Encyclopedia
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default NotFoundPage;