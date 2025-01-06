// app/api/generate/route.js
import { exec } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url, category } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    return new Promise((resolve) => {
      exec(
        `python scripts/brochure.py "${url}" "${category}"`,
        { maxBuffer: 1024 * 1024 }, // 1MB buffer
        (error, stdout, stderr) => {
          if (error) {
            resolve(NextResponse.json({ error: error.message }, { status: 500 }));
            return;
          }
          if (stderr) {
            resolve(NextResponse.json({ error: stderr }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ content: stdout }));
        }
      );
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


/*
// app/api/generate/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export async function POST(request) {
  try {
    const { url, category } = await request.json();

    // Fetch website content
    const response = await fetch(url);
    const html = await response.text();

    // Use OpenAI to generate brochure
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a HTML generator. 
          Generate ONLY pure HTML content. 
          Do not include any explanation text, markdown symbols, or code block markers.
          Start directly with <!DOCTYPE html> and end with </html>.
          Do not add any text before or after the HTML content.`
        },
        {
          role: "user",
          content: `Create a professional brochure in HTML format for this website content: ${html}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error generating brochure' }, { status: 500 });
  }
}
  
*/