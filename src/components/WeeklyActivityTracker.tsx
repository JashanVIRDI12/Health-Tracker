'use client';

import { useState, useEffect } from 'react';
import { Calendar, Activity, Utensils, Zap, TrendingUp, RotateCcw } from 'lucide-react';
import { WeeklyData, WeeklyActivity, loadWeeklyData, saveWeeklyData, initializeWeeklyData, formatDateKey } from '@/utils/weeklyStorage';

interface WeeklyActivityTrackerProps {
  className?: string;
}

export default function WeeklyActivityTracker({ className = '' }: WeeklyActivityTrackerProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>(initializeWeeklyData());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const data = loadWeeklyData();
    setWeeklyData(data);
  }, []);

  const resetWeek = () => {
    const newData = initializeWeeklyData();
    setWeeklyData(newData);
    saveWeeklyData(newData);
  };

  const getCurrentDayActivity = (): WeeklyActivity | null => {
    const today = formatDateKey(new Date());
    return weeklyData.activities.find(activity => activity.date === today) || null;
  };

  const getWeekTotals = () => {
    return weeklyData.activities.reduce(
      (totals, day) => ({
        workouts: totals.workouts + day.workouts,
        caloriesConsumed: totals.caloriesConsumed + day.caloriesConsumed,
        caloriesBurned: totals.caloriesBurned + day.caloriesBurned
      }),
      { workouts: 0, caloriesConsumed: 0, caloriesBurned: 0 }
    );
  };

  const formatWeekRange = () => {
    const start = new Date(weeklyData.weekStart);
    const end = new Date(weeklyData.weekEnd);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (!isClient) {
    return (
      <div className={`bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const currentDay = getCurrentDayActivity();
  const weekTotals = getWeekTotals();

  return (
    <div className={`bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Weekly Activity</h2>
            <p className="text-sm text-gray-500">{formatWeekRange()}</p>
          </div>
        </div>
        
        <button
          onClick={resetWeek}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Week
        </button>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{weekTotals.workouts}</div>
              <div className="text-xs text-green-600 uppercase tracking-wider">Total Workouts</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{Math.round(weekTotals.caloriesConsumed)}</div>
              <div className="text-xs text-blue-600 uppercase tracking-wider">Calories Consumed</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700">{Math.round(weekTotals.caloriesBurned)}</div>
              <div className="text-xs text-red-600 uppercase tracking-wider">Calories Burned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Grid */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        {weeklyData.activities.map((day, index) => {
          const isToday = day.date === formatDateKey(new Date());
          const maxCalories = Math.max(...weeklyData.activities.map(d => d.caloriesConsumed), 2000);
          const maxBurned = Math.max(...weeklyData.activities.map(d => d.caloriesBurned), 500);
          
          return (
            <div
              key={day.date}
              className={`p-3 rounded-xl border-2 transition-all ${
                isToday 
                  ? 'border-blue-300 bg-blue-50 shadow-md' 
                  : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-center">
                <div className={`text-xs font-medium mb-2 ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                  {day.day.slice(0, 3)}
                </div>
                <div className={`text-sm font-bold mb-2 ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                  {new Date(day.date).getDate()}
                </div>
                
                {/* Activity Indicators */}
                <div className="space-y-2">
                  {/* Workouts */}
                  <div className="flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      day.workouts > 0 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {day.workouts}
                    </div>
                  </div>
                  
                  {/* Calories Consumed Bar */}
                  <div className="space-y-1">
                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((day.caloriesConsumed / maxCalories) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(day.caloriesConsumed)}
                    </div>
                  </div>
                  
                  {/* Calories Burned Bar */}
                  <div className="space-y-1">
                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((day.caloriesBurned / maxBurned) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(day.caloriesBurned)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Workouts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Calories In</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Calories Out</span>
        </div>
      </div>

      {/* Today's Details */}
      {currentDay && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Today's Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{currentDay.workouts}</div>
              <div className="text-xs text-gray-500">Workouts</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{Math.round(currentDay.caloriesConsumed)}</div>
              <div className="text-xs text-gray-500">Consumed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{Math.round(currentDay.caloriesBurned)}</div>
              <div className="text-xs text-gray-500">Burned</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(currentDay.caloriesConsumed - currentDay.caloriesBurned)}
              </div>
              <div className="text-xs text-gray-500">Net Calories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
