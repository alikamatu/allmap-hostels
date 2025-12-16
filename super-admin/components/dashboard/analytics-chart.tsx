'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  date: string;
  revenue: number;
  bookings: number;
  users: number;
}

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'bookings' | 'users'>('revenue');

  useEffect(() => {
    // Simulate API call
    const fetchChartData = async () => {
      setIsLoading(true);
      
      // Generate mock data for demonstration
      const mockData: ChartData[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        mockData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.floor(Math.random() * 10000) + 2000,
          bookings: Math.floor(Math.random() * 20) + 5,
          users: Math.floor(Math.random() * 15) + 3,
        });
      }
      
      setTimeout(() => {
        setChartData(mockData);
        setIsLoading(false);
      }, 500);
    };

    fetchChartData();
  }, []);

  const calculateStats = () => {
    if (chartData.length === 0) return { total: 0, change: 0 };
    
    const values = chartData.map(d => d[selectedMetric]);
    const total = values.reduce((sum, val) => sum + val, 0);
    const firstHalf = values.slice(0, 15).reduce((sum, val) => sum + val, 0);
    const secondHalf = values.slice(15).reduce((sum, val) => sum + val, 0);
    const change = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
    
    return { total, change: Math.round(change * 10) / 10 };
  };

  const stats = calculateStats();
  const maxValue = chartData.length > 0 
    ? Math.max(...chartData.map(d => d[selectedMetric]))
    : 0;

  if (isLoading) {
    return (
      <div className="h-64 bg-white p-4">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-11 text-gray-500 mb-2">Loading chart...</div>
            <div className="text-10 text-gray-400">Fetching analytics data</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedMetric('revenue')}
              className={`text-11 font-medium px-3 py-1 rounded ${
                selectedMetric === 'revenue'
                  ? 'bg-[#ff7a00] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setSelectedMetric('bookings')}
              className={`text-11 font-medium px-3 py-1 rounded ${
                selectedMetric === 'bookings'
                  ? 'bg-[#ff7a00] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setSelectedMetric('users')}
              className={`text-11 font-medium px-3 py-1 rounded ${
                selectedMetric === 'users'
                  ? 'bg-[#ff7a00] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Users
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-20 font-semibold text-gray-900">
            {selectedMetric === 'revenue' ? '₵' : ''}
            {stats.total.toLocaleString('en-US')}
            {selectedMetric === 'revenue' ? '' : selectedMetric === 'bookings' ? ' bookings' : ' users'}
          </div>
          <div className={`flex items-center text-10 ${stats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.change >= 0 ? (
              <TrendingUp size={10} className="mr-1" />
            ) : (
              <TrendingDown size={10} className="mr-1" />
            )}
            {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}% from previous period
          </div>
        </div>
      </div>

      <div className="h-48 relative">
        <div className="absolute inset-0 flex items-end gap-1">
          {chartData.map((data, index) => {
            const height = maxValue > 0 ? (data[selectedMetric] / maxValue) * 100 : 0;
            const isToday = index === chartData.length - 1;
            
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.01 }}
                className={`flex-1 relative group ${
                  isToday ? 'bg-[#ff7a00]' : 'bg-gray-300'
                } hover:bg-opacity-90 transition-colors`}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-10 px-2 py-1 rounded whitespace-nowrap">
                    <div className="font-medium">
                      {selectedMetric === 'revenue' ? '₵' : ''}
                      {data[selectedMetric].toLocaleString('en-US')}
                    </div>
                    <div className="text-gray-300">{data.date}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-10 text-gray-400">
          <span>{chartData[0]?.date}</span>
          <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
          <span>{chartData[chartData.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}