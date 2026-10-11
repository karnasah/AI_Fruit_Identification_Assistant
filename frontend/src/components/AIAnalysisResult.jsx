import React from 'react';
import { motion } from 'framer-motion';

const cards = [
  ['fruit_name', 'Fruit Name', '🍎'],
  ['disease_analysis', 'Disease Analysis', '🩺'],
  ['ripeness', 'Ripeness', '⏳'],
  ['quality', 'Quality', '✦'],
  ['recommendations', 'Recommendations', '💡'],
  ['nutrition', 'Nutrition', '🥗'],
  ['storage_tips', 'Storage Tips', '❄️'],
];

const displayValue = (value) => (
  typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
);

const AIAnalysisResult = ({ result }) => {
  if (!result) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map(([key, title, icon], index) => (
        <motion.article
          key={key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="rounded-xl bg-white p-5 shadow-md dark:bg-gray-800"
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <span aria-hidden="true">{icon}</span>{title}
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
            {displayValue(result[key])}
          </p>
        </motion.article>
      ))}
    </div>
  );
};

export default AIAnalysisResult;