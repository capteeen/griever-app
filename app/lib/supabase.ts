import { createClient } from '@supabase/supabase-js';
import { LeaderboardEntry, StoryRating, UserSession } from './types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Fallback data for when Supabase is not configured
let fallbackLeaderboard: LeaderboardEntry[] = [];
let fallbackSessions: UserSession[] = [];

const hasSupabaseCredentials = supabaseUrl && supabaseKey && supabaseUrl.length > 0 && supabaseKey.length > 0;

// Create Supabase client only if credentials are available
const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!hasSupabaseCredentials) {
  console.warn('Missing Supabase credentials. Using in-memory storage instead.');
}

// Leaderboard functions
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    if (!hasSupabaseCredentials || !supabase) {
      // Return fallback data if Supabase is not configured
      return fallbackLeaderboard
        .sort((a, b) => b.total - a.total)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Add rank to each entry
    return data.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function addLeaderboardEntry(entry: StoryRating): Promise<boolean> {
  try {
    if (!hasSupabaseCredentials || !supabase) {
      // Store in fallback data if Supabase is not configured
      const existingEntryIndex = fallbackLeaderboard.findIndex(e => e.userId === entry.userId);
      
      if (existingEntryIndex >= 0) {
        // Only update if new score is higher
        if (entry.total > fallbackLeaderboard[existingEntryIndex].total) {
          fallbackLeaderboard[existingEntryIndex] = {
            ...entry,
            rank: 0 // Rank will be calculated when retrieving
          };
        }
      } else {
        // Add new entry
        fallbackLeaderboard.push({
          ...entry,
          rank: 0 // Rank will be calculated when retrieving
        });
      }
      
      return true;
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('userId', entry.userId)
      .single();
    
    // If user already exists, only update if new score is higher
    if (data) {
      if (entry.total > data.total) {
        const { error: updateError } = await supabase
          .from('leaderboard')
          .update({
            username: entry.username,
            storyExcerpt: entry.storyExcerpt,
            authenticity: entry.authenticity,
            emotionalImpact: entry.emotionalImpact,
            total: entry.total,
            worthy: entry.worthy,
            timestamp: entry.timestamp
          })
          .eq('userId', entry.userId);
        
        if (updateError) throw updateError;
      }
    } else {
      // Insert new entry
      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([entry]);
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    return false;
  }
}

// Session functions
export async function createSession(username: string): Promise<UserSession | null> {
  try {
    const sessionId = crypto.randomUUID();
    const session: UserSession = {
      id: sessionId,
      username: username || 'Anonymous User',
      startTime: Date.now(),
      isCompleted: false
    };
    
    if (!hasSupabaseCredentials || !supabase) {
      // Store in fallback data if Supabase is not configured
      fallbackSessions.push(session);
      return session;
    }
    
    const { error } = await supabase
      .from('sessions')
      .insert([session]);
    
    if (error) throw error;
    
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function updateSession(
  sessionId: string, 
  update: Partial<UserSession>
): Promise<boolean> {
  try {
    if (!hasSupabaseCredentials || !supabase) {
      // Update fallback data if Supabase is not configured
      const sessionIndex = fallbackSessions.findIndex(s => s.id === sessionId);
      if (sessionIndex >= 0) {
        fallbackSessions[sessionIndex] = {
          ...fallbackSessions[sessionIndex],
          ...update
        };
        return true;
      }
      return false;
    }
    
    const { error } = await supabase
      .from('sessions')
      .update(update)
      .eq('id', sessionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating session:', error);
    return false;
  }
}

export async function getSession(sessionId: string): Promise<UserSession | null> {
  try {
    if (!hasSupabaseCredentials || !supabase) {
      // Get from fallback data if Supabase is not configured
      return fallbackSessions.find(s => s.id === sessionId) || null;
    }
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    
    return data as UserSession;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export default supabase; 