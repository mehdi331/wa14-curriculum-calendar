// Thin wrapper so the rest of the app can keep calling storage.get/set/delete
// the same way it did inside Claude's artifact environment, but backed by a
// real, free Firestore database instead of window.storage.
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
const COLLECTION = 'wa14';

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

// Personal, per-browser data (just the "who am I logged in as" auth token)
// doesn't need to be shared, so it stays in plain localStorage — no Firestore
// round trip needed for that.
export const localAuth = {
  get() {
    try {
      const raw = localStorage.getItem('wa14-auth');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },
  set(value) {
    try { localStorage.setItem('wa14-auth', JSON.stringify(value)); } catch (e) {}
  },
  clear() {
    try { localStorage.removeItem('wa14-auth'); } catch (e) {}
  },
};
