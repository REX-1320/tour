import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeneratedDestination {
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  region: string;
  tags: string[];
}

/**
 * Generate an AI image using Gemini Imagen 3.0 for a destination.
 * Returns a base64 data URI string, or empty string on failure.
 */
export async function generateImageBase64(title: string, location: string): Promise<string> {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');

    const prompt = `High quality, cinematic, premium travel photography of ${title}, ${location}, India. Beautiful natural lighting, rich vivid colors, inviting atmosphere, 4K resolution, professional landscape photograph.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, outputOptions: { mimeType: 'image/png' } },
        }),
      }
    );

    const data = await res.json();
    if (data.predictions?.[0]?.bytesBase64Encoded) {
      return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
    }

    console.warn('Imagen generation failed:', data.error?.message || 'Unknown error');
    return '';
  } catch (error) {
    console.error('Image generation error:', error);
    return '';
  }
}

export async function generateDestinations(): Promise<GeneratedDestination[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `Generate 3 unique and visually stunning Indian destinations for a premium tourism app.
Return ONLY a valid JSON array of objects with the following structure, and nothing else (no markdown wrapping, no \`\`\`json).
Each object must have:
- title: string (unique place name without special characters)
- location: string (state or city in India)
- price: number (price in INR per person, realistic premium price >= 5000)
- rating: number (between 4.0 and 5.0)
- image: string (valid URL or empty string)
- region: "India"
- tags: array of strings (choose from: ["beach", "hill", "temple", "city", "luxury", "nature", "adventure", "heritage", "romantic"])

Focus on diverse places perfectly suited for premium travel in India.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    
    // Validate output
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid output format: not an array");
    }

    return parsed.map((item: any) => ({
      title: item.title || "",
      location: item.location || "",
      price: Number(item.price) || 5000,
      rating: Number(item.rating) || 4.5,
      image: item.image || "",
      region: "India",
      tags: Array.isArray(item.tags) ? item.tags : []
    }));
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate destinations from Gemini");
  }
}
