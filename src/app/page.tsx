'use client';

import { useState } from 'react';
import { FoodUploader } from '@/components/FoodUploader';
import { ResultsDisplay } from '@/components/ResultsDisplay';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                F
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                FitSwap
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!analysisResult && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Find Healthier
              <br />
              Food Alternatives
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload a food photo. Get accurate nutrition analysis and healthier alternatives.
            </p>
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

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>AI-powered nutrition analysis • USDA database</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
