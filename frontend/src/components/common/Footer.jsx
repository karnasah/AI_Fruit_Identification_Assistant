import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Identify Fruit', path: '/identify' },
        { label: 'Encyclopedia', path: '/encyclopedia' },
        { label: 'Chatbot', path: '/chatbot' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Careers', path: '/careers' },
        { label: 'Blog', path: '/blog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', path: '/help' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'FAQ', path: '/faq' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Twitter', path: 'https://twitter.com', external: true },
        { label: 'Facebook', path: 'https://facebook.com', external: true },
        { label: 'Instagram', path: 'https://instagram.com', external: true },
        { label: 'LinkedIn', path: 'https://linkedin.com', external: true },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="text-3xl">🍎</div>
              <span className="text-xl font-bold text-white">FruitAI</span>
            </div>
            <p className="text-sm text-gray-400">
              AI-powered fruit identification assistant helping you identify fruits instantly with high accuracy.
            </p>
            <div className="flex gap-3">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl">⭐</span>
              <span className="text-2xl">⭐</span>
              <span className="text-2xl">⭐</span>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-sm text-gray-400">Rated 4.9/5 by 10,000+ users</p>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-white font-semibold text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-white font-semibold">Subscribe to our newsletter</h3>
              <p className="text-sm text-gray-400">Get updates about new fruits and features</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {currentYear} FruitAI Assistant. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-primary-400 transition-colors">
                Terms
              </Link>
              <Link to="/sitemap" className="hover:text-primary-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;