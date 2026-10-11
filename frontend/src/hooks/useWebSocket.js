import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook for WebSocket connection
 * Provides real-time communication for live features
 */
export const useWebSocket = (options = {}) => {
  const {
    url = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage: customOnMessage,
    onConnect: customOnConnect,
    onDisconnect: customOnDisconnect,
    onError: customOnError,
  } = options;

  const { accessToken, isAuthenticated } = useAuth();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated && options.requireAuth !== false) {
      console.log('WebSocket: Not authenticated, skipping connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const wsUrl = `${url}?token=${accessToken || ''}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket: Connected');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        setConnectionError(null);
        
        // Start heartbeat
        startHeartbeat();
        
        if (customOnConnect) customOnConnect();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (customOnMessage) customOnMessage(data);
        } catch (error) {
          console.error('WebSocket: Error parsing message', error);
          setLastMessage(event.data);
          if (customOnMessage) customOnMessage(event.data);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket: Error', error);
        setConnectionError('WebSocket connection error');
        if (customOnError) customOnError(error);
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket: Disconnected', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        stopHeartbeat();
        
        if (customOnDisconnect) customOnDisconnect(event);
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts && autoConnect) {
          const delay = reconnectInterval * Math.pow(1.5, reconnectAttempts);
          console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.log('WebSocket: Max reconnection attempts reached');
          setConnectionError('Max reconnection attempts reached');
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket: Connection error', error);
      setConnectionError(error.message);
      setIsConnecting(false);
    }
  }, [url, accessToken, isAuthenticated, autoConnect, reconnectInterval, maxReconnectAttempts, reconnectAttempts, customOnConnect, customOnMessage, customOnError, customOnDisconnect, options.requireAuth]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      return true;
    }
    console.warn('WebSocket: Cannot send message, not connected');
    return false;
  }, []);

  // Start heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000);
  }, [sendMessage]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, connect, disconnect]);

  // Reconnect when authentication changes
  useEffect(() => {
    if (isAuthenticated && autoConnect && !isConnected && !isConnecting) {
      connect();
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, autoConnect, isConnected, isConnecting, connect, disconnect]);

  return {
    // State
    isConnected,
    isConnecting,
    lastMessage,
    connectionError,
    reconnectAttempts,
    
    // Methods
    connect,
    disconnect,
    sendMessage,
  };
};

export default useWebSocket;