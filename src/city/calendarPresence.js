import { useEffect, useRef } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { PRESENCE_ONLINE_WINDOW_MS } from './presenceModel.js';

const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const PRESENCE_COLLECTION = 'calendarPresence';

function newSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function timestampMillis(timestamp) {
  return typeof timestamp?.toMillis === 'function' ? timestamp.toMillis() : Number(timestamp);
}

export function subscribeToCalendarPresence(onUsers, onError) {
  return onSnapshot(collection(db, PRESENCE_COLLECTION), snapshot => {
    onUsers(snapshot.docs.map(item => item.data()));
  }, onError);
}

export function useCalendarPresence(auth, system, enabled, clearPresenceRef) {
  const latest = useRef({ auth, system });
  const publishRef = useRef(null);
  const previousState = useRef({ uid: auth?.uid, system });
  latest.current = { auth, system };
  const email = auth?.email;
  const name = auth?.name;
  const role = auth?.role;

  useEffect(() => {
    if (!enabled || !auth?.uid) return undefined;

    const uid = auth.uid;
    const id = newSessionId();
    const sessionRef = doc(db, PRESENCE_COLLECTION, `${uid}_${id}`);
    let disposed = false;
    let stopped = false;
    let writing = false;
    let refreshQueued = false;
    let currentWrite = Promise.resolve();

    const publish = async () => {
      if (disposed) return;
      if (writing) {
        refreshQueued = true;
        return;
      }
      writing = true;
      const current = latest.current;
      currentWrite = (async () => {
        try {
          await setDoc(sessionRef, {
            uid,
            email: current.auth.email,
            name: current.auth.name || current.auth.email,
            role: current.auth.role || 'staff',
            system: current.system || 'system_picker',
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Calendar presence heartbeat failed', error);
        } finally {
          writing = false;
          if (refreshQueued && !disposed) {
            refreshQueued = false;
            void publish();
          }
        }
      })();
      await currentWrite;
    };
    publishRef.current = publish;
    void publish();
    const interval = setInterval(() => { void publish(); }, HEARTBEAT_INTERVAL_MS);
    const stop = async () => {
      if (stopped) return;
      stopped = true;
      disposed = true;
      clearInterval(interval);
      try {
        await currentWrite;
        await deleteDoc(sessionRef);
      } catch (error) {
        console.error('Calendar presence session could not be cleared', error);
      }
    };
    clearPresenceRef.current = stop;

    const pruneOwnStaleSessions = async () => {
      try {
        const ownSessions = await getDocs(query(
          collection(db, PRESENCE_COLLECTION),
          where('uid', '==', uid),
        ));
        const cutoff = Date.now() - PRESENCE_ONLINE_WINDOW_MS;
        await Promise.all(ownSessions.docs
          .filter(item => timestampMillis(item.data().updatedAt) < cutoff)
          .map(item => deleteDoc(item.ref)));
      } catch (error) {
        console.error('Stale calendar presence sessions could not be removed', error);
      }
    };
    void pruneOwnStaleSessions();

    return () => {
      if (clearPresenceRef.current === stop) clearPresenceRef.current = null;
      publishRef.current = null;
      void stop();
    };
  }, [auth?.uid, enabled, clearPresenceRef]);

  useEffect(() => {
    const changed = previousState.current.uid === auth?.uid
      && previousState.current.system !== system;
    previousState.current = { uid: auth?.uid, system };
    if (!changed) return;
    if (enabled) publishRef.current?.();
  }, [auth?.uid, enabled, system, email, name, role]);
}
