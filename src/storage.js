// Thin wrapper so the rest of the app can keep calling storage.get/set/delete
// the same way it did inside Claude's artifact environment, but backed by a
// real, free Firestore database instead of window.storage.
import { doc, getDoc, runTransaction, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';
const COLLECTION = 'wa14';

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
const attendanceRef = () => doc(db, COLLECTION, ASSESSMENT_KEYS.attendance);

function attendanceFromSnapshot(snapshot) {
  if (!snapshot.exists() || !snapshot.data().value) return [];
  const records = JSON.parse(snapshot.data().value);
  if (!Array.isArray(records)) throw new Error('Stored attendance data is not an array.');
  return records;
}

export async function getAttendanceRecords() {
  return attendanceFromSnapshot(await getDoc(attendanceRef()));
}

export async function createAttendanceRecord(record) {
  if (record?.sessionId == null || record?.fellowId == null) {
    throw new Error('Attendance records require a session ID and Fellow ID.');
  }
  return runTransaction(db, async transaction => {
    const ref = attendanceRef();
    const records = attendanceFromSnapshot(await transaction.get(ref));
    const key = attendanceKey(record);
    if (records.some(existing => attendanceKey(existing) === key)) return false;
    transaction.set(ref, {
      value: JSON.stringify([...records, record]),
      updatedAt: Date.now(),
    });
    return true;
  });
}

export function mergeAttendanceChanges(currentRecords, previousRecords, nextRecords) {
  const previousByKey = new Map((previousRecords || []).map(record => [attendanceKey(record), record]));
  const nextByKey = new Map((nextRecords || []).map(record => [attendanceKey(record), record]));
  const changed = [...nextByKey].filter(([key, record]) => JSON.stringify(previousByKey.get(key)) !== JSON.stringify(record));
  const removedKeys = new Set([...previousByKey.keys()].filter(key => !nextByKey.has(key)));
  const changedByKey = new Map(changed);
  return [
    ...(currentRecords || []).filter(record => !changedByKey.has(attendanceKey(record)) && !removedKeys.has(attendanceKey(record))),
    ...changed.map(([, record]) => record),
  ];
}

export async function saveAttendanceChanges(previousRecords, nextRecords) {
  const previousByKey = new Map((previousRecords || []).map(record => [attendanceKey(record), record]));
  const nextByKey = new Map((nextRecords || []).map(record => [attendanceKey(record), record]));
  if (JSON.stringify([...previousByKey]) === JSON.stringify([...nextByKey])) return;

  await runTransaction(db, async transaction => {
    const ref = attendanceRef();
    const records = attendanceFromSnapshot(await transaction.get(ref));
    const merged = mergeAttendanceChanges(records, previousRecords, nextRecords);
    transaction.set(ref, { value: JSON.stringify(merged), updatedAt: Date.now() });
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
