# GRIEVER App

A Matrix-like, futuristic application where users submit sad stories to an AI guardian of a cryptocurrency wallet. The AI evaluates each story's emotional impact and responds with either encouragement (for compelling stories) or dark humor (for less impactful submissions). The most heartbreaking tale ultimately receives the wallet's private key worth $15,000.

## Features

- Matrix-inspired UI with digital rain animation
- AI-powered conversation with OpenAI's text-to-speech responses
- Story submission and evaluation system
- 3-minute time limit for user conversations
- Leaderboard showing top-ranked stories
- Supabase integration for data persistence (with in-memory fallback)
- Cryptocurrency wallet integration
- Solana token contract information

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- An OpenAI API key with access to both chat completions and TTS APIs
- A Supabase account and project (optional - app works without this)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/griever-app.git
cd griever-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your OpenAI API key to `.env.local`
   - Add your Supabase credentials to `.env.local` (optional)

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here

# Optional - app works without these
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

4. Set up Supabase tables (optional - app will work with in-memory storage if Supabase is not configured):
   - Create a `leaderboard` table with the following schema:
     ```sql
     create table leaderboard (
       id uuid default uuid_generate_v4() primary key,
       userId text not null unique,
       username text not null,
       storyExcerpt text not null,
       authenticity integer not null,
       emotionalImpact integer not null,
       total integer not null,
       worthy text not null,
       timestamp bigint not null
     );
     ```
   - Create a `sessions` table with the following schema:
     ```sql
     create table sessions (
       id uuid primary key,
       username text not null,
       startTime bigint not null,
       endTime bigint,
       isCompleted boolean not null default false,
       rating jsonb
     );
     ```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Setting Up the OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/signup) and sign up for an account.
2. Navigate to the API keys section in your account dashboard.
3. Create a new API key and copy it.
4. Paste the API key in your `.env.local` file as shown above.

**Note:** This application uses both OpenAI's Chat Completions API and Text-to-Speech API. Ensure your API key has access to both services and your account has sufficient credits.

## Setting Up Supabase (Optional)

The app includes a fallback mechanism that stores data in memory if Supabase is not configured. This is perfect for testing or development. However, for production use, it's recommended to set up Supabase for persistent data storage.

1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to the SQL Editor in your Supabase dashboard
4. Run the SQL commands provided above to create the necessary tables
5. Navigate to Project Settings > API to find your project URL and API keys
6. Add these credentials to your `.env.local` file

## Data Storage Options

The app provides two options for data storage:

1. **In-Memory Storage**: 
   - No setup required
   - Data is lost when the server restarts
   - Good for development and testing

2. **Supabase Storage**:
   - Requires Supabase setup
   - Data persists between server restarts
   - Suitable for production environments

The app automatically falls back to in-memory storage if Supabase credentials are not provided.

## Project Structure

- `app/` - Next.js app directory
  - `api/` - API routes for backend functionality
    - `chat/` - API route for OpenAI chat completions
    - `tts/` - API route for OpenAI text-to-speech
    - `leaderboard/` - API route for managing leaderboard data
    - `session/` - API route for managing user sessions
  - `components/` - Reusable UI components
  - `conversation/` - Conversation page with the AI
  - `lib/` - Utility functions and shared code
    - `supabase.ts` - Supabase client and database helpers
    - `types.ts` - TypeScript type definitions
- `public/` - Static assets
  - `audio/` - Generated speech files (not committed to git)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the APIs used for the AI guardian and text-to-speech
- Supabase for the backend database
- Next.js team for the amazing framework
- The Matrix for inspiration
