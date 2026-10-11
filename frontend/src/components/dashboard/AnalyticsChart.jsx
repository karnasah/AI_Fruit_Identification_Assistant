import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AnalyticsChart = ({ data, timeRange, type = 'line', fullSize = false }) => {
  // Get theme colors
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  // Prepare chart data based on type
  const getChartData = () => {
    if (type === 'doughnut') {
      return {
        labels: data?.mostIdentified?.map(item => item.name) || ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes'],
        datasets: [
          {
            data: data?.mostIdentified?.map(item => item.count) || [35, 28, 22, 15, 10],
            backgroundColor: [
              '#f57d19',
              '#19821e',
              '#507bff',
              '#f59e0b',
              '#ef4444',
            ],
            borderWidth: 0,
          },
        ],
      };
    }

    // Line/Bar chart data for identification trends
    const labels = timeRange === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === 'month'
      ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const chartData = data?.weeklyActivity || [12, 19, 15, 17, 14, 22, 18];

    return {
      labels,
      datasets: [
        {
          label: 'Identifications',
          data: chartData,
          borderColor: '#f57d19',
          backgroundColor: type === 'bar' ? 'rgba(245, 125, 25, 0.2)' : 'rgba(245, 125, 25, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#f57d19',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: type === 'line',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: !fullSize,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#111827',
        bodyColor: isDark ? '#9ca3af' : '#6b7280',
        borderColor: '#f57d19',
        borderWidth: 1,
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor },
        beginAtZero: true,
      },
    } : {},
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={getChartData()} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={getChartData()} options={chartOptions} />;
      default:
        return <Line data={getChartData()} options={chartOptions} />;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5 ${fullSize ? '' : 'h-80'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {type === 'doughnut' ? 'Most Identified Fruits' : 'Identification Trends'}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'This year'}
        </span>
      </div>
      <div className={fullSize ? 'h-96' : 'h-64'}>
        {renderChart()}
      </div>
    </div>
  );
};

export default AnalyticsChart;