import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  classifyDevice,
  LOGIN_AUDIT_CLEANUP_LIMIT,
  LOGIN_AUDIT_PAGE_SIZE,
  LOGIN_AUDIT_RETENTION_MS,
} from './loginAuditModel.js';

const AUDIT_COLLECTION = 'loginAudit';
const AUDIT_TYPES = new Set(['session_start', 'system_enter', 'system_switch', 'sign_out']);
const AUDIT_SYSTEMS = new Set(['winter_academy', 'city', 'system_picker', 'unknown']);

export async function recordLoginAudit(auth, type, system) {
  if (!db) throw new Error('Firestore is not configured; the sign-in audit event was not recorded.');
  if (!auth?.uid || !auth?.email) throw new Error('A verified signed-in identity is required for audit events.');
  if (!AUDIT_TYPES.has(type)) throw new Error(`Unsupported sign-in audit event: ${type}`);
  const activeSystem = AUDIT_SYSTEMS.has(system) ? system : 'unknown';
  const device = classifyDevice(navigator.userAgent, navigator.platform || '');
  return addDoc(collection(db, AUDIT_COLLECTION), {
    uid: auth.uid,
    email: auth.email,
    type,
    system: activeSystem,
    ...device,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToLoginAudit(onEvents, onError) {
  if (!db) throw new Error('Firestore is not configured; sign-in audit history is unavailable.');
  const auditQuery = query(
    collection(db, AUDIT_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(LOGIN_AUDIT_PAGE_SIZE),
  );
  return onSnapshot(auditQuery, snapshot => {
    onEvents(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
  }, onError);
}

export async function removeExpiredLoginAudit(now = Date.now()) {
  if (!db) throw new Error('Firestore is not configured; expired audit events could not be removed.');
  const cutoff = Timestamp.fromMillis(now - LOGIN_AUDIT_RETENTION_MS);
  const expired = await getDocs(query(
    collection(db, AUDIT_COLLECTION),
    where('createdAt', '<', cutoff),
    orderBy('createdAt', 'asc'),
    limit(LOGIN_AUDIT_CLEANUP_LIMIT),
  ));
  const batch = writeBatch(db);
  expired.docs.forEach(item => batch.delete(item.ref));
  if (!expired.empty) await batch.commit();
  return expired.size;
}
