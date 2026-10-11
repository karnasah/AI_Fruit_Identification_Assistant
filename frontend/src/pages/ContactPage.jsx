import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useStore } from '../store';

const ContactPage = () => {
  const { showToast } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      details: 'support@fruitai.com',
      description: 'Send us an email anytime',
    },
    {
      icon: '📞',
      title: 'Phone',
      details: '+97 00000000',
      description: 'Mon-Fri, 9am-6pm EST',
    },
    {
      icon: '📍',
      title: 'Address',
      details: '132 IT Park, AECS LAYOUT, 560037',
      description: 'INDIA',
    },
  ];

  const faqs = [
    {
      question: 'How accurate is the fruit identification?',
      answer: 'Our AI model achieves over 95% accuracy on common fruits and continues to improve with user feedback.',
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Yes, we take privacy seriously. Your images are encrypted and never shared with third parties.',
    },
    {
      question: 'Can I use this for commercial purposes?',
      answer: 'Yes, we offer commercial licenses for businesses. Contact our sales team for more information.',
    },
    {
      question: 'What fruits can the system identify?',
      answer: 'Our system can identify over 100 different fruit types including exotic and regional varieties.',
    },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Have questions, feedback, or partnership inquiries? We'd love to hear from you.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form - Left Column */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Send us a message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ram"
                      error={errors.name}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@gmail.com"
                      error={errors.email}
                      required
                    />
                  </div>

                  <Input
                    label="Subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    error={errors.subject}
                    required
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.message
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Please describe your question or feedback in detail..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="mt-6"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </motion.div>
            </div>

            {/* Contact Info - Right Column */}
            <div className="space-y-6">
              {/* Contact Cards */}
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{info.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
                        {info.details}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Connect with us
                </h3>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                    📘
                  </a>
                  <a href="#" className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                    🐦
                  </a>
                  <a href="#" className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                    📷
                  </a>
                  <a href="#" className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                    💼
                  </a>
                </div>
              </motion.div>

              {/* Office Hours */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monday - Friday</span>
                    <span className="text-gray-800 dark:text-gray-200">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                    <span className="text-gray-800 dark:text-gray-200">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                    <span className="text-gray-800 dark:text-gray-200">Closed</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8"
            >
              Frequently Asked Questions
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Response Time Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ⏰ We typically respond within 24 hours on business days.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;