import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json(); // array of {role, content}
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }
    const lastUserMessage = messages[messages.length - 1].content;

    // Fetch places from Firestore to provide context to Gemini and for fallback
    let dbPlaces: any[] = [];
    try {
      const destQuery = collection(db, 'destinations');
      const snapshot = await getDocs(destQuery);
      dbPlaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (fbError) {
      console.error("Firestore Fetch Error in Chatbot:", fbError);
    }

    // Prepare top 3 destinations for fallback
    const fallbackResults = [...dbPlaces].sort((a, b) => ((b.bookings || 0) - (a.bookings || 0)) || ((b.rating || 0) - (a.rating || 0))).slice(0, 3).map(p => ({
      title: p.title || "Amazing Location",
      location: p.location || "India",
      price: Number(p.price) || 5000,
      rating: Number(p.rating) || 4.5
    }));

    const defaultFallback = {
      message: "Here are some popular destinations you might love!",
      results: fallbackResults.length > 0 ? fallbackResults : []
    };

    // Chat History string
    const historyPrompt = messages.map((m: any) => `${m.role === 'bot' ? 'Assistant' : 'User'}: ${m.content}`).join('\n');
    
    // Available places context string
    const placesContext = dbPlaces.map(p => `- ${p.title} in ${p.location} (₹${p.price}, Rating: ${p.rating})`).join('\n');

    const prompt = `You are a travel assistant. Return ONLY JSON. No explanation text.
Here are the available destinations in our database:
${placesContext}

Follow these instructions strictly:
1. Respond to the user's latest message contextually and helpfully in the "message" field.
2. Recommend relevant destinations from the database if appropriate by including them in the "results" array.
3. If no recommendation is needed, leave "results" as an empty array [].
4. ONLY return a valid JSON object.

FORMAT EXACTLY AS:
{
  "message": "your helpful response string",
  "results": [
    {
      "title": "Exact Title of place from database",
      "location": "Location string",
      "price": number,
      "rating": number
    }
  ]
}

Conversation History:
${historyPrompt}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    let parsed = defaultFallback;

    try {
      const chatCompletion = await model.generateContent(prompt);
      let text = chatCompletion.response.text();
      console.log("AI RAW (chat):", text);

      // Try to extract a JSON object from the model output in case it included
      // markdown fences or extra framing text. This makes parsing more robust.
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      let jsonText = cleaned;

      // If direct parse fails, try to grab the first {...} block
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          jsonText = match[0];
          try {
            parsed = JSON.parse(jsonText);
          } catch (err2) {
            console.error('JSON extraction parse failed:', err2);
            throw parseErr; // fall through to outer catch and use fallback
          }
        } else {
          throw parseErr; // nothing to extract
        }
      }
      console.log("PARSED (chat):", parsed);

      // Validate structure to be absolutely safe
      if (typeof parsed.message !== 'string') {
         parsed.message = defaultFallback.message;
      }
      if (!Array.isArray(parsed.results)) {
         parsed.results = [];
      } else {
         // ensure each item is structurally sound
         parsed.results = parsed.results.map((r: any) => ({
           title: r.title || "Destination",
           location: r.location || "Location",
           price: Number(r.price) || 0,
           rating: Number(r.rating) || 0
         }));
      }
    } catch (err) {
      console.error("AI Generation or Parsing Error in chat:", err);
      console.log("Falling back to top 3 destinations from Firestore.");
      parsed = defaultFallback;
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // Never break UI, return safe fallback
    return NextResponse.json({
      message: "Here are some popular destinations you might love!",
      results: []
    }, { status: 200 }); 
  }
}
