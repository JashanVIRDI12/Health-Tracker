'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Timer, Dumbbell, Activity, Search } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import workoutsData from '@/data/workouts.json';
import { loadWeeklyData, addWorkoutToDay, removeWorkoutFromDay, formatDateKey } from '@/utils/weeklyStorage';

interface Workout {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  muscleGroups: string[];
  equipment: string;
  caloriesPerMinute: number;
  description: string;
}

interface WorkoutSession {
  id: string;
  workoutId: number;
  name: string;
  duration: number; // in minutes
  caloriesBurned: number;
  date: string;
}

interface WorkoutInput {
  workout: Workout;
  reps?: number;
  minutes?: number;
  isRepsType: boolean;
}


export default function WorkoutTracker() {
  const { workoutSessions, updateWorkoutSessions } = useAppContext();
  const [workouts] = useState<Workout[]>(workoutsData as Workout[]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutInput | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [weeklyData, setWeeklyData] = useState(loadWeeklyData());

  // Filter workouts based on search query
  const filteredWorkouts = workouts.filter(workout => {
    if (searchQuery.trim() === '') return true;
    return workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workout.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workout.muscleGroups.some(muscle => muscle.toLowerCase().includes(searchQuery.toLowerCase())) ||
           workout.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workout.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sync weekly data on mount
  useEffect(() => {
    setWeeklyData(loadWeeklyData());
  }, []);



  const selectWorkout = (workout: Workout) => {
    // Determine if workout is reps-based or time-based
    const isRepsType = ['Push-ups', 'Squats', 'Pull-ups', 'Lunges', 'Burpees', 'Jumping Jacks', 'Bicep Curls', 'Tricep Dips', 'Russian Twists', 'Calf Raises'].includes(workout.name);
    
    setSelectedWorkout({
      workout,
      reps: isRepsType ? 10 : undefined,
      minutes: !isRepsType ? 5 : undefined,
      isRepsType
    });
  };

  const updateWorkoutInput = (field: 'reps' | 'minutes', value: number) => {
    if (selectedWorkout) {
      setSelectedWorkout({
        ...selectedWorkout,
        [field]: value
      });
    }
  };

  const calculateCalories = (workout: Workout, reps?: number, minutes?: number) => {
    if (minutes) {
      return Math.round(minutes * workout.caloriesPerMinute);
    } else if (reps) {
      // Estimate calories based on reps (assuming ~30 seconds per 10 reps for most exercises)
      const estimatedMinutes = (reps / 10) * 0.5;
      return Math.round(estimatedMinutes * workout.caloriesPerMinute);
    }
    return 0;
  };

  const completeWorkout = () => {
    if (selectedWorkout) {
      const { workout, reps, minutes } = selectedWorkout;
      const duration = minutes || (reps ? (reps / 10) * 0.5 : 0);
      const caloriesBurned = calculateCalories(workout, reps, minutes);
      const today = formatDateKey(new Date());
      
      const session: WorkoutSession = {
        id: `session-${Date.now()}`,
        name: `${workout.name} ${reps ? `(${reps} reps)` : `(${minutes} min)`}`,
        duration,
        caloriesBurned,
        date: today,
        workoutId: workout.id
      };
      
      // Update app context
      updateWorkoutSessions([session, ...workoutSessions]);
      
      // Update weekly storage
      const updatedWeeklyData = addWorkoutToDay(weeklyData, today, {
        id: session.id,
        name: session.name,
        duration: session.duration,
        caloriesBurned: session.caloriesBurned
      });
      setWeeklyData(updatedWeeklyData);
      
      setSelectedWorkout(null);
    }
  };

  const deleteSession = (sessionId: string) => {
    const sessionToDelete = workoutSessions.find(s => s.id === sessionId);
    if (sessionToDelete) {
      // Update app context
      updateWorkoutSessions(workoutSessions.filter(session => session.id !== sessionId));
      
      // Update weekly storage
      const updatedWeeklyData = removeWorkoutFromDay(weeklyData, sessionToDelete.date, sessionId);
      setWeeklyData(updatedWeeklyData);
    }
  };


  const todaysSessions = workoutSessions.filter(session => session.date === new Date().toISOString().split('T')[0]);
  const totalCaloriesToday = todaysSessions.reduce((sum, session) => sum + session.caloriesBurned, 0);
  const totalDurationToday = todaysSessions.reduce((sum, session) => sum + session.duration, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Workout Tracker</h1>
          <p className="text-gray-500 text-lg">Track your fitness journey</p>
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900">Today's Summary</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-light text-gray-900 mb-1">{todaysSessions.length}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-blue-600 mb-1">{Math.round(totalDurationToday)}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-red-500 mb-1">{totalCaloriesToday}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Calories Burned</div>
            </div>
          </div>
        </div>

        {/* Selected Workout Input */}
        {selectedWorkout && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-900">Log Workout</h2>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-gray-900 mb-2">{selectedWorkout.workout.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white bg-opacity-70 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedWorkout.workout.category}
                  </span>
                  <span className="bg-white bg-opacity-70 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedWorkout.workout.difficulty}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{selectedWorkout.workout.description}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Equipment:</span> {selectedWorkout.workout.equipment} • 
                  <span className="font-medium"> Muscles:</span> {selectedWorkout.workout.muscleGroups.join(', ')}
                </p>
              </div>
              
              <div className="text-center md:text-right">
                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-4">
                  {selectedWorkout.isRepsType ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reps Completed</label>
                      <input
                        type="number"
                        value={selectedWorkout.reps || 0}
                        onChange={(e) => updateWorkoutInput('reps', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
                      <input
                        type="number"
                        value={selectedWorkout.minutes || 0}
                        onChange={(e) => updateWorkoutInput('minutes', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-lg text-gray-700 mb-6">
                  ~{calculateCalories(selectedWorkout.workout, selectedWorkout.reps, selectedWorkout.minutes)} calories burned
                </div>
                
                <div className="flex gap-3 justify-center md:justify-end">
                  <button 
                    onClick={() => setSelectedWorkout(null)} 
                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={completeWorkout} 
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout Library */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900">Workout Library</h2>
            </div>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Workout List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredWorkouts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-lg mb-2">No workouts found</div>
                  <div className="text-sm">Try adjusting your search terms</div>
                </div>
              ) : (
                filteredWorkouts.map((workout) => (
                <div key={workout.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-lg mb-2">{workout.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {workout.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          workout.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          workout.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {workout.difficulty}
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {workout.caloriesPerMinute} cal/min
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{workout.description}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Equipment:</span> {workout.equipment} • 
                        <span className="font-medium"> Muscles:</span> {workout.muscleGroups.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => selectWorkout(workout)}
                      disabled={!!selectedWorkout}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Log
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900">Recent Sessions</h2>
            </div>
            
            {workoutSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-lg mb-2">No workout sessions yet</div>
                <div className="text-sm">Start a workout to see your sessions here</div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {workoutSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{session.name}</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {Math.round(session.duration)} min
                        </span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          {session.caloriesBurned} cal
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                          {session.date}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors ml-4"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
