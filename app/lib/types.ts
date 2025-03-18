export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StoryRating {
  userId: string;
  username: string;
  storyExcerpt: string; // A short excerpt of the story, 50-100 chars
  authenticity: number; // 1-10
  emotionalImpact: number; // 1-10
  total: number; // Sum of authenticity and emotionalImpact
  worthy: 'YES' | 'NO' | 'MAYBE';
  timestamp: number;
}

export interface UserSession {
  id: string;
  username: string;
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
  rating?: StoryRating;
}

export interface LeaderboardEntry extends StoryRating {
  rank?: number;
} 