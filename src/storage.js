// Thin wrapper so the rest of the app can keep calling storage.get/set/delete
// the same way it did inside Claude's artifact environment, but backed by a
// real, free Firestore database instead of window.storage.
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
const COLLECTION = 'wa14';

export const ASSESSMENT_KEYS = {
  assessments: 'wa14-assessments',
  questions: 'wa14-assessment-questions',
  attempts: 'wa14-assessment-attempts',
  attendance: 'wa14-attendance',
  analytics: 'wa14-assessment-analytics',
};

export function parseStoredArray(record) {
  if (!record?.value) return [];
  try {
    const parsed = JSON.parse(record.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export const storage = {
  async get(key) {
    const snap = await getDoc(doc(db, COLLECTION, key));
    return snap.exists() ? { key, value: snap.data().value } : null;
  },
  async set(key, value) {
    await setDoc(doc(db, COLLECTION, key), { value, updatedAt: Date.now() });
    return { key, value };
  },
  async delete(key) {
    await deleteDoc(doc(db, COLLECTION, key));
    return { key, deleted: true };
  },
};

