import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';

const SystemHealth = () => {
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  const [systemStatus, setSystemStatus] = useState({
    api: { status: 'operational', responseTime: 124, uptime: '99.98%' },
    database: { status: 'connected', connections: 24, queryTime: 45 },
    redis: { status: 'connected', memory: '124 MB', hits: 8923 },
    mlService: { status: 'running', queueLength: 3, avgInferenceTime: 1.8 },
    storage: { status: 'healthy', used: '45.2 GB', total: '100 GB', percentUsed: 45 },
    cdn: { status: 'operational', latency: 87, cacheHitRate: '94%' },
  });

  const [recentIncidents, setRecentIncidents] = useState([
    { id: 1, title: 'ML Service Degradation', status: 'resolved', time: '2025-02-28 14:30', duration: '15 min' },
    { id: 2, title: 'Database Connection Timeout', status: 'resolved', time: '2025-02-25 10:15', duration: '5 min' },
  ]);

  const [serverLogs, setServerLogs] = useState([
    { id: 1, level: 'info', message: 'Server started successfully', timestamp: '2025-03-03 08:00:00' },
    { id: 2, level: 'info', message: 'ML model loaded: Fruit Classifier v2.3', timestamp: '2025-03-03 08:00:01' },
    { id: 3, level: 'warning', message: 'High memory usage detected', timestamp: '2025-03-03 09:30:00' },
    { id: 4, level: 'error', message: 'Failed to process image: timeout', timestamp: '2025-03-03 10:15:00' },
  ]);

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); showSuccess('System health refreshed'); }, 1000);
  };

  const handleClearCache = () => {
    setShowClearCacheModal(false);
    showSuccess('Cache cleared successfully');
  };

  const handleRestartService = (service) => {
    if (window.confirm(`Restart ${service} service?`)) showSuccess(`${service} service restarted`);
  };

  const getStatusColor = (status) => {
    if (status === 'operational' || status === 'connected' || status === 'running' || status === 'healthy') return 'text-green-500';
    if (status === 'degraded' || status === 'warning') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status) => {
    if (status === 'operational' || status === 'connected' || status === 'running' || status === 'healthy') return '●';
    if (status === 'degraded' || status === 'warning') return '◔';
    return '○';
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div><h2 className="text-xl font-bold">System Health</h2><p className="text-sm text-gray-500">Monitor system status, performance, and incidents</p></div>
        <Button onClick={handleRefresh} isLoading={isRefreshing}>🔄 Refresh</Button>
      </div>

      {/* System Status Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"><div className="flex justify-between items-start"><div><h3 className="font-semibold">API Server</h3><p className={`text-sm ${getStatusColor(systemStatus.api.status)}`}>{getStatusIcon(systemStatus.api.status)} {systemStatus.api.status}</p></div><button onClick={() => handleRestartService('API')} className="text-xs text-gray-400">Restart</button></div><div className="mt-3 flex justify-between text-sm"><span>Response: {systemStatus.api.responseTime}ms</span><span>Uptime: {systemStatus.api.uptime}</span></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"><div className="flex justify-between items-start"><div><h3 className="font-semibold">Database</h3><p className={`text-sm ${getStatusColor(systemStatus.database.status)}`}>{getStatusIcon(systemStatus.database.status)} {systemStatus.database.status}</p></div><button onClick={() => handleRestartService('Database')} className="text-xs text-gray-400">Restart</button></div><div className="mt-3 flex justify-between text-sm"><span>Connections: {systemStatus.database.connections}</span><span>Query Time: {systemStatus.database.queryTime}ms</span></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"><div><h3 className="font-semibold">Redis Cache</h3><p className={`text-sm ${getStatusColor(systemStatus.redis.status)}`}>{getStatusIcon(systemStatus.redis.status)} {systemStatus.redis.status}</p></div><div className="mt-3 flex justify-between text-sm"><span>Memory: {systemStatus.redis.memory}</span><span>Hits: {systemStatus.redis.hits}</span></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"><div className="flex justify-between items-start"><div><h3 className="font-semibold">ML Service</h3><p className={`text-sm ${getStatusColor(systemStatus.mlService.status)}`}>{getStatusIcon(systemStatus.mlService.status)} {systemStatus.mlService.status}</p></div><button onClick={() => handleRestartService('ML')} className="text-xs text-gray-400">Restart</button></div><div className="mt-3 flex justify-between text-sm"><span>Queue: {systemStatus.mlService.queueLength} tasks</span><span>Inference: {systemStatus.mlService.avgInferenceTime}s</span></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"><div><h3 className="font-semibold">Storage</h3><p className={`text-sm ${getStatusColor(systemStatus.storage.status)}`}>{getStatusIcon(systemStatus.storage.status)} {systemStatus.storage.status}</p></div><div className="mt-2"><div className="flex justify-between text-xs"><span>Used: {systemStatus.storage.used}</span><span>Total: {systemStatus.storage.total}</span></div><div className="h-2 bg-gray-200 rounded-full mt-1"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${systemStatus.storage.percentUsed}%` }} /></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"><div><h3 className="font-semibold">CDN</h3><p className={`text-sm ${getStatusColor(systemStatus.cdn.status)}`}>{getStatusIcon(systemStatus.cdn.status)} {systemStatus.cdn.status}</p></div><div className="mt-3 flex justify-between text-sm"><span>Latency: {systemStatus.cdn.latency}ms</span><span>Cache Hit: {systemStatus.cdn.cacheHitRate}</span></div></div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5"><h3 className="font-semibold mb-4">Resource Usage</h3><div className="grid md:grid-cols-3 gap-4"><div><div className="flex justify-between text-sm mb-1"><span>CPU Usage</span><span>42%</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-primary-500 rounded-full" style={{ width: '42%' }} /></div></div><div><div className="flex justify-between text-sm mb-1"><span>Memory Usage</span><span>3.2 GB / 8 GB (40%)</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }} /></div></div><div><div className="flex justify-between text-sm mb-1"><span>Network I/O</span><span>1.2 MB/s ↓ • 0.8 MB/s ↑</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }} /></div></div></div></div>

      {/* Recent Incidents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5"><h3 className="font-semibold mb-4">Recent Incidents</h3>{recentIncidents.length === 0 ? <p className="text-gray-500 text-sm">No recent incidents</p> : <div className="space-y-2">{recentIncidents.map(incident => (<div key={incident.id} className="flex justify-between items-center py-2 border-b last:border-0"><div><p className="font-medium">{incident.title}</p><p className="text-xs text-gray-500">{incident.time} • Duration: {incident.duration}</p></div><span className="text-xs text-green-500">Resolved</span></div>))}</div>}</div>

      {/* Server Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5"><div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Server Logs</h3><button className="text-xs text-primary-500">Download Logs</button></div><div className="bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">{serverLogs.map(log => (<div key={log.id} className={`${log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}><span className="text-gray-500">[{log.timestamp}]</span> {log.message}</div>))}</div></div>

      {/* Maintenance Mode */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 p-5"><div className="flex justify-between items-center flex-wrap gap-4"><div><h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Maintenance Mode</h3><p className="text-sm text-yellow-700 dark:text-yellow-300">Put the system in maintenance mode to prevent user access during updates.</p></div><Button variant="warning">Enable Maintenance Mode</Button></div></div>

      {/* Clear Cache Modal */}
      {showClearCacheModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"><h3 className="text-lg font-bold mb-2">Clear Cache</h3><p className="text-sm text-gray-600 mb-4">This will clear all cached data across the system. Users may experience slower loading temporarily.</p><div className="flex gap-3"><Button variant="danger" onClick={handleClearCache}>Clear Cache</Button><Button variant="outline" onClick={() => setShowClearCacheModal(false)}>Cancel</Button></div></div></div>)}
    </div>
  );
};

export default SystemHealth;