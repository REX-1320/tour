import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';

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

type DestinationDoc = {
  title?: string;
  location?: string;
  region?: string;
  image?: string;
  price?: number;
  rating?: number;
  tags?: string[];
  shortDescription?: string;
  fullDescription?: string;
  famousFor?: string[];
  highlights?: string[];
  bestTimeToVisit?: string;
  weather?: string;
  culture?: string;
  food?: string[];
  activities?: string[];
  nearbyPlaces?: string[];
  travelTips?: string[];
  howToReach?: { air?: string; rail?: string; road?: string };
  stayOptions?: string[];
  budgetBreakdown?: { hotel?: string; food?: string; transport?: string };
  itinerary?: Array<{ day: number; title: string; activities: string[] }>;
  gallery?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  updatedAt?: unknown;
};

const defaultFood = ['Local thali', 'Street snacks', 'Seasonal dessert'];
const defaultActivities = ['Guided sightseeing', 'Nature walk', 'Photography'];
const defaultNearby = ['Historic market', 'Scenic viewpoint', 'Local museum'];
const defaultTips = ['Carry light layers for evenings.', 'Start early to avoid crowds.', 'Respect local customs at religious sites.'];
const defaultStay = ['Boutique hotels', 'Luxury resorts', 'Heritage stays'];

function buildProfile(dest: DestinationDoc) {
  const title = dest.title || 'This destination';
  const location = dest.location || 'India';

  return {
    shortDescription: `${title} in ${location} offers a premium mix of heritage, culture, and scenic escapes.`,
    fullDescription: `${title} is a carefully curated experience with immersive landscapes, local traditions, and signature viewpoints. From sunrise walks to curated dining, the destination blends slow travel with memorable highlights, making it ideal for short luxury breaks and longer explorations alike.`,
    famousFor: dest.tags && dest.tags.length > 0 ? dest.tags : ['heritage', 'nature', 'local culture'],
    highlights: ['Iconic viewpoints', 'Signature local experiences', 'Handpicked premium stays'],
    bestTimeToVisit: 'October to March for pleasant weather and clear skies.',
    weather: 'Mild mornings, warm afternoons, cooler nights. Light layers recommended.',
    culture: 'Vibrant traditions, artisan crafts, and seasonal festivals define the local culture.',
    food: defaultFood,
    activities: defaultActivities,
    nearbyPlaces: defaultNearby,
    travelTips: defaultTips,
    howToReach: {
      air: 'Nearest airport with 2-4 hours transfer by road.',
      rail: 'Nearest railhead connected to regional hubs.',
      road: 'Well-connected highways with scenic routes.',
    },
    stayOptions: defaultStay,
    budgetBreakdown: {
      hotel: 'Premium stays from INR 6000 to INR 12000 per night.',
      food: 'Dining averages INR 1200 to INR 2500 per day.',
      transport: 'Local transfers from INR 1000 to INR 2500 per day.',
    },
    itinerary: [
      {
        day: 1,
        title: 'Arrival and local discovery',
        activities: ['Check in and relax', 'Visit the main promenade', 'Sunset viewpoint and dinner'],
      },
      {
        day: 2,
        title: 'Signature experiences',
        activities: ['Guided cultural walk', 'Local food tasting', 'Evening leisure or spa'],
      },
      {
        day: 3,
        title: 'Nature and departure',
        activities: ['Morning trail or lake visit', 'Brunch and shopping', 'Depart with souvenirs'],
      },
    ],
    gallery: dest.image ? [dest.image] : [],
    faqs: [
      { question: 'How many days are ideal here?', answer: 'Two to three days cover the main highlights comfortably.' },
      { question: 'Is it suitable for families?', answer: 'Yes, the destination is family-friendly with easy-paced activities.' },
      { question: 'What should I pack?', answer: 'Pack light layers, comfortable shoes, and a light rain jacket.' },
    ],
  };
}

function shouldReplaceArray(value: unknown) {
  return !Array.isArray(value) || value.length === 0;
}

function shouldReplaceText(value: unknown) {
  return typeof value !== 'string' || value.trim().length === 0;
}

function shouldReplaceObject(value: unknown) {
  return !value || typeof value !== 'object';
}

async function run() {
  const snapshot = await getDocs(collection(db, 'destinations'));
  const updates: Promise<void>[] = [];

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data() as DestinationDoc;
    const profile = buildProfile(data);
    const updatePayload: Partial<DestinationDoc> = {};

    if (shouldReplaceText(data.shortDescription)) updatePayload.shortDescription = profile.shortDescription;
    if (shouldReplaceText(data.fullDescription)) updatePayload.fullDescription = profile.fullDescription;
    if (shouldReplaceArray(data.famousFor)) updatePayload.famousFor = profile.famousFor;
    if (shouldReplaceArray(data.highlights)) updatePayload.highlights = profile.highlights;
    if (shouldReplaceText(data.bestTimeToVisit)) updatePayload.bestTimeToVisit = profile.bestTimeToVisit;
    if (shouldReplaceText(data.weather)) updatePayload.weather = profile.weather;
    if (shouldReplaceText(data.culture)) updatePayload.culture = profile.culture;
    if (shouldReplaceArray(data.food)) updatePayload.food = profile.food;
    if (shouldReplaceArray(data.activities)) updatePayload.activities = profile.activities;
    if (shouldReplaceArray(data.nearbyPlaces)) updatePayload.nearbyPlaces = profile.nearbyPlaces;
    if (shouldReplaceArray(data.travelTips)) updatePayload.travelTips = profile.travelTips;
    if (shouldReplaceObject(data.howToReach)) updatePayload.howToReach = profile.howToReach;
    if (shouldReplaceArray(data.stayOptions)) updatePayload.stayOptions = profile.stayOptions;
    if (shouldReplaceObject(data.budgetBreakdown)) updatePayload.budgetBreakdown = profile.budgetBreakdown;
    if (shouldReplaceArray(data.itinerary)) updatePayload.itinerary = profile.itinerary;
    if (shouldReplaceArray(data.gallery)) updatePayload.gallery = profile.gallery;
    if (shouldReplaceArray(data.faqs)) updatePayload.faqs = profile.faqs;

    if (Object.keys(updatePayload).length > 0) {
      updatePayload.updatedAt = Timestamp.now() as any;
      const ref = doc(db, 'destinations', docSnap.id);
      updates.push(setDoc(ref, updatePayload, { merge: true }));
    }
  });

  await Promise.all(updates);
  console.log(`Updated ${updates.length} destination documents.`);
}

run().catch((error) => {
  console.error('Destination data generation failed:', error);
  process.exit(1);
});
