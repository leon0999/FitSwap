/**
 * ResultsDisplay Component
 * 분석 결과 + 대체품 표시
 */

'use client';

import { useState, useEffect } from 'react';

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

  // 음식 사진 저장 (foodName → photoUrl)
  const [foodPhotos, setFoodPhotos] = useState<Map<string, string>>(new Map());
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // 추천 음식 사진 로드
  useEffect(() => {
    if (alternatives && alternatives.length > 0) {
      loadFoodPhotos();
    }
  }, [alternatives]);

  async function loadFoodPhotos() {
    const photoMap = new Map<string, string>();

    for (const alt of alternatives) {
      try {
        const res = await fetch(`/api/food-photo?name=${encodeURIComponent(alt.name)}`);
        const data = await res.json();

        if (data.success && data.photo) {
          photoMap.set(alt.name, data.photo.url);
        }
      } catch (error) {
        console.error(`Failed to load photo for ${alt.name}:`, error);
      }
    }

    setFoodPhotos(photoMap);
  }

  function handleFindNearMe(alt: any) {
    setSelectedFood(alt);
    setShowMapModal(true);
  }

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

            {/* Health Score v2 */}
            {(original?.healthScoreV2 || nutrition?.healthScoreV2) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Score v2</h4>

                {/* Score & Tier */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-green-700">
                        {original?.healthScoreV2?.total || nutrition?.healthScoreV2?.total}
                      </span>
                      <span className="text-2xl text-gray-500">/100</span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          (original?.healthScoreV2?.tier || nutrition?.healthScoreV2?.tier) === 'Excellent'
                            ? 'bg-green-600 text-white'
                            : (original?.healthScoreV2?.tier || nutrition?.healthScoreV2?.tier) === 'Great'
                            ? 'bg-green-500 text-white'
                            : (original?.healthScoreV2?.tier || nutrition?.healthScoreV2?.tier) === 'Good'
                            ? 'bg-yellow-500 text-white'
                            : (original?.healthScoreV2?.tier || nutrition?.healthScoreV2?.tier) === 'Fair'
                            ? 'bg-orange-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {original?.healthScoreV2?.tier || nutrition?.healthScoreV2?.tier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Nutrition Score</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {original?.healthScoreV2?.nutritionScore || nutrition?.healthScoreV2?.nutritionScore}
                      <span className="text-sm text-blue-500">/50</span>
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium mb-1">Quality Score</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {original?.healthScoreV2?.qualityScore || nutrition?.healthScoreV2?.qualityScore}
                      <span className="text-sm text-purple-500">/50</span>
                    </p>
                  </div>
                </div>

                {/* Quality Badges */}
                {(original?.healthScoreV2?.badges || nutrition?.healthScoreV2?.badges)?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Quality Attributes:</p>
                    <div className="flex flex-wrap gap-2">
                      {(original?.healthScoreV2?.badges || nutrition?.healthScoreV2?.badges).map((badge: any, index: number) => (
                        <div
                          key={index}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-700 border border-${badge.color}-300`}
                          title={badge.description}
                        >
                          <span>{badge.emoji}</span>
                          <span>{badge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-green-500 transition-all"
              >
                {/* 음식 사진 */}
                {foodPhotos.has(alt.name) ? (
                  <div className="relative w-full h-48 bg-gray-100">
                    <img
                      src={foodPhotos.get(alt.name)}
                      alt={alt.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 절감 배지 (사진 위에) */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {alt.caloriesSavedPercent}% fewer calories
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading image...</div>
                  </div>
                )}

                {/* 카드 내용 */}
                <div className="p-6">
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

                  {/* Health Score v2 (Compact) */}
                  {alt.healthScoreV2 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-green-700">
                            {alt.healthScoreV2.total}
                          </span>
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alt.healthScoreV2.tier === 'Excellent'
                              ? 'bg-green-600 text-white'
                              : alt.healthScoreV2.tier === 'Great'
                              ? 'bg-green-500 text-white'
                              : alt.healthScoreV2.tier === 'Good'
                              ? 'bg-yellow-500 text-white'
                              : alt.healthScoreV2.tier === 'Fair'
                              ? 'bg-orange-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {alt.healthScoreV2.tier}
                        </span>
                      </div>

                      {/* Quality Badges (Compact) */}
                      {alt.healthScoreV2.badges && alt.healthScoreV2.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {alt.healthScoreV2.badges.map((badge: any, badgeIdx: number) => (
                            <span
                              key={badgeIdx}
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-700 border border-${badge.color}-300`}
                              title={badge.description}
                            >
                              {badge.emoji}
                              <span className="text-xs">{badge.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 추천 이유 */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800 font-medium">{alt.reason}</p>
                  </div>

                  {/* Find Near Me 버튼 */}
                  <button
                    onClick={() => handleFindNearMe(alt)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Find Near Me
                  </button>
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

      {/* 지도 모달 */}
      {showMapModal && selectedFood && (
        <MapModal
          food={selectedFood}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
}

/**
 * 지도 모달 컴포넌트
 */
interface MapModalProps {
  food: any;
  onClose: () => void;
}

function MapModal({ food, onClose }: MapModalProps) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      // 사용자 위치 가져오기
      const location = await getUserLocation();
      setUserLocation(location);

      // 레스토랑 검색
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: food.name,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRestaurants(data.restaurants);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  }

  async function getUserLocation(): Promise<{ lat: number; lng: number }> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      // 기본 위치 (San Francisco)
      return { lat: 37.7749, lng: -122.4194 };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // 기본 위치
          resolve({ lat: 37.7749, lng: -122.4194 });
        }
      );
    });
  }

  function formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Near You</h3>
              <p className="text-gray-600 mt-1">Restaurants serving {food.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 레스토랑 목록 */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Finding restaurants near you...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="space-y-4">
              {restaurants.map((restaurant, idx) => (
                <a
                  key={idx}
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{restaurant.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>
                      <div className="flex items-center gap-3">
                        {/* 평점 */}
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">
                            {restaurant.rating} ({restaurant.userRatingsTotal})
                          </span>
                        </div>

                        {/* 거리 */}
                        {restaurant.distance && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {formatDistance(restaurant.distance)}
                          </div>
                        )}

                        {/* 영업 여부 */}
                        {restaurant.openNow !== undefined && (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${restaurant.openNow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {restaurant.openNow ? 'Open' : 'Closed'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 화살표 */}
                    <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-600">No restaurants found nearby.</p>
              <p className="text-sm text-gray-500 mt-2">Try expanding your search radius.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
