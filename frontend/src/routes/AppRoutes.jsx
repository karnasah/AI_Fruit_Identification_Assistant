import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('../pages/HomePage'));
const IdentificationPage = React.lazy(() => import('../pages/IdentificationPage'));
const AIExpertPage = React.lazy(() => import('../pages/AIExpertPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const EncyclopediaPage = React.lazy(() => import('../pages/EncyclopediaPage'));
const ChatbotPage = React.lazy(() => import('../pages/ChatbotPage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const HelpPage = React.lazy(() => import('../pages/HelpPage'));
const AdminPage = React.lazy(() => import('../pages/AdminPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../pages/ResetPasswordPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Anyone can access */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpPage />} />
      
      {/* Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      {/* Protected Routes - Require Authentication */}
      <Route element={<PrivateRoute />}>
        <Route path="/identify" element={<IdentificationPage />} />
        <Route path="/ai-expert" element={<AIExpertPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/encyclopedia" element={<EncyclopediaPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Admin Routes - Require Admin Role */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Route>
      
      {/* 404 Not Found - Catch all unmatched routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;