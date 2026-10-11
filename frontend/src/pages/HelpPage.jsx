import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'identification', name: 'Fruit Identification', icon: '🍎' },
    { id: 'account', name: 'Account & Profile', icon: '👤' },
    { id: 'features', name: 'Features', icon: '✨' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with Fruit AI Assistant?',
      answer: 'Getting started is easy! Simply create a free account, then navigate to the Identify page to upload or capture fruit images. Our AI will instantly identify the fruit and provide detailed information.',
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'Is there a mobile app available?',
      answer: 'Yes! Our web app is fully responsive and works on mobile devices. You can also install it as a Progressive Web App (PWA) on your phone for a native app experience.',
    },
    {
      id: 3,
      category: 'identification',
      question: 'How accurate is the fruit identification?',
      answer: 'Our AI model achieves over 95% accuracy on common fruits. The accuracy may vary for rare or exotic fruits, but we continuously improve our model with new data.',
    },
    {
      id: 4,
      category: 'identification',
      question: 'What fruits can the system identify?',
      answer: 'Our system can identify over 100 different fruit types including apples, bananas, oranges, mangoes, berries, tropical fruits, and many more.',
    },
    {
      id: 5,
      category: 'identification',
      question: 'Can I identify multiple fruits in one image?',
      answer: 'Yes! Our advanced detection model can identify multiple fruits in a single image. Each fruit will be highlighted with a bounding box and labeled.',
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the instructions to create a new password.',
    },
    {
      id: 7,
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account from the Profile page. Go to Settings > Profile and click on "Delete Account" in the danger zone section.',
    },
    {
      id: 8,
      category: 'features',
      question: 'What is the chatbot assistant?',
      answer: 'Our AI chatbot can answer questions about fruits, provide nutritional information, suggest recipes, and help with farming tips. It\'s available 24/7 on the Chatbot page.',
    },
    {
      id: 9,
      category: 'features',
      question: 'Can I use voice commands?',
      answer: 'Yes! Our app supports voice input for search and voice output for identification results. Enable voice features in Settings > Voice.',
    },
    {
      id: 10,
      category: 'troubleshooting',
      question: 'Why is my image not being identified?',
      answer: 'Make sure the image is clear, well-lit, and shows the fruit clearly. Avoid blurry images or images with multiple objects. For best results, place the fruit against a plain background.',
    },
    {
      id: 11,
      category: 'troubleshooting',
      question: 'The app is slow. What should I do?',
      answer: 'Try clearing your browser cache, using a different browser, or checking your internet connection. You can also enable offline mode in Settings for faster performance.',
    },
    {
      id: 12,
      category: 'troubleshooting',
      question: 'How do I report a bug?',
      answer: 'Please contact our support team through the Contact page with details about the issue, including screenshots if possible. We\'ll investigate and fix it promptly.',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const videoTutorials = [
    { title: 'How to Identify a Fruit', duration: '2:30', icon: '🍎' },
    { title: 'Using Live Camera Mode', duration: '1:45', icon: '📷' },
    { title: 'Understanding Nutrition Info', duration: '3:15', icon: '📊' },
    { title: 'Chatbot Tips & Tricks', duration: '2:00', icon: '🤖' },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Help Center
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Find answers to common questions and learn how to make the most of Fruit AI Assistant
            </motion.p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 text-lg border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                🔍
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Video Tutorials Section */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📹</span> Video Tutorials
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {videoTutorials.map((video, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-2">{video.icon}</div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-500">{video.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>❓</span> Frequently Asked Questions
            </h2>
            
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-3 text-primary-500 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-soft"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      <span className={`text-gray-400 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-5 pb-5 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="mt-12 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Still need help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Contact Support
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default HelpPage;