import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
async function test() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });
  const prompt = \
Here are the available destinations in our database:
- Taj Mahal in Agra (₹15000, Rating: 5)
- Goa Beach Escape in Goa (₹6999, Rating: 4.6)
Follow these instructions strictly:
1. Respond to the user's latest message contextually and helpfully in the "message" field.
2. Recommend relevant destinations from the database if appropriate by including them in the "results" array.
FORMAT EXACTLY AS: { "message": "string", "results": [ { "title": "string", "location": "string", "price": 0, "rating": 0 } ] }
Conversation History:
User: I want to go to a beach in India.
\;
  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
