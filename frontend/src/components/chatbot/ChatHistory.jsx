import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/helpers';

const ChatHistory = ({ sessions, onSelectSession, onDeleteSession, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Default sessions if none provided
  const defaultSessions = [
    { id: '1', title: 'Fruit identification help', preview: 'How to identify a ripe mango?', date: new Date(), messageCount: 5 },
    { id: '2', title: 'Nutritional information', preview: 'What are the benefits of eating apples?', date: new Date(Date.now() - 86400000), messageCount: 3 },
    { id: '3', title: 'Seasonal fruits', preview: 'Which fruits are in season during summer?', date: new Date(Date.now() - 172800000), messageCount: 7 },
  ];

  const chatSessions = sessions?.length > 0 ? sessions : defaultSessions;

  const filteredSessions = chatSessions.filter(session =>
    session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.preview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (session) => {
    setSelectedSessionId(session.id);
    if (onSelectSession) {
      onSelectSession(session);
    }
  };

  const handleDelete = (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      if (onDeleteSession) {
        onDeleteSession(sessionId);
      }
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Delete all chat history? This action cannot be undone.')) {
      if (onClearAll) {
        onClearAll();
      }
      setSelectedSessionId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>📜</span> Chat History
        </h3>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => handleSelect({ id: 'new', title: 'New Chat' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <span>+</span> New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(session)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all
                  ${selectedSessionId === session.id 
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {session.title || 'Untitled Conversation'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {session.preview || 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatDate(session.date, 'short')}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {session.messageCount || 0} messages
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete conversation"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {chatSessions.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClearAll}
            className="w-full text-center text-sm text-red-500 hover:text-red-600 py-2 transition-colors"
          >
            Clear All History
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;