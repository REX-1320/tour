import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'key');
async function test() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });
  const prompt = 'User: I want to visit a nice beach in India. Context Destinations: Kerala Backwaters Cruise, Goa Beach Escape. Format strictly: { \
message\: \desc\, \results\: [ { \title\: \Dest\, \location\: \Loc\, \price\: 123, \rating\: 4.0 } ] }';
  try {
    const r = await model.generateContent(prompt);
    console.log(r.response.text());
  } catch(e) { console.error(e); }
}
test();
