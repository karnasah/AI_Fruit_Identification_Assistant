import { useStore } from '../store';
import authService from '../services/authService';

/**
 * Custom hook for authentication
 * Provides access to auth state and methods
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    updateUserProfile: storeUpdateProfile,
    changePassword: storeChangePassword,
    forgotPassword: storeForgotPassword,
    resetPassword: storeResetPassword,
    clearAuthError,
  } = useStore();

  const login = async (email, password) => {
    return await storeLogin({ email, password }, authService);
  };

  const register = async (userData) => {
    return await storeRegister(userData, authService);
  };

  const logout = async () => {
    return await storeLogout(authService);
  };

  const updateUserProfile = async (userData) => {
    return await storeUpdateProfile(userData, authService);
  };

  const changePassword = async (passwords) => {
    return await storeChangePassword(passwords, authService);
  };

  const forgotPassword = async (email) => {
    return await storeForgotPassword(email, authService);
  };

  const resetPassword = async (token, newPassword) => {
    return await storeResetPassword(token, newPassword, authService);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearAuthError,
  };
};

export default useAuth;