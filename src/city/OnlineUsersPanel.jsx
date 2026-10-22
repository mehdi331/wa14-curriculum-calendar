import React, { useEffect, useState } from 'react';
import { subscribeToCalendarPresence } from './calendarPresence.js';
import {
  formatLastActive,
  formatPresenceRole,
  formatPresenceSystem,
  groupOnlinePresence,
} from './presenceModel.js';

export default function OnlineUsersPanel({ roster, planners }) {
  const [presenceRecords, setPresenceRecords] = useState([]);
  const [presenceLoaded, setPresenceLoaded] = useState(false);
  const [presenceError, setPresenceError] = useState('');
  const [presenceRetry, setPresenceRetry] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => subscribeToCalendarPresence(records => {
    setPresenceRecords(records);
    setPresenceLoaded(true);
    setPresenceError('');
  }, error => {
    console.error('Online users could not be loaded', error);
    setPresenceLoaded(true);
    setPresenceError('Online users could not be loaded. Check your connection or access, then try again.');
  }), [presenceRetry]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15 * 1000);
    return () => clearInterval(interval);
  }, []);

  const profiles = new Map();
  (roster || []).forEach(person => {
    if (person.email) profiles.set(String(person.email).toLowerCase(), { name: person.name, role: 'fellow' });
  });
  (planners || []).forEach(person => {
    if (person.email) profiles.set(String(person.email).toLowerCase(), { name: person.name, role: person.role });
  });
  const onlineUsers = groupOnlinePresence(presenceRecords, now).map(user => {
    const profile = profiles.get(user.email.toLowerCase());
    return profile ? { ...user, name: profile.name || user.name, role: profile.role || user.role } : user;
  });

  return (
    <section>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Currently online across systems</div>
      <div style={{ fontSize: 12, color: '#9DB09D', marginBottom: 12 }}>Staff and Fellows active in the last 2 minutes, in City or Winter Academy.</div>
      {presenceError
        ? <div role="alert" style={{ color: '#FFD1C5', fontSize: 12.5 }}>
          {presenceError}{' '}
          <button type="button" onClick={() => { setPresenceLoaded(false); setPresenceError(''); setPresenceRetry(value => value + 1); }} style={{ color: '#fff', textDecoration: 'underline', background: 'none', border: 0, cursor: 'pointer' }}>Retry</button>
        </div>
        : !presenceLoaded
          ? <div style={{ color: '#9DB09D', fontSize: 12.5 }}>Loading online users…</div>
          : onlineUsers.length === 0
            ? <div style={{ color: '#9DB09D', fontSize: 12.5 }}>No users are currently online.</div>
            : <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ color: '#9DB09D', textAlign: 'left', borderBottom: '1px solid #2A5C4B' }}>
                    <th style={{ padding: '8px 10px' }}>Name</th>
                    <th style={{ padding: '8px 10px' }}>Role</th>
                    <th style={{ padding: '8px 10px' }}>System</th>
                    <th style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineUsers.map(user => (
                    <tr key={user.uid} style={{ borderBottom: '1px solid #1F4A3C' }}>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ fontWeight: 700 }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: '#9DB09D' }}>{user.email}</div>
                      </td>
                      <td style={{ padding: '9px 10px' }}>{formatPresenceRole(user.role)}</td>
                      <td style={{ padding: '9px 10px' }}>{user.systems.map(formatPresenceSystem).join(' · ')}</td>
                      <td style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>
                        {formatLastActive(user.lastActive, now)}
                        {user.sessionCount > 1 && <div style={{ fontSize: 11, color: '#9DB09D' }}>{user.sessionCount} active sessions</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
    </section>
  );
}
