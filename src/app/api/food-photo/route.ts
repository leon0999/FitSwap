/**
 * GET /api/food-photo?name=grilled%20chicken%20salad
 *
 * 음식 사진 검색 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchFoodPhoto } from '@/lib/images/unsplash';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const foodName = searchParams.get('name');

    if (!foodName) {
      return NextResponse.json(
        { error: 'Food name is required' },
        { status: 400 }
      );
    }

    const photo = await searchFoodPhoto(foodName);

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error('[API] Food photo error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food photo' },
      { status: 500 }
    );
  }
}
