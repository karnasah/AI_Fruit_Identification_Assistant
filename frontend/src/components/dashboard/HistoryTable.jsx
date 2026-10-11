import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate, getFruitEmoji } from '../../utils/helpers';

const HistoryTable = ({ history, onRefresh, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter history based on search
  const filteredHistory = history.filter((item) =>
    item.fruitName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const visibleItemIds = new Set(paginatedHistory.map((item) => item.id));

  // Handle select all
  const handleSelectAll = () => {
    const selectedVisibleItems = selectedItems.filter((id) => visibleItemIds.has(id));
    if (selectedVisibleItems.length === paginatedHistory.length) {
      setSelectedItems(selectedItems.filter((id) => !visibleItemIds.has(id)));
    } else {
      setSelectedItems([...new Set([...selectedItems, ...paginatedHistory.map((item) => item.id)])]);
    }
  };

  // Handle select single
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedItems.length} items?`)) {
      selectedItems.forEach((id) => {
        if (onDelete) onDelete(id);
      });
      setSelectedItems([]);
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8 text-center">
        <div className="text-5xl mb-3">📭</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No History Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Start identifying fruits to see your history here
        </p>
        <button
          onClick={() => window.location.href = '/identify'}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Identify a Fruit
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search fruits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          {selectedItems.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Selected ({selectedItems.length})
            </button>
          )}
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={paginatedHistory.length > 0 && paginatedHistory.every((item) => selectedItems.includes(item.id))}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Fruit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedHistory.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFruitEmoji(item.fruitName)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.fruitName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                    {Math.round(item.confidence)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(item.timestamp, 'datetime')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/identify?result=${item.id}`}
                      className="p-1 text-blue-500 hover:text-blue-600"
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(item.id)}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;