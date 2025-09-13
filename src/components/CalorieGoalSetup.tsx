'use client';

import { useState } from 'react';
import { Calculator, Target, User, Activity, Scale, Calendar } from 'lucide-react';

interface UserData {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  goal: 'maintain' | 'lose' | 'gain';
  weeklyGoal?: number; // kg per week for lose/gain
}

interface CalorieGoalSetupProps {
  onGoalSet: (calories: number, method: 'manual' | 'calculated', userData?: UserData) => void;
  currentGoal: number;
  onClose: () => void;
}

export default function CalorieGoalSetup({ onGoalSet, currentGoal, onClose }: CalorieGoalSetupProps) {
  const [method, setMethod] = useState<'manual' | 'questionnaire'>('manual');
  const [manualGoal, setManualGoal] = useState(currentGoal);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    age: 25,
    gender: 'male',
    weight: 70,
    height: 170,
    activityLevel: 'moderately_active',
    goal: 'maintain',
    weeklyGoal: 0.5
  });

  const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const calculateTDEE = (bmr: number, activityLevel: string): number => {
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    return bmr * multipliers[activityLevel as keyof typeof multipliers];
  };

  const calculateCalorieGoal = (): number => {
    const bmr = calculateBMR(userData.weight, userData.height, userData.age, userData.gender);
    const tdee = calculateTDEE(bmr, userData.activityLevel);

    if (userData.goal === 'maintain') {
      return Math.round(tdee);
    } else if (userData.goal === 'lose') {
      // 1 kg = 7700 calories approximately
      const weeklyDeficit = (userData.weeklyGoal || 0.5) * 7700;
      const dailyDeficit = weeklyDeficit / 7;
      return Math.round(tdee - dailyDeficit);
    } else { // gain
      const weeklyExcess = (userData.weeklyGoal || 0.5) * 7700;
      const dailyExcess = weeklyExcess / 7;
      return Math.round(tdee + dailyExcess);
    }
  };

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
    { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { value: 'extremely_active', label: 'Extremely Active', description: 'Very hard exercise, physical job' }
  ];

  const goals = [
    { value: 'lose', label: 'Lose Weight', description: 'Create a calorie deficit' },
    { value: 'maintain', label: 'Maintain Weight', description: 'Maintain current weight' },
    { value: 'gain', label: 'Gain Weight', description: 'Create a calorie surplus' }
  ];

  const handleQuestionnaireComplete = () => {
    const calculatedGoal = calculateCalorieGoal();
    onGoalSet(calculatedGoal, 'calculated', userData);
  };

  const handleManualSet = () => {
    onGoalSet(manualGoal, 'manual');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Set Daily Calorie Goal</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Method Selection */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose your method:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setMethod('manual')}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  method === 'manual'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                }`}
              >
                <Target className="w-10 h-10 text-blue-600 mb-4 mx-auto" />
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Manual Entry</h4>
                <p className="text-gray-600">Set your own calorie goal if you already know it</p>
              </button>

              <button
                onClick={() => setMethod('questionnaire')}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  method === 'questionnaire'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                }`}
              >
                <Calculator className="w-10 h-10 text-blue-600 mb-4 mx-auto" />
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Calculate for Me</h4>
                <p className="text-gray-600">Answer questions to calculate your personalized needs</p>
              </button>
            </div>
          </div>

          {/* Manual Method */}
          {method === 'manual' && (
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 space-y-8">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Daily Calorie Goal
                </label>
                <input
                  type="number"
                  value={manualGoal}
                  onChange={(e) => setManualGoal(parseInt(e.target.value) || 0)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-lg font-medium text-gray-900 bg-white shadow-sm"
                  min="800"
                  max="5000"
                  placeholder="Enter calories (e.g., 2000)"
                />
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    💡 Typical ranges:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• 1200-1500 calories (weight loss)</li>
                    <li>• 1800-2200 calories (maintenance)</li>
                    <li>• 2500+ calories (weight gain)</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={handleManualSet}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Set Goal
              </button>
            </div>
          )}

          {/* Questionnaire Method */}
          {method === 'questionnaire' && (
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 space-y-8">
              {step === 1 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Age</label>
                      <input
                        type="number"
                        value={userData.age}
                        onChange={(e) => setUserData({...userData, age: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white shadow-sm font-medium"
                        min="10"
                        max="100"
                        placeholder="25"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Gender</label>
                      <select
                        value={userData.gender}
                        onChange={(e) => setUserData({...userData, gender: e.target.value as 'male' | 'female'})}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white shadow-sm font-medium"
                      >
                        <option value="male" className="text-gray-900 bg-white">Male</option>
                        <option value="female" className="text-gray-900 bg-white">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Weight (kg)</label>
                      <input
                        type="number"
                        value={userData.weight}
                        onChange={(e) => setUserData({...userData, weight: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white shadow-sm font-medium"
                        min="30"
                        max="300"
                        step="0.1"
                        placeholder="70.0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Height (cm)</label>
                      <input
                        type="number"
                        value={userData.height}
                        onChange={(e) => setUserData({...userData, height: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white shadow-sm font-medium"
                        min="100"
                        max="250"
                        placeholder="170"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Next Step →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    Activity Level
                  </h3>
                  
                  <div className="space-y-4">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setUserData({...userData, activityLevel: level.value as any})}
                        className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          userData.activityLevel === level.value
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                            : 'border-gray-200 hover:border-green-300 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="font-bold text-gray-900 text-lg mb-2">{level.label}</div>
                        <div className="text-gray-600">{level.description}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold text-lg"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Scale className="w-5 h-5 text-purple-600" />
                    </div>
                    Your Goal
                  </h3>
                  
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setUserData({...userData, goal: goal.value as any})}
                        className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          userData.goal === goal.value
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="font-bold text-gray-900 text-lg mb-2">{goal.label}</div>
                        <div className="text-gray-600">{goal.description}</div>
                      </button>
                    ))}
                  </div>

                  {(userData.goal === 'lose' || userData.goal === 'gain') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Weekly {userData.goal === 'lose' ? 'Loss' : 'Gain'} Goal (kg)
                      </label>
                      <select
                        value={userData.weeklyGoal}
                        onChange={(e) => setUserData({...userData, weeklyGoal: parseFloat(e.target.value)})}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 text-gray-900 bg-white shadow-sm font-medium"
                      >
                        <option value={0.25} className="text-gray-900 bg-white">0.25 kg (Conservative)</option>
                        <option value={0.5} className="text-gray-900 bg-white">0.5 kg (Moderate)</option>
                        <option value={0.75} className="text-gray-900 bg-white">0.75 kg (Aggressive)</option>
                        <option value={1} className="text-gray-900 bg-white">1 kg (Very Aggressive)</option>
                      </select>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 text-lg">🎯 Your Calculated Goal:</h4>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {calculateCalorieGoal()} <span className="text-xl text-blue-500">calories/day</span>
                    </div>
                    <div className="text-blue-700 font-medium">
                      Based on your BMR and activity level
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold text-lg"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleQuestionnaireComplete}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Set This Goal ✨
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
