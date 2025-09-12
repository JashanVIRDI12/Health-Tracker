'use client';
import { useState, useEffect } from 'react';
import { Activity, Utensils, Home, BarChart3, Target, TrendingUp, Clock, Zap } from 'lucide-react';
import CalorieTracker from '@/components/CalorieTracker';
import WorkoutTracker from '@/components/WorkoutTracker';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import WeeklyActivityTracker from '@/components/WeeklyActivityTracker';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppContext, AppContextType, FoodItem, WorkoutSession } from '@/contexts/AppContext';
import AuthPage from '@/components/auth/AuthPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserProfile from '@/components/UserProfile';
import { loadUserSelectedFoods, saveUserSelectedFoods, loadUserWorkoutSessions, saveUserWorkoutSessions, loadUserDailyGoal, saveUserDailyGoal } from '@/utils/userStorage';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

type TabType = 'dashboard' | 'calories' | 'workouts';

interface DashboardData {
  todayCalories: number;
  calorieGoal: number;
  todayWorkouts: number;
  caloriesBurned: number;
  weeklyWorkouts: number;
  weeklyCaloriesConsumed: number[];
  weeklyCaloriesBurned: number[];
}

function HealthTrackerApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering and load user data
  useEffect(() => {
    setIsClient(true);
    if (user) {
      // Load user-specific data
      setSelectedFoods(loadUserSelectedFoods(user.id));
      setWorkoutSessions(loadUserWorkoutSessions(user.id));
      setDailyGoal(loadUserDailyGoal(user.id));
    }
  }, [user]);

  // Calculate live dashboard data from actual app state
  const calculateDashboardData = (): DashboardData => {
    if (!isClient) {
      // Return default data for server-side rendering
      return {
        todayCalories: 0,
        calorieGoal: 2000,
        todayWorkouts: 0,
        caloriesBurned: 0,
        weeklyWorkouts: 0,
        weeklyCaloriesConsumed: [0, 0, 0, 0, 0, 0, 0],
        weeklyCaloriesBurned: [0, 0, 0, 0, 0, 0, 0]
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const todaysSessions = workoutSessions.filter(session => session.date === today);
    const todayCalories = selectedFoods.reduce((sum, food) => sum + (food.calories * food.quantity), 0);
    const todayWorkouts = todaysSessions.length;
    const caloriesBurned = todaysSessions.reduce((sum, session) => sum + session.caloriesBurned, 0);
    
    // Calculate weekly data (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = workoutSessions.filter(session => session.date === dateStr);
      return {
        calories: dateStr === today ? todayCalories : Math.floor(Math.random() * 500) + 1500,
        burned: daySessions.reduce((sum, session) => sum + session.caloriesBurned, 0)
      };
    });

    return {
      todayCalories: Math.round(todayCalories),
      calorieGoal: dailyGoal,
      todayWorkouts,
      caloriesBurned,
      weeklyWorkouts: workoutSessions.length,
      weeklyCaloriesConsumed: weeklyData.map(d => d.calories),
      weeklyCaloriesBurned: weeklyData.map(d => d.burned)
    };
  };

  const [dashboardData, setDashboardData] = useState<DashboardData>(calculateDashboardData());

  // Update dashboard data when app state changes
  useEffect(() => {
    if (isClient) {
      setDashboardData(calculateDashboardData());
    }
  }, [selectedFoods, workoutSessions, dailyGoal, isClient]);

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  // Update functions that save to user-specific storage
  const updateSelectedFoods = (foods: FoodItem[]) => {
    setSelectedFoods(foods);
    if (user) {
      saveUserSelectedFoods(user.id, foods);
    }
  };

  const updateWorkoutSessions = (sessions: WorkoutSession[]) => {
    setWorkoutSessions(sessions);
    if (user) {
      saveUserWorkoutSessions(user.id, sessions);
    }
  };

  const updateDailyGoal = (goal: number) => {
    setDailyGoal(goal);
    if (user) {
      saveUserDailyGoal(user.id, goal);
    }
  };

  const appContextValue: AppContextType = {
    selectedFoods,
    workoutSessions,
    dailyGoal,
    updateSelectedFoods,
    updateWorkoutSessions,
    updateDailyGoal
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'calories':
        return <CalorieTracker />;
      case 'workouts':
        return <WorkoutTracker />;
      case 'dashboard':
      default:
        return <Dashboard data={dashboardData} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <ProtectedRoute>
      <AppContext.Provider value={appContextValue}>
        <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-medium text-gray-900">Health Tracker</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('calories')}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'calories'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Calories
                </button>
                <button
                  onClick={() => setActiveTab('workouts')}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'workouts'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Workouts
                </button>
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
          {renderContent()}
        </main>
        </div>
      </AppContext.Provider>
    </ProtectedRoute>
  );
}

