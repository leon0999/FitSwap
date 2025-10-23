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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* 이미지 */}
          <div>
            <img
              src={image}
              alt={recognition.foodName}
              className="w-full h-72 object-cover rounded-lg"
            />
            <div className="mt-4 flex items-center gap-2">
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                {recognition.category}
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                {Math.round(recognition.confidence * 100)}% confident
              </div>
            </div>
          </div>

          {/* 영양 정보 */}
          <div>
            {/* 음식 이름 - 크게! */}
            <h3 className="text-3xl font-bold mb-2 text-gray-900">{recognition.foodName || original?.name}</h3>
            {recognition.brand && (
              <p className="text-lg text-gray-600 mb-6">{recognition.brand}</p>
            )}

            {/* Tier 1: 다이어트 핵심 영양소 (크게) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-1">Calories</p>
                <p className="text-4xl font-bold text-gray-900">{original?.calories || nutrition?.calories || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-1">Protein</p>
                <p className="text-4xl font-bold text-gray-900">
                  {original?.protein || nutrition?.protein || 'N/A'}<span className="text-2xl text-gray-500">g</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-1">Carbs</p>
                <p className="text-4xl font-bold text-gray-900">
                  {original?.carbs || nutrition?.carbs || 'N/A'}<span className="text-2xl text-gray-500">g</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-1">Fat</p>
                <p className="text-4xl font-bold text-gray-900">
                  {original?.fat || nutrition?.fat || 'N/A'}<span className="text-2xl text-gray-500">g</span>
                </p>
              </div>
            </div>

            {/* Tier 2: 중요 영양소 (중간 크기) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Sugar</p>
                <p className="text-xl font-semibold text-gray-900">
                  {original?.sugar || nutrition?.sugar || 'N/A'}<span className="text-sm text-gray-500">g</span>
                </p>
              </div>

              <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Fiber</p>
                <p className="text-xl font-semibold text-gray-900">
                  {original?.fiber || nutrition?.fiber || 'N/A'}<span className="text-sm text-gray-500">g</span>
                </p>
              </div>

              <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Sodium</p>
                <p className="text-xl font-semibold text-gray-900">
                  {original?.sodium || nutrition?.sodium || 'N/A'}<span className="text-sm text-gray-500">mg</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Healthier Alternatives
        </h2>

        {alternatives && alternatives.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-green-500 transition-all"
              >
                {/* 절감 배지 */}
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {alt.caloriesSavedPercent}% fewer calories
                </div>

                {/* 음식 이름 - 크게! */}
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{alt.name}</h3>
                {alt.brand && (
                  <p className="text-gray-600 text-sm mb-4">{alt.brand}</p>
                )}

                {/* 핵심 영양소 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Calories</p>
                    <p className="text-2xl font-bold text-gray-900">{alt.calories}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Protein</p>
                    <p className="text-2xl font-bold text-gray-900">{alt.protein}<span className="text-sm text-gray-500">g</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Carbs</p>
                    <p className="text-2xl font-bold text-gray-900">{alt.carbs}<span className="text-sm text-gray-500">g</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Fat</p>
                    <p className="text-2xl font-bold text-gray-900">{alt.fat}<span className="text-sm text-gray-500">g</span></p>
                  </div>
                </div>

                {/* 추천 이유 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">{alt.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600">No healthier alternatives found for this food.</p>
          </div>
        )}
      </div>
    </div>
  );
}
