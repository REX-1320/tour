import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc, Timestamp } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export async function POST(req: Request) {
  try {
    // 1. Check total documents stop condition
    const destinationsRef = collection(db, 'destinations');
    const snapshot = await getDocs(destinationsRef);
    if (snapshot.size >= 100) {
      return NextResponse.json({ message: 'Max limit of 100 destinations reached. Stopping generation.' }, { status: 400 });
    }

    // 2. Map existing titles to avoid duplicates
    const existingTitles = new Set(snapshot.docs.map(doc => (doc.data().title || '').toLowerCase()));

    // 3. Prompt Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `Generate 3 unique and visually stunning Indian destinations for a premium tourism app.
Return ONLY a valid JSON array of objects with the following structure, and nothing else (no markdown wrapping, no \`\`\`json).
Each object must have:
- title: string (unique place name without special characters)
- location: string (state or city in India)
- price: number (price in INR per person, realistic premium price >= 5000)
- rating: number (between 4.0 and 5.0)
- tags: array of strings (choose from: ["beach", "hill", "temple", "city", "luxury", "nature", "adventure", "heritage", "romantic"])

Focus on diverse places perfectly suited for premium travel in India.`;

    let generatedPlaces = [];
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      generatedPlaces = JSON.parse(text);
    } catch (genErr) {
      console.error("Gemini Generation Error:", genErr);
      return NextResponse.json({ error: "Failed to generate content from Gemini" }, { status: 500 });
    }

    let addedCount = 0;
    const addedPlaces = [];

    for (const place of generatedPlaces) {
      // 4. Check duplicate
      if (!place.title || existingTitles.has(place.title.toLowerCase())) {
        continue;
      }
      
      // 5. Image Handling with Stable Diffusion (Pollinations) or Unsplash fallback
      let imageUrl = "";
      const prompt = `Cinematic travel photography of ${place.title}, ${place.location}, ultra realistic, high quality`;
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&nologo=true`;
      const unsplashUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(place.title + " " + place.location)}`;

      try {
        const res = await fetch(pollinationsUrl);
        if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
            imageUrl = pollinationsUrl;
        } else {
            console.warn("Pollinations failed, using Unsplash fallback");
            imageUrl = unsplashUrl;
        }
      } catch(err) {
        console.error("Image request failed", err);
        imageUrl = unsplashUrl;
      }

      // 6. Store in Firestore
      const newDocRef = doc(collection(db, 'destinations'));
      const newPlace = {
        title: place.title,
        location: place.location,
        price: Number(place.price) || null,
        rating: place.rating,
        image: imageUrl,
        region: 'India',
        bookings: 0,
        tags: place.tags || [],
        createdAt: Timestamp.now()
      };

      await setDoc(newDocRef, newPlace);
      addedPlaces.push(newPlace);
      existingTitles.add(place.title.toLowerCase());
      addedCount++;

      // stop if we hit 100
      if (snapshot.size + addedCount >= 100) break;
    }

    return NextResponse.json({
      message: `Successfully generated and added ${addedCount} destinations.`,
      places: addedPlaces
    });
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
