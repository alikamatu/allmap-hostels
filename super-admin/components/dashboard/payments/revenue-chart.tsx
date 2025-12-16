'use client';

import { RevenueStats } from '@/types/access.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: RevenueStats;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Transform monthly data for chart
  const chartData = Object.entries(data.byMonth).map(([month, revenue]) => ({
    month: new Date(month).toLocaleDateString('en-US', { month: 'short' }),
    revenue,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
          <p className="text-11 font-medium text-gray-900">{label}</p>
          <p className="text-11 text-gray-600">
            Revenue: <span className="font-semibold">${payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-14 font-medium text-gray-900">Monthly Revenue Trend</h3>
        <div className="text-11 text-gray-500">
          Last 6 months
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="#ff7a00"
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#ff7a00]"></div>
          <span className="text-11 text-gray-600">Monthly Revenue</span>
        </div>
      </div>
    </div>
  );
}