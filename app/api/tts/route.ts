import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    try {
      console.log(`Generating speech with OpenAI for text: ${text.substring(0, 50)}...`);
      
      // Try to generate the speech using OpenAI's TTS API
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",  // Using 'onyx' for a deeper, more menacing voice
        input: text,
        speed: 0.92,    // Slightly slower for dramatic effect
      });

      // Convert the response to a Buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      // Return the audio data directly as base64
      const base64Audio = buffer.toString('base64');
      console.log('Successfully generated speech audio');

      // Return the base64 audio data
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Content-Disposition': 'inline'
        }
      });
    } catch (error: any) {
      console.error('Error generating speech with OpenAI:', error);
      // Include more detailed error information
      return NextResponse.json(
        { 
          error: 'Failed to generate speech',
          message: error.message || 'Unknown error',
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing TTS request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 