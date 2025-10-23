/**
 * POST /api/restaurants
 *
 * 근처 레스토랑 검색 API
 *
 * Body:
 * {
 *   "foodName": "grilled chicken salad",
 *   "latitude": 37.7749,
 *   "longitude": -122.4194
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyRestaurants } from '@/lib/maps/google-places';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { foodName, latitude, longitude, radius } = body;

    if (!foodName || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'foodName, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const restaurants = await searchNearbyRestaurants({
      foodName,
      latitude,
      longitude,
      radius: radius || 5000, // 기본 5km
    });

    return NextResponse.json({
      success: true,
      restaurants,
      count: restaurants.length,
    });
  } catch (error) {
    console.error('[API] Restaurant search error:', error);
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    );
  }
}
