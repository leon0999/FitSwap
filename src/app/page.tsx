'use client';

import { useState } from 'react';
import { FoodUploader } from '@/components/FoodUploader';
import { ResultsDisplay } from '@/components/ResultsDisplay';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                F
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                FitSwap
              </h1>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-semibold hover:shadow-lg transition-all">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!analysisResult && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Swap Your Food,
              <br />
              Not Your Lifestyle
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Take a photo of your meal. Get healthier alternatives instantly.
              <br />
              <span className="font-semibold">Same taste, better health.</span>
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Users Find Better Options</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">300K+</div>
                <div className="text-sm text-gray-600">Food Database</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-gray-600">Powered</div>
              </div>
            </div>
          </div>

          {/* Upload Component */}
          <FoodUploader
            onAnalysisComplete={(result) => {
              setAnalysisResult(result);
              setIsAnalyzing(false);
            }}
            onAnalysisStart={() => setIsAnalyzing(true)}
            isAnalyzing={isAnalyzing}
          />
        </section>
      )}

      {/* Results */}
      {analysisResult && (
        <ResultsDisplay
          result={analysisResult}
          onReset={() => setAnalysisResult(null)}
        />
      )}

      {/* How It Works (Hero 하단) */}
      {!analysisResult && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">1. Upload Photo</h4>
              <p className="text-gray-600">Take or upload a photo of your meal</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">2. AI Analysis</h4>
              <p className="text-gray-600">Our AI identifies nutrition info</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">3. Get Swaps</h4>
              <p className="text-gray-600">Receive healthier alternatives</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p className="mb-4">Made with ❤️ for healthier eating</p>
            <p className="text-sm">Powered by AI • 300,000+ Foods • 100% Free</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
