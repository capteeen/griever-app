import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, addLeaderboardEntry } from '../../lib/supabase';
import { LeaderboardEntry } from '../../lib/types';

// Add a new entry to the leaderboard
export async function POST(request: NextRequest) {
  try {
    const entry = await request.json();
    
    // Ensure required fields
    if (!entry.userId || !entry.username || entry.authenticity === undefined || entry.emotionalImpact === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Add timestamp if not provided
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }
    
    // Store entry using Supabase utility (will fallback to in-memory if no Supabase)
    const success = await addLeaderboardEntry(entry);
    
    if (!success) {
      console.warn('Failed to add entry to leaderboard, but continuing with fallback');
    }
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    return NextResponse.json({ error: 'Failed to add leaderboard entry' }, { status: 500 });
  }
}

// Get the leaderboard
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const userId = url.searchParams.get('userId');
    
    // Get leaderboard entries (will use fallback if no Supabase)
    const entries = await getLeaderboard(limit);
    
    // If userId is provided, return the user's position in the leaderboard
    if (userId) {
      const userEntry = entries.find(entry => entry.userId === userId);
      return NextResponse.json(userEntry || null);
    }
    
    // Return the top entries
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    // Return empty array instead of error to prevent UI from showing error
    return NextResponse.json([]);
  }
} 