// Thin wrapper so the rest of the app can keep calling storage.get/set/delete
// the same way it did inside Claude's artifact environment, but backed by a
// real, free Firestore database instead of window.storage.
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';
const COLLECTION = 'wa14';

export const ASSESSMENT_KEYS = {
  assessments: 'wa14-assessments',
  questions: 'wa14-assessment-questions',
  attempts: 'wa14-assessment-attempts',
  attendance: 'wa14-attendance',
  incidents: 'wa14-assessment-incidents',
  deviceRequests: 'wa14-device-change-requests',
  analytics: 'wa14-assessment-analytics',
  academyOverview: 'wa14-academy-overview',
  historicalAcademies: 'wa-historical-academies',
};

export const ACADEMY_KEYS = {
  academyOverview: 'wa14-academy-overview',
  historicalAcademies: 'wa-historical-academies',
};

// [CITY] keys for the City system (year-round fellowship calendar). These docs
// live beside the existing wa14-* docs; firestore.rules must list them under
// the planner-writable docId list.
export const CITY_KEYS = {
  citySessions: 'wa14-city-sessions',
  cityStaffTasks: 'wa14-city-staff-tasks',
  citySettings: 'wa14-city-settings',
  cityTypes: 'wa14-city-types',
  cityModes: 'wa14-city-modes',
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
  subscribe(key, callback) {
    return onSnapshot(doc(db, COLLECTION, key), (snap) => {
      try { callback(snap.exists() ? { key, value: snap.data().value } : null); }
      catch (error) { console.error('subscribe callback failed', key, error); }
    }, (error) => { console.error('subscribe failed', key, error); });
  },
};

