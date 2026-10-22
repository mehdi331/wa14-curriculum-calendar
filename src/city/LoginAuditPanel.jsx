import React, { useEffect, useState } from 'react';
import {
  formatDeviceDescription,
  formatLoginAuditSystem,
  formatLoginAuditType,
} from './loginAuditModel.js';
import { removeExpiredLoginAudit, subscribeToLoginAudit } from './loginAudit.js';

const card = { background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: '12px 16px' };
const muted = { color: '#9DB09D', fontSize: 12 };

function formatTimestamp(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : null;
  return date ? date.toLocaleString() : 'Timestamp pending';
}

export default function LoginAuditPanel() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [cleanupMessage, setCleanupMessage] = useState('Removing records older than 30 days when possible…');

  useEffect(() => {
    let live = true;
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToLoginAudit(records => {
        if (!live) return;
        setEvents(records);
        setLoaded(true);
        setError('');
      }, auditError => {
        if (!live) return;
        setLoaded(true);
        setError(auditError.message || 'Sign-in history could not be loaded.');
      });
    } catch (auditError) {
      setLoaded(true);
      setError(auditError.message || 'Sign-in history could not be loaded.');
    }
    removeExpiredLoginAudit().then(count => {
      if (live) {
        setCleanupMessage(count
          ? `${count} expired record${count === 1 ? '' : 's'} removed. Cleanup is limited to 250 records each time this tab opens.`
          : 'No expired records needed removal.');
      }
    }).catch(cleanupError => {
      console.error('Expired sign-in audit records could not be removed', cleanupError);
      if (live) setCleanupMessage('History loaded, but expired records could not be cleaned up. Check Firestore admin permissions.');
    });
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);

  return (
    <section>
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 5 }}>App sign-in history</div>
        <div style={muted}>Recent app events, separate from the live “Who’s online” list. Events and device details are client-reported and best-effort, not tamper-proof. Browser, platform and device type are approximate; this does not collect IP address or location.</div>
        <div style={{ ...muted, marginTop: 8 }}>{cleanupMessage}</div>
      </div>
      {error && <div role="alert" style={{ ...card, color: '#ffd2c9', marginBottom: 12 }}>{error}</div>}
      {!loaded && !error && <div style={muted}>Loading sign-in history…</div>}
      {loaded && !error && events.length === 0 && <div style={muted}>No app sign-in events have been recorded yet.</div>}
      {events.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 680 }}>
            <thead>
              <tr style={{ color: '#9DB09D', textAlign: 'left' }}>
                {['When', 'Account', 'Event', 'System', 'Reported device'].map(label => (
                  <th key={label} style={{ borderBottom: '1px solid #2A5C4B', padding: '8px 10px' }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #174735', whiteSpace: 'nowrap' }}>{formatTimestamp(event.createdAt)}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #174735' }}>{event.email || 'Unknown account'}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #174735' }}>{formatLoginAuditType(event.type)}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #174735' }}>{formatLoginAuditSystem(event.system)}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #174735' }}>{formatDeviceDescription(event)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
