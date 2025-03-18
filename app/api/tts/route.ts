import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

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
      // Create directory if it doesn't exist
      if (!fs.existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true });
        console.log(`Created directory: ${publicDir}`);
      }

      // Check if file already exists to avoid regenerating
      if (fs.existsSync(filePath)) {
        console.log(`Audio file already exists: ${filePath}`);
        return NextResponse.json({
          audioUrl: publicPath,
        });
      }

      // Try to generate the speech using OpenAI's TTS API
      console.log(`Generating speech with OpenAI for text: ${text.substring(0, 50)}...`);
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",  // Using 'onyx' for a deeper, more menacing voice
        input: text,
        speed: 0.92,    // Slightly slower for dramatic effect
      });

      // Convert the response to a Buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Write the file
      await writeFile(filePath, buffer);
      console.log(`Successfully wrote audio file: ${filePath}`);

      // Return the public URL to the generated audio file
      return NextResponse.json({
        audioUrl: publicPath,
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