'use client';

import { WeeklyData, loadWeeklyData, saveWeeklyData, initializeWeeklyData } from './weeklyStorage';

// User-specific storage utilities
export const getUserStorageKey = (userId: string, dataType: string): string => {
  return `health_tracker_${userId}_${dataType}`;
};

export const loadUserWeeklyData = (userId: string): WeeklyData => {
  if (typeof window === 'undefined') {
    return initializeWeeklyData();
  }
  
  try {
    const key = getUserStorageKey(userId, 'weekly_data');
    const stored = localStorage.getItem(key);
    if (!stored) {
      return initializeWeeklyData();
    }
    
    const data: WeeklyData = JSON.parse(stored);
    const currentWeekStart = new Date();
    const day = currentWeekStart.getDay();
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
    currentWeekStart.setDate(diff);
    const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];
    
    // Check if stored data is from current week
    if (data.weekStart === currentWeekStartStr) {
      return data;
    } else {
      // New week started, initialize fresh data
      return initializeWeeklyData();
    }
  } catch (error) {
    console.error('Error loading user weekly data:', error);
    return initializeWeeklyData();
  }
};

export const saveUserWeeklyData = (userId: string, data: WeeklyData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getUserStorageKey(userId, 'weekly_data');
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user weekly data:', error);
  }
};

export const loadUserDailyGoal = (userId: string): number => {
  if (typeof window === 'undefined') return 2000;
  
  try {
    const key = getUserStorageKey(userId, 'daily_goal');
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 2000;
  } catch (error) {
    console.error('Error loading user daily goal:', error);
    return 2000;
  }
};

export const saveUserDailyGoal = (userId: string, goal: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getUserStorageKey(userId, 'daily_goal');
    localStorage.setItem(key, goal.toString());
  } catch (error) {
    console.error('Error saving user daily goal:', error);
  }
};

export const loadUserSelectedFoods = (userId: string): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = getUserStorageKey(userId, 'selected_foods');
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading user selected foods:', error);
    return [];
  }
};

export const saveUserSelectedFoods = (userId: string, foods: any[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getUserStorageKey(userId, 'selected_foods');
    localStorage.setItem(key, JSON.stringify(foods));
  } catch (error) {
    console.error('Error saving user selected foods:', error);
  }
};

export const loadUserWorkoutSessions = (userId: string): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = getUserStorageKey(userId, 'workout_sessions');
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading user workout sessions:', error);
    return [];
  }
};

export const saveUserWorkoutSessions = (userId: string, sessions: any[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getUserStorageKey(userId, 'workout_sessions');
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving user workout sessions:', error);
  }
};
