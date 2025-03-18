import { NextRequest, NextResponse } from 'next/server';
import { createSession, updateSession, getSession } from '../../lib/supabase';

// Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;
    
    // Create a new session using Supabase utility (will fallback to in-memory if no Supabase)
    const session = await createSession(username || 'Anonymous User');
    
    if (!session) {
      // Create a minimal fallback session if even the fallback mechanism fails
      const fallbackSession = {
        id: crypto.randomUUID(),
        username: username || 'Anonymous User',
        startTime: Date.now(),
        isCompleted: false
      };
      return NextResponse.json(fallbackSession, { status: 201 });
    }
    
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    // Create a minimal fallback session on error
    const fallbackSession = {
      id: crypto.randomUUID(),
      username: 'Anonymous User',
      startTime: Date.now(),
      isCompleted: false
    };
    return NextResponse.json(fallbackSession, { status: 201 });
  }
}

// Update an existing session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    // Update session using Supabase utility (will fallback to in-memory if no Supabase)
    const success = await updateSession(id, updateData);
    
    if (!success) {
      console.warn('Session not found or update failed. Using basic response.');
      // Return a basic success response even on failure to prevent UI errors
      return NextResponse.json({ 
        id, 
        ...updateData,
        fallback: true 
      });
    }
    
    // Get the updated session
    const updatedSession = await getSession(id);
    
    if (!updatedSession) {
      return NextResponse.json({ 
        id, 
        ...updateData,
        fallback: true 
      });
    }
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    // Return a minimal response to prevent UI errors
    return NextResponse.json({ success: false, fallback: true });
  }
}

// Get a session by ID
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    // Get session using Supabase utility (will fallback to in-memory if no Supabase)
    const session = await getSession(id);
    
    if (!session) {
      // Return a minimal fallback session if not found
      const fallbackSession = {
        id,
        username: 'Anonymous User',
        startTime: Date.now(),
        isCompleted: false,
        fallback: true
      };
      return NextResponse.json(fallbackSession);
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    // Return a minimal fallback session on error
    const fallbackSession = {
      id: request.nextUrl.searchParams.get('id') || crypto.randomUUID(),
      username: 'Anonymous User',
      startTime: Date.now(),
      isCompleted: false,
      fallback: true
    };
    return NextResponse.json(fallbackSession);
  }
} 