import React, { useEffect, useState } from 'react';
import { storage } from './storage';

const STATUS_KEY = 'wa14-calendar-sync-status';
const REQUEST_KEY = 'wa14-calendar-sync-request';

export default function CalendarSyncPanel({ auth }) {
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [queuedAt, setQueuedAt] = useState(0);
  const isSuperadmin = auth.role === 'superadmin' || auth.email === 'mehdi@teachforbangladesh.org';
  const completedAt = status?.completedAt ? Date.parse(status.completedAt) : 0;
  const requestPending = queuedAt > completedAt;

  useEffect(() => storage.subscribe(STATUS_KEY, record => {
    if (!record?.value) {
      setStatus(null);
      return;
    }
    try {
      setStatus(JSON.parse(record.value));
      setStatusError('');
    } catch (error) {
      console.error('Invalid calendar sync status document', error);
      setStatusError('Calendar sync status could not be read.');
    }
  }, error => {
    console.error('Calendar sync status subscription failed', error);
    setStatusError('Calendar sync status is unavailable.');
  }), []);

  const requestSync = async () => {
    setRequestError('');
    const requestedAt = Date.now();
    try {
      await storage.set(REQUEST_KEY, JSON.stringify({
        requestedAt: new Date(requestedAt).toISOString(),
        requestedBy: auth.email,
      }));
      setQueuedAt(requestedAt);
    } catch (error) {
      console.error('Calendar sync retry request failed', error);
      setRequestError('Could not queue a calendar sync. Check your access and try again.');
    }
  };

  const statusText = () => {
    if (statusError) return statusError;
    if (requestPending) return 'Manual sync queued; it runs within five minutes.';
    if (!status) return 'Calendar sync has not completed yet.';
    if (status.status === 'error') return `Last sync failed: ${status.error || 'Unknown error'}`;
    if (status.completedAt) {
      const date = new Date(status.completedAt);
      return `Last synced ${date.toLocaleString()} · ${status.calendarCount || 0} calendars · ${status.eventCount || 0} events`;
    }
    return 'Calendar sync has not completed yet.';
  };

  return (
    <aside role="status" aria-live="polite" style={{
      position: 'fixed', right: 16, bottom: 16, zIndex: 90, width: 320, maxWidth: 'calc(100vw - 32px)',
      padding: 12, borderRadius: 8, background: '#003223', border: '1px solid #2A5C4B',
      color: '#D5E0D5', boxShadow: '0 4px 16px rgba(0,0,0,.2)', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Google Calendar sync</div>
      <div style={{ color: status?.status === 'error' || statusError || requestError ? '#F4A261' : '#9DB09D', lineHeight: 1.4 }}>
        {statusText()}
      </div>
      {requestError && <div style={{ color: '#F4A261', marginTop: 4 }}>{requestError}</div>}
      {status?.status === 'error' && status.completedAt && (
        <div style={{ color: '#9DB09D', marginTop: 4 }}>Failure recorded {new Date(status.completedAt).toLocaleString()}.</div>
      )}
      {isSuperadmin && (
        <button type="button" onClick={requestSync} disabled={requestPending} className="btn-secondary" style={{ marginTop: 8, fontSize: 11 }}>
          {requestPending ? 'Sync queued…' : 'Sync now'}
        </button>
      )}
    </aside>
  );
}
