import React, { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useThemeContext as useTheme } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/common/Loader';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const IdentificationPage = lazy(() => import('./pages/IdentificationPage'));
const AIExpertPage = lazy(() => import('./pages/AIExpertPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EncyclopediaPage = lazy(() => import('./pages/EncyclopediaPage'));
const ChatbotPage = lazy(() => import('./pages/ChatbotPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function App() {
  const { theme } = useTheme();

  return (
    <>
      <Helmet>
        <title>AI Fruit Identification Assistant</title>
        <meta name="description" content="AI-powered fruit identification system using computer vision and deep learning" />
        <meta name="keywords" content="fruit identification, AI, machine learning, computer vision, fruit recognition" />
        <meta name="author" content="Your Team Name" />
        <meta property="og:title" content="AI Fruit Identification Assistant" />
        <meta property="og:description" content="Instantly identify fruits using AI technology" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Suspense fallback={<Loader fullScreen />}>
          <AppRoutes />
        </Suspense>
      </div>
    </>
  );
}

export default App;
