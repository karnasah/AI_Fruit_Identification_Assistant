import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';

const HomePage = () => {
  const { isAuthenticated, user } = useStore();

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const features = [
    {
      icon: '🍎',
      title: 'Instant Fruit Recognition',
      description: 'Upload a photo or use live camera to identify any fruit in seconds with high accuracy.',
    },
    {
      icon: '📊',
      title: 'Nutritional Information',
      description: 'Get detailed nutritional facts, health benefits, and storage tips for every fruit.',
    },
    {
      icon: '🤖',
      title: 'AI Chatbot Assistant',
      description: 'Ask questions about fruits, get recipe suggestions, and farming tips from our intelligent chatbot.',
    },
    {
      icon: '🎤',
      title: 'Voice Control',
      description: 'Hands-free operation with voice commands and speech output for accessibility.',
    },
    {
      icon: '📈',
      title: 'Identification History',
      description: 'Track all your identifications, view statistics, and save favorite fruits.',
    },
    {
      icon: '📚',
      title: 'Fruit Encyclopedia',
      description: 'Browse through our comprehensive database of fruits with detailed information.',
    },
  ];

  const stats = [
    { value: '2+', label: 'Fruit Types', icon: '🍍' },
    { value: '95%', label: 'Accuracy Rate', icon: '🎯' },
    { value: 'Growing', label: 'Active Users', icon: '👥' },
    { value: '<2s', label: 'Response Time', icon: '⚡' },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Upload or Capture',
      description: 'Take a photo with your camera or upload an image from your gallery.',
      icon: '📸',
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our machine learning model analyzes the image in real-time.',
      icon: '🧠',
    },
    {
      step: '03',
      title: 'Instant Results',
      description: 'Get fruit name, confidence score, and detailed information.',
      icon: '✨',
    },
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-primary-500/[0.02] bg-[size:50px_50px] pointer-events-none" />
        
        <div className="container-custom relative z-10 py-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-6"
            >
              <span className="text-lg">🍎</span>
              <span className="text-sm font-medium">AI-Powered Fruit Identification</span>
            </motion.div>
            
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            >
              Identify Fruit
              <br />
              Instantly with AI
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Upload a photo or use your camera to identify fruits in seconds. Get nutritional information, 
              recipes, and farming tips powered by advanced Machine learning.
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={isAuthenticated ? '/identify' : '/register'}>
                <Button size="lg" className="px-8 py-4 text-lg">
                  🍎 Start Identifying
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  Learn More
                </Button>
              </Link>
            </motion.div>
            
            {/* Stats Section */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to identify any fruit
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-sm text-primary-500 font-semibold mb-2">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need for intelligent fruit identification
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Identify Fruits?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using our AI-powered fruit identification system.
          </p>
          <Link to={isAuthenticated ? '/identify' : '/register'}>
            <Button variant="white" size="lg" className="px-8 py-4 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default HomePage;