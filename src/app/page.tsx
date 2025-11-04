'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { CalorieBank } from '@/components/CalorieBank';

export default function Home() {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCalorieBank, setShowCalorieBank] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);

    try {
      // 1. Get nutrition for the searched food
      const nutritionRes = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName: query }),
      });

      if (!nutritionRes.ok) {
        throw new Error('Nutrition lookup failed');
      }

      const nutritionData = await nutritionRes.json();

      // 2. Get healthy alternatives
      const alternativesRes = await fetch('/api/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName: query }),
      });

      if (!alternativesRes.ok) {
        throw new Error('Alternatives lookup failed');
      }

      const alternativesData = await alternativesRes.json();

      // 3. Set results
      setSearchResults({
        recognition: {
          foodName: query,
          category: nutritionData.results[0]?.category || 'food',
          confidence: 1.0,
        },
        nutrition: nutritionData.results[0],
        alternatives: alternativesData.alternatives,
        original: alternativesData.original,
      });
    } catch (error) {
      console.error('[Search] Failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                H
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  HealthyNow
                </h1>
                <p className="text-xs text-gray-500">Order healthy in seconds</p>
              </div>
            </div>

            {/* Toggle Calorie Bank (Mobile) */}
            <button
              onClick={() => setShowCalorieBank(!showCalorieBank)}
              className="md:hidden p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
            >
              <span className="text-2xl">🎯</span>
            </button>

            {/* Calorie Bank Preview (Desktop) */}
            <div className="hidden md:block">
              <div className="w-64">
                <CalorieBank />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!searchResults && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
              Find Healthy Food.
              <br />
              <span className="text-green-600">Order Instantly.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search what you're craving. Get healthier options with accurate nutrition.
              <br />
              Order with one click. Track your calorie bank. Stay on track.
            </p>
          </div>

          {/* Calorie Bank (Above Search) */}
          <div className="max-w-3xl mx-auto mb-8">
            <CalorieBank />
          </div>

          {/* Search Component */}
          <SearchBar onSearch={handleSearch} isSearching={isSearching} />

          {/* Value Props */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                No photo uploads. Just type and search. Get results in under 1 second.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Calorie Bank</h3>
              <p className="text-gray-600">
                Track your daily budget. Earn points. Get badges. Make healthy eating a game.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">One-Click Order</h3>
              <p className="text-gray-600">
                Order directly from Uber Eats, DoorDash, or find nearby restaurants instantly.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {searchResults && (
        <ResultsDisplay
          result={searchResults}
          onReset={() => setSearchResults(null)}
        />
      )}

      {/* Mobile Calorie Bank Modal */}
      {showCalorieBank && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Calorie Bank</h3>
              <button
                onClick={() => setShowCalorieBank(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <CalorieBank />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                  H
                </div>
                <span className="font-bold text-gray-900">HealthyNow</span>
              </div>
              <p className="text-sm text-gray-600">
                Making healthy eating as easy as ordering junk food.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>How it works</li>
                <li>Calorie Bank</li>
                <li>Gamification</li>
                <li>Premium</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Stats</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-bold text-green-600">38+</span>
                  <span className="text-gray-600"> Healthy foods</span>
                </li>
                <li>
                  <span className="font-bold text-green-600">100%</span>
                  <span className="text-gray-600"> Accuracy</span>
                </li>
                <li>
                  <span className="font-bold text-green-600">&lt;1s</span>
                  <span className="text-gray-600"> Search time</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Accurate nutrition data from official brand sources • USDA database</p>
            <p className="mt-2">© 2025 HealthyNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
