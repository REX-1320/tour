import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── AI Image Generation via Pollinations (Stable Diffusion) ──────────────
async function getAiImageUrl(title, location) {
  const prompt = `Cinematic travel photography of ${title}, ${location || 'India'}, ultra realistic, high quality`;
  const encodedPrompt = encodeURIComponent(prompt);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=800&nologo=true`;
  const unsplashUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(title + " " + (location || ''))}`;

  try {
    const res = await fetch(pollinationsUrl);
    if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
      console.log(`   🎨 AI image generated via Stable Diffusion for ${title}`);
      return pollinationsUrl;
    }
  } catch (err) {
    console.warn(`   ⚠ Stable Diffusion failed for ${title}:`, err.message);
  }

  console.log(`   🔙 Falling back to Unsplash for ${title}`);
  return unsplashUrl;
}

// ─── Destination Data (no external image URLs) ───────────────
const destinations = [
  {
    title: "Taj Mahal",
    location: "Agra, Uttar Pradesh",
    price: 15000,
    rating: 5.0,
    region: "India",
    bookings: 0,
    tags: ["heritage", "romantic", "monument"],
    createdAt: "2026-01-01",
  },
  {
    title: "Golden Temple",
    location: "Amritsar, Punjab",
    price: 8000,
    rating: 4.9,
    region: "India",
    bookings: 0,
    tags: ["spiritual", "temple", "heritage"],
    createdAt: "2026-01-01",
  },
  {
    title: "Gateway of India",
    location: "Mumbai, Maharashtra",
    price: 9500,
    rating: 4.7,
    region: "India",
    bookings: 0,
    tags: ["monument", "city", "sea"],
    createdAt: "2026-01-01",
  },
  {
    title: "India Gate",
    location: "New Delhi, Delhi",
    price: 5000,
    rating: 4.6,
    region: "India",
    bookings: 0,
    tags: ["monument", "city", "history"],
    createdAt: "2026-01-01",
  },
  {
    title: "Charminar",
    location: "Hyderabad, Telangana",
    price: 6000,
    rating: 4.5,
    region: "India",
    bookings: 0,
    tags: ["monument", "city", "heritage"],
    createdAt: "2026-01-01",
  },
  {
    title: "Victoria Memorial",
    location: "Kolkata, West Bengal",
    price: 7000,
    rating: 4.6,
    region: "India",
    bookings: 0,
    tags: ["monument", "museum", "heritage"],
    createdAt: "2026-01-01",
  },
  {
    title: "Bangalore Palace",
    location: "Bengaluru, Karnataka",
    price: 8500,
    rating: 4.4,
    region: "India",
    bookings: 0,
    tags: ["palace", "city", "heritage"],
    createdAt: "2026-01-01",
  },
  {
    title: "Marina Beach",
    location: "Chennai, Tamil Nadu",
    price: 5500,
    rating: 4.3,
    region: "India",
    bookings: 0,
    tags: ["beach", "city", "sea"],
    createdAt: "2026-01-01",
  },
  {
    title: "Shimla Mall Road",
    location: "Shimla, Himachal Pradesh",
    price: 11000,
    rating: 4.7,
    region: "India",
    bookings: 0,
    tags: ["hill", "city", "nature"],
    createdAt: "2026-01-01",
  },
  {
    title: "Munnar Tea Gardens",
    location: "Munnar, Kerala",
    price: 13000,
    rating: 4.8,
    region: "India",
    bookings: 0,
    tags: ["hill", "nature", "tea"],
    createdAt: "2026-01-01",
  },
  {
    title: "Ooty Botanical Gardens",
    location: "Ooty, Tamil Nadu",
    price: 12000,
    rating: 4.6,
    region: "India",
    bookings: 0,
    tags: ["hill", "nature", "garden"],
    createdAt: "2026-01-01",
  },
  {
    title: "Leh Palace",
    location: "Leh, Ladakh",
    price: 18000,
    rating: 4.9,
    region: "India",
    bookings: 0,
    tags: ["mountain", "adventure", "palace"],
    createdAt: "2026-01-01",
  },
  {
    title: "Dal Lake",
    location: "Srinagar, Jammu and Kashmir",
    price: 16000,
    rating: 4.8,
    region: "India",
    bookings: 0,
    tags: ["lake", "nature", "romantic"],
    createdAt: "2026-01-01",
  },
  {
    title: "City Palace",
    location: "Udaipur, Rajasthan",
    price: 14000,
    rating: 4.7,
    region: "India",
    bookings: 0,
    tags: ["palace", "heritage", "lake"],
    createdAt: "2026-01-01",
  },
  {
    title: "Mehrangarh Fort",
    location: "Jodhpur, Rajasthan",
    price: 13500,
    rating: 4.8,
    region: "India",
    bookings: 0,
    tags: ["fort", "heritage", "history"],
    createdAt: "2026-01-01",
  },
  {
    title: "Jaisalmer Fort",
    location: "Jaisalmer, Rajasthan",
    price: 13000,
    rating: 4.7,
    region: "India",
    bookings: 0,
    tags: ["fort", "heritage", "desert"],
    createdAt: "2026-01-01",
  },
  {
    title: "Coorg Coffee Trails",
    location: "Karnataka, India",
    price: 12999,
    rating: 4.8,
    region: "India",
    bookings: 0,
    tags: ["hill", "nature"],
    createdAt: "2026-01-01",
  },
  {
    title: "Goa Beach Escape",
    location: "Goa, India",
    price: 6999,
    rating: 4.6,
    region: "India",
    bookings: 0,
    tags: ["beach", "party"],
    createdAt: "2026-01-01",
  },
  {
    title: "Manali Snow Retreat",
    location: "Himachal Pradesh, India",
    price: 9999,
    rating: 4.7,
    region: "India",
    bookings: 0,
    tags: ["hill", "snow"],
    createdAt: "2026-01-01",
  },
  {
    title: "Jaipur Royal Palace Tour",
    location: "Rajasthan, India",
    price: 8499,
    rating: 4.5,
    region: "India",
    bookings: 0,
    tags: ["city", "heritage"],
    createdAt: "2026-01-01",
  },
  {
    title: "Kerala Backwaters Cruise",
    location: "Kerala, India",
    price: 10999,
    rating: 4.9,
    region: "India",
    bookings: 0,
    tags: ["water", "nature"],
    createdAt: "2026-01-01",
  },
  {
    title: "Hampi Heritage Walk",
    location: "Karnataka, India",
    price: 4999,
    rating: 4.6,
    region: "India",
    bookings: 0,
    tags: ["heritage", "temple"],
    createdAt: "2026-01-01",
  },
  {
    title: "Rishikesh Adventure Camp",
    location: "Uttarakhand, India",
    price: 7999,
    rating: 4.7,
    region: "India",
    bookings: 0,
    tags: ["adventure", "river"],
    createdAt: "2026-01-01",
  },
  {
    title: "Darjeeling Tea Gardens",
    location: "West Bengal, India",
    price: 8999,
    rating: 4.8,
    region: "India",
    bookings: 0,
    tags: ["hill", "nature"],
    createdAt: "2026-01-01",
  },
  {
    title: "Andaman Island Paradise",
    location: "Andaman & Nicobar, India",
    price: 15999,
    rating: 4.9,
    region: "India",
    bookings: 0,
    tags: ["beach", "island"],
    createdAt: "2026-01-01",
  },
  {
    title: "Varanasi Spiritual Journey",
    location: "Uttar Pradesh, India",
    price: 5999,
    rating: 4.5,
    region: "India",
    bookings: 0,
    tags: ["spiritual", "temple"],
    createdAt: "2026-01-01",
  },
];

async function seed() {
  console.log("🚀 Starting bulk insert to Firestore with AI-generated images...\n");
  let successCount = 0;

  for (const dest of destinations) {
    try {
      console.log(`📍 Processing: ${dest.title}`);

      // Generate AI image for each destination
      const aiImage = await getAiImageUrl(dest.title, dest.location);

      const payload = {
        title: dest.title,
        location: dest.location,
        price: Number(dest.price),
        rating: Number(dest.rating) || 4.5,
        image: aiImage,
        region: "India",
        bookings: 0,
        tags: dest.tags || [],
        createdAt: Timestamp.fromDate(new Date(dest.createdAt)),
      };

      const docRef = await addDoc(collection(db, "destinations"), payload);
      successCount++;
      console.log(
        `   ✅ Inserted ${payload.title} (ID: ${docRef.id}) ${aiImage ? "[with AI image]" : "[no image]"}\n`
      );
    } catch (err) {
      console.error(`   ❌ Failed to insert ${dest.title}:`, err);
    }
  }

  console.log("=====================================");
  console.log(`✅ Successfully bulk inserted ${successCount} destinations with AI-generated images!`);
  process.exit(0);
}

seed();
