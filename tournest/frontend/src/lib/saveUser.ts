import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Saves a new user document to Firestore on first login.
 * Skips silently if the document already exists.
 */
export async function saveUser(user: User): Promise<void> {
  if (!user?.uid) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    // Only create if the document doesn't already exist
    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email || null,
        phone: user.phoneNumber || null,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
      console.log('[TourNest] New user profile created in Firestore:', user.uid);
    }
  } catch (error) {
    // Non-blocking — auth still works even if Firestore write fails
    console.error('[TourNest] Failed to save user profile:', error);
  }
}
