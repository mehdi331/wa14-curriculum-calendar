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
const rosterRef = () => doc(db, COLLECTION, 'wa14-roster');

function attendanceFromSnapshot(snapshot) {
  if (!snapshot.exists() || !snapshot.data().value) return [];
  const records = JSON.parse(snapshot.data().value);
  if (!Array.isArray(records)) throw new Error('Stored attendance data is not an array.');
  return records;
}

function rosterFromSnapshot(snapshot) {
  if (!snapshot.exists() || !snapshot.data().value) return [];
  const roster = JSON.parse(snapshot.data().value);
  if (!Array.isArray(roster)) throw new Error('Stored Fellow roster is not an array.');
  return roster;
}

export function filterExcludedAttendanceRecords(records, roster) {
  const excludedIds = new Set((roster || [])
    .filter(fellow => fellow.excludeFromAnalysis === true)
    .map(fellow => String(fellow.id)));
  return (records || []).filter(record => !excludedIds.has(String(record.fellowId)));
}

export async function getAttendanceRecords() {
  return runTransaction(db, async transaction => {
    const roster = rosterFromSnapshot(await transaction.get(rosterRef()));
    const ref = attendanceRef();
    const records = attendanceFromSnapshot(await transaction.get(ref));
    const filtered = filterExcludedAttendanceRecords(records, roster);
    if (filtered.length !== records.length) {
      transaction.set(ref, { value: JSON.stringify(filtered), updatedAt: Date.now() });
    }
    return filtered;
  });
}

export async function createAttendanceRecord(record) {
  if (record?.sessionId == null || record?.fellowId == null) {
    throw new Error('Attendance records require a session ID and Fellow ID.');
  }
  return runTransaction(db, async transaction => {
    const ref = attendanceRef();
    const roster = rosterFromSnapshot(await transaction.get(rosterRef()));
    const fellow = roster.find(item => String(item.id) === String(record.fellowId));
    if (fellow?.excludeFromAnalysis === true) return 'excluded';
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

export async function setFellowAnalysisOptOut(fellowId, excluded, nextRoster) {
  if (fellowId == null) throw new Error('An opt-out update requires a Fellow ID.');
  const updatedRoster = (nextRoster || []).map(fellow => String(fellow.id) === String(fellowId)
    ? { ...fellow, excludeFromAnalysis: excluded === true }
    : fellow);
  if (!updatedRoster.some(fellow => String(fellow.id) === String(fellowId))) {
    throw new Error('The Fellow to update was not found in the roster.');
  }

  return runTransaction(db, async transaction => {
    const rosterDocument = rosterRef();
    const attendanceDocument = attendanceRef();
    const [rosterSnapshot, attendanceSnapshot] = await Promise.all([
      transaction.get(rosterDocument),
      transaction.get(attendanceDocument),
    ]);
    const storedRoster = rosterFromSnapshot(rosterSnapshot);
    if (!storedRoster.some(fellow => String(fellow.id) === String(fellowId))) {
      throw new Error('The Fellow to update was not found in the saved roster.');
    }
    const storedAttendance = attendanceFromSnapshot(attendanceSnapshot);
    const updatedAttendance = excluded === true
      ? storedAttendance.filter(record => String(record.fellowId) !== String(fellowId))
      : storedAttendance;
    transaction.set(rosterDocument, {
      value: JSON.stringify(updatedRoster),
      updatedAt: Date.now(),
    });
    transaction.set(attendanceDocument, {
      value: JSON.stringify(updatedAttendance),
      updatedAt: Date.now(),
    });
    return { roster: updatedRoster, attendance: updatedAttendance };
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
  if (JSON.stringify([...previousByKey]) === JSON.stringify([...nextByKey])) return nextRecords || [];

  return runTransaction(db, async transaction => {
    const ref = attendanceRef();
    const roster = rosterFromSnapshot(await transaction.get(rosterRef()));
    const records = attendanceFromSnapshot(await transaction.get(ref));
    const merged = filterExcludedAttendanceRecords(
      mergeAttendanceChanges(records, previousRecords, nextRecords),
      roster,
    );
    transaction.set(ref, { value: JSON.stringify(merged), updatedAt: Date.now() });
    return merged;
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
