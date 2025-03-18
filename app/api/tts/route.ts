import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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

    // Generate a unique filename
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const filename = `${hash}.mp3`;
    const publicDir = path.join(process.cwd(), 'public', 'audio');
    const filePath = path.join(publicDir, filename);
    const publicPath = `/audio/${filename}`;

    try {
      // Try to generate the speech using OpenAI's TTS API
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",  // Using 'onyx' for a deeper, more menacing voice
        input: text,
        speed: 0.92,    // Slightly slower for dramatic effect
      });

      // Convert the response to a Buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Ensure the directory exists
      await writeFile(filePath, buffer);

      // Return the public URL to the generated audio file
      return NextResponse.json({
        audioUrl: publicPath,
      });
    } catch (error) {
      console.error('Error generating speech with OpenAI:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error processing TTS request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 