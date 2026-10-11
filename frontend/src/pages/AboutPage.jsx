import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Dr. M Vijaysanthi',
      role: 'Project Lead',
      bio: 'Software Testing, Java, Databases, Algorithms, OOP, Cloud Technologies.',
      image: '👩‍🔬',
      social: { linkedin: '#', twitter: '#' }
    },
    
    {
      name: 'Prof. Sri Divya N',
      role: 'Technical Advisor',
      bio: 'Wireless networking, Deep Learning, Information security',
      image: '👨‍🏫',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Karna_KS',
      role: 'Lead Developer, Backend Developer, AI/ML Integration Engineer',
      bio: 'In a toxic relationship with bugs.🐧',
      image: '👩‍💻',
      social: { linkedin: 'www.linkedin.com/in/karna-sah-b4653a427', github: '#' }
    },
    {
      name: 'K R K Rithvik',
      role: 'Lead Developer, Backend Developer, AI/ML Integration Engineer',
      bio: 'Specializes in Frontend, Backend and model optimization.',
      image: '👨‍🔧',
      social: { linkedin: '#', github: '#' }
    }
  ];

  const milestones = [
    { year: '2026', title: 'Project Launch', description: 'Initial concept and research began' },
    { year: '2026', title: 'Dataset Collection', description: 'Gathered 100,000+ fruit images' },
    { year: '2026', title: 'Model Training', description: 'Achieved 95% accuracy on fruit classification' },
    { year: '2026', title: 'Beta Release', description: 'Launched web application for testing' },
  ];

  const technologies = [
    { name: 'Python', icon: '🐍', description: 'Core programming language' },
    { name: 'TensorFlow', icon: '🧠', description: 'Machine learning framework' },
    { name: 'React', icon: '⚛️', description: 'Frontend framework' },
    { name: 'FastAPI', icon: '🚀', description: 'Backend API' },
    { name: 'PostgreSQL', icon: '🐘', description: 'Database' },
    { name: 'Docker', icon: '🐳', description: 'Containerization' },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-6">🍎</div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                About Fruit AI Assistant
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                We're on a mission to make fruit identification accessible to everyone using cutting-edge artificial intelligence.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  To democratize fruit identification technology and empower farmers, vendors, and consumers 
                  with accurate, real-time fruit recognition capabilities.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We believe that technology should be accessible to everyone. Our AI-powered system helps 
                  reduce manual errors, improve productivity, and provide valuable insights about fruits 
                  to users worldwide.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 text-center"
              >
                <div className="text-5xl mb-4">🎯</div>
                <p className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                  "Making fruit identification simple, fast, and accurate for everyone"
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8"
              >
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">The Problem</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manual fruit identification is time-consuming, error-prone, and requires expertise. 
                  Farmers, vendors, and consumers often struggle to correctly identify fruit varieties, 
                  leading to pricing errors and reduced productivity.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8"
              >
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Solution</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  An AI-powered system that instantly identifies fruits from images with 95% accuracy. 
                  Our solution provides nutritional information, seasonal data, pricing insights, and 
                  farming tips - all in real-time.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Technology Stack
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Built with modern, scalable technologies
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
                >
                  <div className="text-4xl mb-3">{tech.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tech.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tech.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Key milestones in our development
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {milestone.year}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    {milestone.title}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {milestone.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Meet the Team
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The people behind Fruit AI Assistant
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
                >
                  <div className="text-5xl mb-3">{member.image}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">{member.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{member.bio}</p>
                  <div className="flex justify-center gap-3">
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-primary-600">
                      🔗
                    </a>
                    {member.social.twitter && (
                      <a href={member.social.twitter} className="text-gray-400 hover:text-primary-600">
                        🐦
                      </a>
                    )}
                    {member.social.github && (
                      <a href={member.social.github} className="text-gray-400 hover:text-primary-600">
                        💻
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Learn More?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Have questions or want to collaborate? We'd love to hear from you.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
              Contact Us
              <span>→</span>
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default AboutPage;