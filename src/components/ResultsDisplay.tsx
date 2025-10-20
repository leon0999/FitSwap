/**
 * ResultsDisplay Component
 * 분석 결과 + 대체품 표시
 */

'use client';

interface ResultsDisplayProps {
  result: {
    image: string;
    recognition: any;
    nutrition: any;
    alternatives: any[];
    original: any;
  };
  onReset: () => void;
}

export function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const { image, recognition, nutrition, alternatives, original } = result;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <button
        onClick={onReset}
        className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Analyze Another Food
      </button>

      {/* Original Food Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Your Food</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 이미지 */}
          <div>
            <img
              src={image}
              alt={recognition.foodName}
              className="w-full h-64 object-cover rounded-xl shadow-md"
            />
            <div className="mt-4 flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {recognition.category}
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {Math.round(recognition.confidence * 100)}% Confidence
              </div>
            </div>
          </div>

          {/* 영양 정보 */}
          <div>
            <h3 className="text-xl font-bold mb-4">{recognition.foodName}</h3>
            {recognition.brand && (
              <p className="text-gray-600 mb-4">{recognition.brand}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Calories</p>
                <p className="text-3xl font-bold text-red-600">{original?.calories || nutrition?.calories || 'N/A'}</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="text-3xl font-bold text-orange-600">
                  {original?.healthScore || nutrition?.healthScore || 'N/A'}/100
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-2xl font-bold text-purple-600">
                  {original?.protein || nutrition?.protein || 'N/A'}g
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Fat</p>
                <p className="text-2xl font-bold text-blue-600">
                  {original?.fat || nutrition?.fat || 'N/A'}g
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center">
          🌟 Healthier Alternatives
        </h2>

        {alternatives && alternatives.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500"
              >
                {/* 절감 배지 */}
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm text-green-600 font-semibold">
                    {alt.caloriesSavedPercent}% fewer calories
                  </span>
                </div>

                {/* 음식 정보 */}
                <h3 className="text-lg font-bold mb-2">{alt.name}</h3>
                {alt.brand && (
                  <p className="text-gray-600 text-sm mb-4">{alt.brand}</p>
                )}

                {/* 영양 정보 */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Calories</span>
                    <span className="text-sm font-bold">{alt.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Health Score</span>
                    <span className="text-sm font-bold text-green-600">
                      {alt.healthScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Protein</span>
                    <span className="text-sm font-bold">{alt.protein}g</span>
                  </div>
                </div>

                {/* 추천 이유 */}
                <div className="bg-green-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">{alt.reason}</p>
                </div>

                {/* CTA */}
                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Find Near Me
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600">No alternatives found. Try another food!</p>
          </div>
        )}
      </div>

      {/* Premium CTA */}
      <div className="mt-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-12 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to eat healthier?</h3>
        <p className="text-xl mb-8 opacity-90">
          Get unlimited swaps, personalized meal plans, and more!
        </p>
        <button className="px-8 py-4 bg-white text-green-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl">
          Start Free Trial - $9.99/month
        </button>
      </div>
    </div>
  );
}
