/**
 * Calorie Bank Component
 * Daily calorie tracking with gamification
 * MVP version using localStorage (no auth required)
 */

'use client';

import { useState, useEffect } from 'react';

interface CalorieBankData {
  dailyBudget: number;
  consumed: number;
  date: string; // YYYY-MM-DD
  orders: Array<{
    foodName: string;
    calories: number;
    timestamp: number;
  }>;
  streak: number; // Days of staying under budget
  totalPointsEarned: number;
}

export function CalorieBank() {
  const [bankData, setBankData] = useState<CalorieBankData>({
    dailyBudget: 2000,
    consumed: 0,
    date: getCurrentDate(),
    orders: [],
    streak: 0,
    totalPointsEarned: 0,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadBankData();
  }, []);

  function getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  function loadBankData() {
    try {
      const stored = localStorage.getItem('calorieBank');
      if (stored) {
        const data: CalorieBankData = JSON.parse(stored);

        // Reset if new day
        const today = getCurrentDate();
        if (data.date !== today) {
          // Check if yesterday was under budget → increase streak
          const wasUnderBudget = data.consumed <= data.dailyBudget;
          const newStreak = wasUnderBudget ? data.streak + 1 : 0;
          const pointsEarned = wasUnderBudget ? 10 : 0;

          const resetData: CalorieBankData = {
            ...data,
            consumed: 0,
            date: today,
            orders: [],
            streak: newStreak,
            totalPointsEarned: data.totalPointsEarned + pointsEarned,
          };

          setBankData(resetData);
          localStorage.setItem('calorieBank', JSON.stringify(resetData));
        } else {
          setBankData(data);
        }
      }
    } catch (error) {
      console.error('Failed to load calorie bank:', error);
    }
  }

  function saveBankData(data: CalorieBankData) {
    setBankData(data);
    localStorage.setItem('calorieBank', JSON.stringify(data));
  }

  function addOrder(foodName: string, calories: number) {
    const newOrder = {
      foodName,
      calories,
      timestamp: Date.now(),
    };

    const updatedData: CalorieBankData = {
      ...bankData,
      consumed: bankData.consumed + calories,
      orders: [...bankData.orders, newOrder],
    };

    saveBankData(updatedData);
  }

  const remaining = bankData.dailyBudget - bankData.consumed;
  const percentage = Math.min((bankData.consumed / bankData.dailyBudget) * 100, 100);
  const isOverBudget = remaining < 0;

  // Expose function to parent components
  if (typeof window !== 'undefined') {
    (window as any).addToCalorieBank = addOrder;
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm">
      {/* Compact View (Header) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-500">Calorie Bank</p>
            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {remaining >= 0 ? `${remaining.toLocaleString()} cal left` : `${Math.abs(remaining).toLocaleString()} cal over`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak Badge */}
          {bankData.streak > 0 && (
            <div className="px-3 py-1 bg-orange-100 border border-orange-300 rounded-full">
              <span className="text-sm font-bold text-orange-700">
                🔥 {bankData.streak} day streak
              </span>
            </div>
          )}

          {/* Expand Icon */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {/* Progress Bar */}
          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {bankData.consumed.toLocaleString()} / {bankData.dailyBudget.toLocaleString()} cal
              </span>
              <span className="text-sm font-medium text-gray-900">
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isOverBudget
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : percentage >= 80
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-green-400 to-green-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Budget</p>
              <p className="text-lg font-bold text-blue-700">
                {bankData.dailyBudget.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 mb-1">Consumed</p>
              <p className="text-lg font-bold text-purple-700">
                {bankData.consumed.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 mb-1">Points</p>
              <p className="text-lg font-bold text-green-700">
                {bankData.totalPointsEarned}
              </p>
            </div>
          </div>

          {/* Today's Orders */}
          {bankData.orders.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Today's Orders:</h4>
              <div className="space-y-2">
                {bankData.orders.map((order, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{order.foodName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        +{order.calories} cal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No orders today yet</p>
              <p className="text-xs mt-1">Search for food to get started!</p>
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              💡 <strong>Tip:</strong> Stay under budget for 7 days to earn the "Week Warrior" badge!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
