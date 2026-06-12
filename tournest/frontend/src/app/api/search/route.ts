import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Basic fallback search (no AI)
function fallbackSearch(places: any[], query: string) {
  const term = query.toLowerCase();
  return places.filter(p => {
    const title = (p.title || '').toLowerCase();
    const location = (p.location || '').toLowerCase();
    const region = (p.region || '').toLowerCase();
    const tags = (p.tags || []).map((t: string) => t.toLowerCase());
    return (
      title.includes(term) ||
      location.includes(term) ||
      region.includes(term) ||
      tags.some((t: string) => t.includes(term)) ||
      term.split(' ').some((w: string) => w.length > 2 && (title.includes(w) || location.includes(w) || tags.some((t: string) => t.includes(w))))
    );
  });
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ results: [], message: 'Please enter a search query.' });
    }

    // 1. Fetch all destinations safely
    let allPlaces: any[] = [];
    try {
      const snapshot = await getDocs(collection(db, 'destinations'));
      allPlaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (fbErr) {
      console.error("Firestore Error in Search:", fbErr);
      return NextResponse.json({ results: [], message: 'Database error. Showing empty results.' });
    }

    // 2. AI intent extraction via Gemini
    let intent: any = null;
    try {
      const intentPrompt = `You are a search intent parser for a tourism app. The user searched: "${query}"

Your job:
1. Correct any spelling mistakes in the query.
2. Extract structured search intent.

Respond ONLY in valid JSON (no markdown):
{
  "correctedQuery": "the corrected search string",
  "region": "specific region/state/city if mentioned, or null",
  "tags": ["category tags like beach, hill, temple, city, luxury, nature, adventure, heritage, romantic"],
  "budget": "low | medium | high | null",
  "keywords": ["other important keywords for matching"]
}

Rules:
- region should be a place name (e.g. "Goa", "Karnataka", "Kerala", "India"), or null if not specified.
- tags should be tourism categories extracted from the query.
- budget: "low" if user says cheap/budget/affordable, "high" if luxury/expensive/premium, else null.
- keywords: any other words useful for matching titles/locations.`;

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      const completion = await model.generateContent(intentPrompt);
      let text = completion.response.text();
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      intent = JSON.parse(text);
    } catch (err) {
      console.error('Gemini intent extraction failed, using fallback:', err);
    }

    let results: any[];

    if (intent) {
      // 3. Smart matching with AI-extracted intent
      const scored = allPlaces.map(place => {
        let score = 0;
        const pTitle = (place.title || '').toLowerCase();
        const pLocation = (place.location || '').toLowerCase();
        const pRegion = (place.region || '').toLowerCase();
        const pTags = (place.tags || []).map((t: string) => t.toLowerCase());
        const pPrice = place.price || 0;

        // Region match (strong signal)
        if (intent.region) {
          const r = intent.region.toLowerCase();
          if (pRegion.includes(r) || pLocation.includes(r)) score += 30;
          if (pTitle.includes(r)) score += 10;
        }

        // Tag match
        if (intent.tags && intent.tags.length > 0) {
          for (const tag of intent.tags) {
            const t = tag.toLowerCase();
            if (pTags.includes(t)) score += 20;
            if (pTitle.includes(t)) score += 5;
            if (pLocation.includes(t)) score += 5;
          }
        }

        // Budget match
        if (intent.budget === 'low' && pPrice <= 8000) score += 15;
        else if (intent.budget === 'high' && pPrice >= 15000) score += 15;
        else if (intent.budget === 'medium' && pPrice > 8000 && pPrice < 15000) score += 10;

        // Keyword partial match
        if (intent.keywords && intent.keywords.length > 0) {
          for (const kw of intent.keywords) {
            const k = kw.toLowerCase();
            if (k.length < 3) continue;
            if (pTitle.includes(k)) score += 10;
            if (pLocation.includes(k)) score += 8;
            if (pTags.some((t: string) => t.includes(k))) score += 6;
          }
        }

        // Corrected query partial match (fallback safety net)
        if (intent.correctedQuery) {
          const words = intent.correctedQuery.toLowerCase().split(/\s+/);
          for (const w of words) {
            if (w.length < 3) continue;
            if (pTitle.includes(w)) score += 4;
            if (pLocation.includes(w)) score += 3;
          }
        }

        return { ...place, _score: score };
      });

      // Filter scored > 0/sort descending, take top 5
      results = scored.filter(p => p._score > 0).sort((a, b) => b._score - a._score).slice(0, 5);

      // If AI filtering gives nothing, fallback to basic search with corrected query
      if (results.length === 0) {
        const fallbackQuery = intent.correctedQuery || query;
        results = fallbackSearch(allPlaces, fallbackQuery).slice(0, 5);
      }
    } else {
      // 4. Pure fallback (AI failed)
      results = fallbackSearch(allPlaces, query).slice(0, 5);
    }

    // Clean output (remove internal score)
    const cleanResults = results.map(({ _score, ...rest }) => rest);

    return NextResponse.json({
      results: cleanResults,
      intent: intent || null,
      message: cleanResults.length === 0 ? 'No results found. Try another search.' : `Found ${cleanResults.length} result(s).`
    });
  } catch (error: any) {
    console.error('Error in /api/search:', error);
    return NextResponse.json({ error: error.message, results: [] }, { status: 500 });
  }
}
