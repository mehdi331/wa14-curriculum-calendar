// Thin wrapper so the rest of the app can keep calling storage.get/set/delete
// the same way it did inside Claude's artifact environment, but backed by a
// real, free Firestore database instead of window.storage.
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';
const COLLECTION = 'wa14';
const ATTENDANCE_COLLECTION = 'wa14Attendance';

export const ASSESSMENT_KEYS = {
  assessments: 'wa14-assessments',
  questions: 'wa14-assessment-questions',
  attempts: 'wa14-assessment-attempts',
  attendance: 'wa14-attendance',
  manualSessionMarks: 'wa14-session-marks',
  incidents: 'wa14-assessment-incidents',
  deviceRequests: 'wa14-device-change-requests',
  analytics: 'wa14-assessment-analytics',
  academyOverview: 'wa14-academy-overview',
  historicalAcademies: 'wa-historical-academies',
};

export const ACADEMY_KEYS = {
  academyOverview: 'wa14-academy-overview',
  historicalAcademies: 'wa-historical-academies',
  // Practice teaching: collaborations (S1/P1 groups + rotation) and the
  // grade+subject learning-outcome library. Both must be listed in
  // firestore.rules or their writes are rejected silently.
  collaborations: 'wa14-collaborations',
  learningOutcomes: 'wa14-learning-outcomes',
  manualSessionMarks: 'wa14-session-marks',
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

const attendanceKey = record => JSON.stringify([String(record.sessionId), String(record.fellowId)]);

export function attendanceDocumentId(record) {
  return encodeURIComponent(attendanceKey(record));
}

export function mergeAttendanceRecords(legacyRecords, storedRecords) {
  const records = new Map();
  (Array.isArray(legacyRecords) ? legacyRecords : []).forEach(record => {
    if (record?.sessionId == null || record?.fellowId == null) return;
    records.set(attendanceKey(record), record);
  });
  (Array.isArray(storedRecords) ? storedRecords : []).forEach(record => {
    if (record?.sessionId == null || record?.fellowId == null) return;
    const key = attendanceKey(record);
    if (record.deleted) records.delete(key);
    else records.set(key, record);
  });
  return [...records.values()];
}

export async function getAttendanceRecords() {
  const [legacySnapshot, recordsSnapshot] = await Promise.all([
    getDoc(doc(db, COLLECTION, ASSESSMENT_KEYS.attendance)),
    getDocs(collection(db, ATTENDANCE_COLLECTION)),
  ]);
  let legacyRecords = [];
  if (legacySnapshot.exists() && legacySnapshot.data().value) {
    legacyRecords = JSON.parse(legacySnapshot.data().value);
    if (!Array.isArray(legacyRecords)) throw new Error('Stored attendance data is not an array.');
  }
  return mergeAttendanceRecords(legacyRecords, recordsSnapshot.docs.map(snapshot => snapshot.data()));
}

export async function saveAttendanceRecord(record) {
  if (record?.sessionId == null || record?.fellowId == null) {
    throw new Error('Attendance records require a session ID and Fellow ID.');
  }
  const { deleted, ...savedRecord } = record;
  await setDoc(doc(db, ATTENDANCE_COLLECTION, attendanceDocumentId(record)), savedRecord);
}

export async function deleteAttendanceRecord(sessionId, fellowId) {
  if (sessionId == null || fellowId == null) {
    throw new Error('Deleting attendance requires a session ID and Fellow ID.');
  }
  const record = { sessionId, fellowId };
  await setDoc(doc(db, ATTENDANCE_COLLECTION, attendanceDocumentId(record)), {
    ...record,
    deleted: true,
  });
}

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
  subscribe(key, callback, onError) {
    return onSnapshot(doc(db, COLLECTION, key), (snap) => {
      try { callback(snap.exists() ? { key, value: snap.data().value } : null); }
      catch (error) { console.error('subscribe callback failed', key, error); }
    }, (error) => {
      console.error('subscribe failed', key, error);
      if (onError) onError(error);
    });
  },
};
