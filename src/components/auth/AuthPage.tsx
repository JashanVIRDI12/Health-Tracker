'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Health Tracker</h1>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
            Track Your Wellness Journey
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Monitor your daily calories, track workouts, and visualize your weekly progress 
            with our comprehensive health tracking platform.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Workout Tracking</h3>
              <p className="text-gray-600 text-sm">Log exercises, track duration, and monitor calories burned</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Calorie Monitoring</h3>
              <p className="text-gray-600 text-sm">Track food intake with comprehensive nutrition data</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm">Weekly Progress Visualization</span>
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Real-time Data Sync</span>
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm">Goal Setting & Tracking</span>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth Forms */}
        <div className="flex items-center justify-center">
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
