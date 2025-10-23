/**
 * FoodUploader Component
 * 프로급 이미지 업로드 + AI 분석
 */

'use client';

import { useState, useRef } from 'react';

interface FoodUploaderProps {
  onAnalysisComplete: (result: any) => void;
  onAnalysisStart: () => void;
  isAnalyzing: boolean;
}

export function FoodUploader({
  onAnalysisComplete,
  onAnalysisStart,
  isAnalyzing,
}: FoodUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 드래그 이벤트
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // 드롭 이벤트
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // 파일 처리
  const handleFile = async (file: File) => {
    // 1. 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 2. 분석 시작
    onAnalysisStart();

    try {
      // Base64 변환
      const base64 = await fileToBase64(file);

      // 3. AI 음식 인식
      const recognitionRes = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64 }),
      });

      if (!recognitionRes.ok) {
        throw new Error('AI recognition failed');
      }

      const recognitionData = await recognitionRes.json();
      console.log('[Upload] Recognition:', recognitionData);

      // 4. 영양 정보 조회
      const nutritionRes = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName: recognitionData.foodName }),
      });

      if (!nutritionRes.ok) {
        throw new Error('Nutrition lookup failed');
      }

      const nutritionData = await nutritionRes.json();
      console.log('[Upload] Nutrition:', nutritionData);

      // 5. 대체품 추천
      const alternativesRes = await fetch('/api/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: recognitionData.foodName,
          category: recognitionData.category,
          ingredients: recognitionData.ingredients, // NEW!
          servingSize: recognitionData.servingSize, // NEW!
          isHomemade: recognitionData.isHomemade, // NEW!
        }),
      });

      if (!alternativesRes.ok) {
        throw new Error('Alternatives lookup failed');
      }

      const alternativesData = await alternativesRes.json();
      console.log('[Upload] Alternatives:', alternativesData);

      // 6. 결과 통합
      onAnalysisComplete({
        image: base64,
        recognition: recognitionData,
        nutrition: nutritionData.results[0],
        alternatives: alternativesData.alternatives,
        original: alternativesData.original,
      });
    } catch (error) {
      console.error('[Upload] Failed:', error);
      alert('Analysis failed. Please try again.');
      setPreview(null);
      onAnalysisComplete(null);
    }
  };

  // 파일 → Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center
          transition-all cursor-pointer
          ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white/50 hover:border-green-400 hover:bg-green-50/50'}
          ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {isAnalyzing ? (
          /* 로딩 상태 */
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-lg font-semibold text-gray-700">Analyzing your food...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          </div>
        ) : preview ? (
          /* 미리보기 */
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-lg"
            />
            <p className="text-sm text-gray-600">Click to change image</p>
          </div>
        ) : (
          /* 업로드 프롬프트 */
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Upload or drag & drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WebP up to 10MB
              </p>
            </div>

            <button className="mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-semibold hover:shadow-lg transition-all">
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* 샘플 이미지 (테스트용) */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">Try with a sample image:</p>
        <div className="flex gap-4 justify-center">
          {['🍔 Burger', '🍕 Pizza', '🥗 Salad'].map((sample) => (
            <button
              key={sample}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-green-500 hover:bg-green-50 transition-colors"
              onClick={() => alert('Sample images coming soon!')}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
