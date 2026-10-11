import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import DashboardStats from '../components/dashboard/DashboardStats';
import HistoryTable from '../components/dashboard/HistoryTable';
import MostIdentified from '../components/dashboard/MostIdentified';
import { useAuth } from '../hooks/useAuth';
import { useFruitIdentification } from '../hooks/useFruitIdentification';

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    identificationStats,
    identificationHistory,
    getIdentificationHistory,
    getIdentificationStats,
    deleteIdentification,
  } = useFruitIdentification();

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const historyLimit = tab === 'history' ? 50 : 10;  // PRIMITIVE — safe for deps

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Hold fetchers in a ref. Their identity from the store doesn't matter
  // because the effect never depends on them directly.
  const fetchersRef = useRef({ getIdentificationHistory, getIdentificationStats });
  useEffect(() => {
    fetchersRef.current = { getIdentificationHistory, getIdentificationStats };
  });

  useEffect(() => {
    // Wait for auth to finish restoring before firing anything.
    if (authLoading) return;

    // Logged out — don't spin, just stop.
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [historyResult, statsResult] = await Promise.all([
          fetchersRef.current.getIdentificationHistory({ limit: historyLimit }),
          fetchersRef.current.getIdentificationStats(),
        ]);

        console.log('[Dashboard] history:', historyResult);
        console.log('[Dashboard] stats:', statsResult);

        // Only fail on an explicit failure. Store may return arrays or
        // { success, data } — accept both.
        const historyFailed = historyResult?.success === false;
        const statsFailed = statsResult?.success === false;

        if (historyFailed && statsFailed) {
          throw new Error('Failed to load dashboard data');
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
    // ONLY primitives here. No searchParams, no fetchers, no objects.
  }, [authLoading, isAuthenticated, historyLimit, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const stats = identificationStats || { total: 0, mostIdentified: [] };
  const history = Array.isArray(identificationHistory)
    ? identificationHistory
    : identificationHistory?.items || [];

  // ---- render branches ----

  if (authLoading) {
    return (
      <React.Fragment>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <div className="loader loader-lg mb-6 mx-auto"></div>
            <p className="text-xl">Restoring your session...</p>
          </div>
        </div>
        <Footer />
      </React.Fragment>
    );
  }

  if (!isAuthenticated) {
    return (
      <React.Fragment>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
            <p>You need to be logged in to view your dashboard.</p>
          </div>
        </div>
        <Footer />
      </React.Fragment>
    );
  }

  if (loading) {
    return (
      <React.Fragment>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <div className="loader loader-lg mb-6 mx-auto"></div>
            <p className="text-xl">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </React.Fragment>
    );
  }

  if (error) {
    return (
      <React.Fragment>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
            <p className="mb-8">{error}</p>
            <div className="space-x-3">
              <button onClick={handleRefresh} className="px-6 py-3 bg-emerald-500 text-white rounded-xl">
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-8">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Dashboard</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Welcome back,{' '}
              <span className="font-semibold">
                {user?.name?.split(' ')[0] || 'User'}!
              </span>
            </p>
          </div>

          <div className="flex justify-between items-center mb-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 shadow-xl">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl"
            >
              🔄 Refresh Data
            </button>
            <div className="text-right">
              <p className="text-3xl font-black">{stats.total || 0}</p>
              <p className="text-sm uppercase tracking-wider">Total Identifications</p>
            </div>
          </div>

          <DashboardStats stats={stats} />

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">📜 Recent History</h2>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  {history.length} items
                </span>
              </div>
              <HistoryTable
                history={history}
                onRefresh={handleRefresh}
                onDelete={deleteIdentification}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🏆 Most Identified</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Top 5
                </span>
              </div>
              <MostIdentified fruits={stats.mostIdentified || []} fullSize={true} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
};

export default DashboardPage;