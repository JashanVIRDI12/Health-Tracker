'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimeDisplayProps {
  className?: string;
}

export default function DateTimeDisplay({ className = '' }: DateTimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Today</h3>
            <p className="text-blue-600 text-sm">{formatDate(currentTime)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h3 className="text-lg font-medium text-gray-900">Current Time</h3>
            <p className="text-indigo-600 text-sm font-mono">{formatTime(currentTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
