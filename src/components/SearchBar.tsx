/**
 * SearchBar Component
 * Search-first interface for HealthyNow
 * User types what they're craving → Get healthy options
 */

'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function SearchBar({ onSearch, isSearching = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  // Popular searches
  const popularSearches = [
    { emoji: '🍔', text: 'Burger', category: 'burger' },
    { emoji: '🍕', text: 'Pizza', category: 'pizza' },
    { emoji: '🥗', text: 'Salad', category: 'salad' },
    { emoji: '🌮', text: 'Taco', category: 'taco' },
    { emoji: '🍗', text: 'Chicken', category: 'chicken' },
    { emoji: '🥙', text: 'Sandwich', category: 'sandwich' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you craving? (e.g., Big Mac, Pizza, Salad)"
            className="w-full px-6 py-5 pr-32 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Popular Searches */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">🔥 Popular searches:</p>
        <div className="flex flex-wrap gap-3">
          {popularSearches.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item.text);
                onSearch(item.text);
              }}
              disabled={isSearching}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              <span className="text-lg">{item.emoji}</span>
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-green-600">38+</p>
            <p className="text-sm text-gray-600 mt-1">Healthy Options</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">&lt;1s</p>
            <p className="text-sm text-gray-600 mt-1">Search Speed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">100%</p>
            <p className="text-sm text-gray-600 mt-1">Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