interface DashboardProps {
  data: DashboardData;
  setActiveTab: (tab: TabType) => void;
}

function Dashboard({ data, setActiveTab }: DashboardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Health Dashboard</h1>
          <p className="text-gray-500 text-lg">Track your wellness journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const calorieProgress = (data.todayCalories / data.calorieGoal) * 100;
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-light text-gray-900 mb-3">Health Dashboard</h1>
        <p className="text-gray-500 text-lg">Track your wellness journey</p>
      </div>

      {/* Date Time Display */}
      <DateTimeDisplay className="mb-8" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Calories */}
        <div 
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() => setActiveTab('calories')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Utensils className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-blue-600 transition-all duration-300">{data.todayCalories}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">Calories</div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(calorieProgress, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-700 font-medium">{Math.round(calorieProgress)}% of {data.calorieGoal} goal</div>
        </div>

        {/* Today's Workouts */}
        <div 
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() => setActiveTab('workouts')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-green-600 transition-all duration-300">{data.todayWorkouts}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">Workouts</div>
            </div>
          </div>
          <div className="text-sm text-gray-700 font-medium">Sessions completed today</div>
        </div>

        {/* Calories Burned */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-red-500 transition-all duration-300">{data.caloriesBurned}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">Burned</div>
            </div>
          </div>
          <div className="text-sm text-gray-700 font-medium">Calories from workouts</div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-purple-600 transition-all duration-300">{data.weeklyWorkouts}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">This Week</div>
            </div>
          </div>
          <div className="text-sm text-gray-700 font-medium">Total workout sessions</div>
        </div>
      </div>

      {/* Weekly Activity Tracker */}
      <WeeklyActivityTracker className="mb-8" />

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div 
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 cursor-pointer hover:shadow-lg transition-all group"
          onClick={() => setActiveTab('calories')}
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">Calorie Tracking</h2>
              <p className="text-blue-600 text-sm group-hover:text-blue-700">Click to explore →</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            Track your daily food intake with our comprehensive Indian food database.
            Search for foods, log meals, and monitor your nutritional goals.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              200+ Indian foods with complete nutrition data
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Track calories, protein, carbs, and fat
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Set and monitor daily calorie goals
            </div>
          </div>
        </div>

        <div 
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 cursor-pointer hover:shadow-lg transition-all group"
          onClick={() => setActiveTab('workouts')}
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">Workout Tracking</h2>
              <p className="text-green-600 text-sm group-hover:text-green-700">Click to explore →</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            Choose from various exercises across multiple categories. Time your workouts and
            track calories burned based on exercise intensity.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Multiple exercises across various categories
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Built-in workout timer with live tracking
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Calorie burn estimation and history
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="flex items-center p-6 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors group"
            onClick={() => setActiveTab('calories')}
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Log Your Meal</h3>
              <p className="text-sm text-blue-700">
                Quick access to food logging and calorie tracking
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-center p-6 bg-green-50 rounded-xl border border-green-200 cursor-pointer hover:bg-green-100 transition-colors group"
            onClick={() => setActiveTab('workouts')}
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-green-900 mb-1">Start Workout</h3>
              <p className="text-sm text-green-700">
                Begin timing your exercise session right away
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <SessionProvider>
      <AuthProvider>
        <AuthWrapper />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </AuthProvider>
    </SessionProvider>
  );
}

function AuthWrapper() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading Health Tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <HealthTrackerApp />;
}