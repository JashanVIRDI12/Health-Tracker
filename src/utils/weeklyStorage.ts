'use client';

export interface WeeklyActivity {
  date: string;
  day: string;
  workouts: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  workoutSessions: Array<{
    id: string;
    name: string;
    duration: number;
    caloriesBurned: number;
  }>;
  foods: Array<{
    id: string;
    name: string;
    calories: number;
    quantity: number;
  }>;
}

export interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  activities: WeeklyActivity[];
}

const STORAGE_KEY = 'health_tracker_weekly_data';

export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  // Calculate days to subtract to get to Monday (day 1)
  // Sunday = 0, Monday = 1, Tuesday = 2, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0); // Reset time to start of day
  return weekStart;
};

export const getWeekEnd = (weekStart: Date): Date => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999); // Set to end of day
  return weekEnd;
};

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const initializeWeeklyData = (): WeeklyData => {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd(weekStart);
  
  const activities: WeeklyActivity[] = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    
    activities.push({
      date: formatDateKey(currentDate),
      day: getDayName(currentDate),
      workouts: 0,
      caloriesConsumed: 0,
      caloriesBurned: 0,
      workoutSessions: [],
      foods: []
    });
  }
  
  return {
    weekStart: formatDateKey(weekStart),
    weekEnd: formatDateKey(weekEnd),
    activities
  };
};

export const loadWeeklyData = (): WeeklyData => {
  if (typeof window === 'undefined') {
    return initializeWeeklyData();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initializeWeeklyData();
    }
    
    const data: WeeklyData = JSON.parse(stored);
    const currentWeekStart = formatDateKey(getWeekStart());
    
    // Check if stored data is from current week
    if (data.weekStart === currentWeekStart) {
      return data;
    } else {
      // New week started, initialize fresh data
      return initializeWeeklyData();
    }
  } catch (error) {
    console.error('Error loading weekly data:', error);
    return initializeWeeklyData();
  }
};

export const saveWeeklyData = (data: WeeklyData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving weekly data:', error);
  }
};

export const updateDayActivity = (
  weeklyData: WeeklyData,
  date: string,
  updates: Partial<WeeklyActivity>
): WeeklyData => {
  const updatedActivities = weeklyData.activities.map(activity => {
    if (activity.date === date) {
      return { ...activity, ...updates };
    }
    return activity;
  });
  
  const updatedData = {
    ...weeklyData,
    activities: updatedActivities
  };
  
  saveWeeklyData(updatedData);
  return updatedData;
};

export const addWorkoutToDay = (
  weeklyData: WeeklyData,
  date: string,
  workout: {
    id: string;
    name: string;
    duration: number;
    caloriesBurned: number;
  }
): WeeklyData => {
  const dayActivity = weeklyData.activities.find(a => a.date === date);
  if (!dayActivity) return weeklyData;
  
  const updatedSessions = [...dayActivity.workoutSessions, workout];
  const totalCaloriesBurned = updatedSessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
  
  return updateDayActivity(weeklyData, date, {
    workouts: updatedSessions.length,
    caloriesBurned: totalCaloriesBurned,
    workoutSessions: updatedSessions
  });
};

export const addFoodToDay = (
  weeklyData: WeeklyData,
  date: string,
  food: {
    id: string;
    name: string;
    calories: number;
    quantity: number;
  }
): WeeklyData => {
  const dayActivity = weeklyData.activities.find(a => a.date === date);
  if (!dayActivity) return weeklyData;
  
  const updatedFoods = [...dayActivity.foods, food];
  const totalCaloriesConsumed = updatedFoods.reduce((sum, f) => sum + (f.calories * f.quantity), 0);
  
  return updateDayActivity(weeklyData, date, {
    caloriesConsumed: totalCaloriesConsumed,
    foods: updatedFoods
  });
};

export const removeFoodFromDay = (
  weeklyData: WeeklyData,
  date: string,
  foodId: string
): WeeklyData => {
  const dayActivity = weeklyData.activities.find(a => a.date === date);
  if (!dayActivity) return weeklyData;
  
  const updatedFoods = dayActivity.foods.filter(f => f.id !== foodId);
  const totalCaloriesConsumed = updatedFoods.reduce((sum, f) => sum + (f.calories * f.quantity), 0);
  
  return updateDayActivity(weeklyData, date, {
    caloriesConsumed: totalCaloriesConsumed,
    foods: updatedFoods
  });
};

export const removeWorkoutFromDay = (
  weeklyData: WeeklyData,
  date: string,
  workoutId: string
): WeeklyData => {
  const dayActivity = weeklyData.activities.find(a => a.date === date);
  if (!dayActivity) return weeklyData;
  
  const updatedSessions = dayActivity.workoutSessions.filter(s => s.id !== workoutId);
  const totalCaloriesBurned = updatedSessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
  
  return updateDayActivity(weeklyData, date, {
    workouts: updatedSessions.length,
    caloriesBurned: totalCaloriesBurned,
    workoutSessions: updatedSessions
  });
};
