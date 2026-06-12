import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

async function migrateImages() {
  console.log("🚀 Starting database migration: Updating to Stable Diffusion/Unsplash URLs...\n");

  const destinationsRef = collection(db, "destinations");
  const snapshot = await getDocs(destinationsRef);
  
  console.log(`Found ${snapshot.size} total destinations.`);

  let successCount = 0;

  for (const docSnapshot of snapshot.docs) {
    const dest = docSnapshot.data();
    const id = docSnapshot.id;

    console.log(`📍 Processing: ${dest.title} (ID: ${id})`);
    
    // Check if it already has a Pollinations URL
    if (dest.image && dest.image.includes('pollinations.ai')) {
       console.log(`   ⏭️ Skipping: ${dest.title} (Already updated with Stable Diffusion)`);
       continue;
    }
    
    // Check if it has a base64 or empty image which previously failed 
    // We will update it unconditionally since the goal is to attach realistic URL images.
    const newImage = await getAiImageUrl(dest.title, dest.location);

    try {
      const docRef = doc(db, "destinations", id);
      await updateDoc(docRef, { image: newImage });
      console.log(`   ✅ Successfully updated ${dest.title} with image URL.`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed to update ${dest.title} in Firestore:`, error);
    }
  }

  console.log("\n=====================================");
  console.log(`✅ Migration Complete! Updated: ${successCount} destinations.`);
  process.exit(0);
}

migrateImages();
