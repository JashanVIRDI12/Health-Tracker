'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Calculator, Target } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { loadWeeklyData, addFoodToDay, removeFoodFromDay, formatDateKey } from '@/utils/weeklyStorage';
import indianFoodsData from '@/data/indian_foods_200.json';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  quantity: number;
}

interface IndianFood {
  id: number;
  name: string;
  category: string;
  calories: number;
  unit: string;
  nutrients?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

// Use actual Indian foods data from JSON file
const foodsData: IndianFood[] = indianFoodsData as IndianFood[];

// Debug: Log the first food item to check structure
console.log('First food item:', foodsData[0]);
console.log('Has nutrients?', foodsData[0]?.nutrients);
console.log('Total foods loaded:', foodsData.length);

export default function CalorieTracker() {
  const { selectedFoods, dailyGoal, updateSelectedFoods, updateDailyGoal } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<IndianFood[]>(foodsData);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [weeklyData, setWeeklyData] = useState(loadWeeklyData());

  const categories = ['All', 'Indian', 'Fruit', 'Snack', 'Beverage', 'Sweet', 'Protein', 'Healthy'];

  const filterFoods = () => {
    let filtered = foodsData;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((food: IndianFood) => food.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter((food: IndianFood) => 
        food.name.toLowerCase().includes(searchTerm) ||
        food.category.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredFoods(filtered.slice(0, 20));
  };

  useEffect(() => {
    filterFoods();
  }, [searchQuery, selectedCategory]);

  // Sync weekly data on mount
  useEffect(() => {
    setWeeklyData(loadWeeklyData());
  }, []);

  const addFood = (food: IndianFood) => {
    console.log('Adding food:', food); // Debug log
    const newFood: FoodItem = {
      id: `${food.id}-${Date.now()}`,
      name: food.name,
      calories: food.calories,
      protein: food.nutrients?.protein || 0,
      carbs: food.nutrients?.carbs || 0,
      fat: food.nutrients?.fat || 0,
      serving: food.unit,
      quantity: 1,
    };
    
    const today = formatDateKey(new Date());
    
    // Update app context
    updateSelectedFoods([...selectedFoods, newFood]);
    
    // Update weekly storage
    const updatedWeeklyData = addFoodToDay(weeklyData, today, {
      id: newFood.id,
      name: newFood.name,
      calories: newFood.calories,
      quantity: newFood.quantity
    });
    setWeeklyData(updatedWeeklyData);
  };

  const removeFood = (id: string) => {
    const today = formatDateKey(new Date());
    
    // Update app context
    updateSelectedFoods(selectedFoods.filter(food => food.id !== id));
    
    // Update weekly storage
    const updatedWeeklyData = removeFoodFromDay(weeklyData, today, id);
    setWeeklyData(updatedWeeklyData);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return;
    
    // Add fade animation
    const element = document.querySelector(`[data-food-id="${id}"] .quantity-display`) as HTMLElement;
    if (element) {
      element.style.opacity = '0.3';
      element.style.transform = 'scale(0.9)';
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
      }, 150);
    }
    
    const today = formatDateKey(new Date());
    
    // Update app context
    const updatedFoods = selectedFoods.map(food => 
      food.id === id ? { ...food, quantity } : food
    );
    updateSelectedFoods(updatedFoods);
    
    // Update weekly storage - remove old entry and add updated one
    let updatedWeeklyData = removeFoodFromDay(weeklyData, today, id);
    const updatedFood = updatedFoods.find(f => f.id === id);
    if (updatedFood) {
      updatedWeeklyData = addFoodToDay(updatedWeeklyData, today, {
        id: updatedFood.id,
        name: updatedFood.name,
        calories: updatedFood.calories,
        quantity: updatedFood.quantity
      });
    }
    setWeeklyData(updatedWeeklyData);
  };

  const totalCalories = selectedFoods.reduce((sum, food) => sum + (food.calories * food.quantity), 0);
  const totalProtein = selectedFoods.reduce((sum, food) => sum + (food.protein * food.quantity), 0);
  const totalCarbs = selectedFoods.reduce((sum, food) => sum + (food.carbs * food.quantity), 0);
  const totalFat = selectedFoods.reduce((sum, food) => sum + (food.fat * food.quantity), 0);

  const calorieProgress = (totalCalories / dailyGoal) * 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Calorie Tracker</h1>
          <p className="text-gray-500 text-lg">Simple nutrition tracking</p>
        </div>

        {/* Daily Goal */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900">Daily Goal</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || value === '0') {
                  updateDailyGoal(0);
                } else {
                  updateDailyGoal(parseInt(value) || 2000);
                }
              }}
              className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="5000"
            />
            <span className="text-gray-700 font-medium">calories per day</span>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-medium mb-8 text-gray-900 text-center">Today's Progress</h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-light text-blue-600 mb-1 transition-all duration-300">{Math.round(totalCalories)}</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-green-600 mb-1 transition-all duration-300">{Math.round(totalProtein)}g</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-amber-600 mb-1 transition-all duration-300">{Math.round(totalCarbs)}g</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-red-500 mb-1 transition-all duration-300">{Math.round(totalFat)}g</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Fat</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{Math.round(calorieProgress)}% of goal</span>
              <span className="text-gray-600 font-medium">
                {dailyGoal - totalCalories > 0 ? `${Math.round(dailyGoal - totalCalories)} remaining` : 'Goal reached!'}
              </span>
            </div>
          </div>
        </div>

        {/* Add Food Section */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-medium mb-6 text-gray-900">Add Food</h2>
          
          {/* Category Filter */}
          <div className="mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Food Results */}
          {filteredFoods.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                  onClick={() => addFood(food)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{food.name}</div>
                    <div className="text-sm text-gray-500 mb-1">{food.category} • {food.unit}</div>
                    <div className="text-xs text-gray-400">
                      {food.calories} cal • P: {food.nutrients?.protein || 0}g • C: {food.nutrients?.carbs || 0}g • F: {food.nutrients?.fat || 0}g
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-4 group-hover:bg-blue-200 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredFoods.length === 0 && (searchQuery || selectedCategory !== 'All') && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-lg mb-2">No foods found</div>
              <div className="text-sm">Try adjusting your search or filter</div>
            </div>
          )}
        </div>

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-medium mb-6 text-gray-900">Today's Meals</h2>
            <div className="space-y-4">
              {selectedFoods.map((food) => (
                <div key={food.id} data-food-id={food.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{food.name}</div>
                    <div className="text-sm text-gray-500 mb-2">{food.serving}</div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {Math.round(food.calories * food.quantity)} cal
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {Math.round(food.protein * food.quantity)}g protein
                      </span>
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        {Math.round(food.carbs * food.quantity)}g carbs
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {Math.round(food.fat * food.quantity)}g fat
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-6">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(food.id, Math.max(0.1, food.quantity - 0.5))}
                        className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-white hover:bg-red-500 transition-all duration-200 font-bold text-lg active:scale-95 transform"
                      >
                        −
                      </button>
                      <div className="quantity-display w-16 py-2 text-center text-gray-900 font-semibold bg-gray-50 transition-all duration-300 ease-in-out" style={{opacity: 1, transform: 'scale(1)'}}>
                        {food.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(food.id, food.quantity + 0.5)}
                        className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-white hover:bg-green-500 transition-all duration-200 font-bold text-lg active:scale-95 transform"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => removeFood(food.id)}
                      className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}