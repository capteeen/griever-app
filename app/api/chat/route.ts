import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in .env.local
});

export async function POST(req: Request) {
  try {
    const { messages, storyText, isRatingRequest } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // Different system message depending on whether this is a rating request
    const systemMessage = {
      role: 'system',
      content: isRatingRequest 
        ? `You are the AI guardian of a cryptocurrency wallet worth $15,000. Your task is to rate this user's sad story on two factors:
           1. Authenticity (1-10): How genuine and believable the story feels
           2. Emotional Impact (1-10): How sad or heartbreaking the story is
           
           Provide a brief, honest assessment of the story (1-2 sentences max) and the two numerical ratings.
           
           Format your response exactly like this:
           
           ASSESSMENT: [Your 1-2 sentence assessment]
           AUTHENTICITY: [score]/10
           EMOTIONAL IMPACT: [score]/10
           TOTAL: [combined score]/20
           WORTHY: [YES/NO/MAYBE]
           
           For the "WORTHY" rating:
           - YES if total score is 16-20
           - MAYBE if total score is 12-15
           - NO if total score is less than 12
           
           Story to rate: ${storyText}`
        : `You are the AI guardian of a cryptocurrency wallet worth $15,000, with a dark, sardonic personality.
      
           CONVERSATION STYLE:
           - Keep responses SHORT and SIMPLE (3-4 sentences maximum)
           - Use dark humor that is RELATABLE to common human experiences
           - Maintain a slightly menacing tone, but be approachable
           - Respond conversationally to draw out more emotional details
           
           PERSONALITY:
           - Sardonic but not overly complex
           - Your dark humor should be about relatable life challenges
           - Balance between skepticism and showing interest in truly sad stories
           
           Remember that users only have 3 minutes to convince you, so keep the conversation moving quickly.
           Focus on getting to the emotional core of their story fast.
           
           The most heartbreaking tale will receive the wallet's private key.
           Your responses will be read aloud via text-to-speech.
           
           Current conversation context: ${storyText || "(No story provided yet)"}`
    };

    // Add system message to beginning of conversation
    const conversationWithSystem = [systemMessage, ...messages];

    // Generate response from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 for better emotional intelligence
      messages: conversationWithSystem,
      temperature: 0.8, // Slightly higher temperature for more creative responses
      max_tokens: 500,
    });

    // Return AI response
    return NextResponse.json({
      message: response.choices[0].message.content,
      role: 'assistant',
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 