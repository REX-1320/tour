import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'key');
async function test() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = 'User: I want to visit a nice beach in India. Context Destinations: Kerala Backwaters Cruise, Goa Beach Escape. Format strictly: { "message": "hello", "results": [{"title": "Goa Beach Escape", "location": "Goa", "price": 6999, "rating": 4.6}] } Return ONLY JSON output without markdown wrapper';
  try {
    const r = await model.generateContent(prompt);
    let txt = r.response.text(); 
    console.log(txt.replace(/`json/gi, '').replace(/`/g, '').trim());
  } catch(e) { console.error(e); }
}
test();
