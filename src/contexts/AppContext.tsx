'use client';
import { createContext, useContext } from 'react';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  quantity: number;
}

export interface WorkoutSession {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}

export interface AppContextType {
  selectedFoods: FoodItem[];
  workoutSessions: WorkoutSession[];
  dailyGoal: number;
  updateSelectedFoods: (foods: FoodItem[]) => void;
  updateWorkoutSessions: (sessions: WorkoutSession[]) => void;
  updateDailyGoal: (goal: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
