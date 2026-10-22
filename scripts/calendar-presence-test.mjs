import assert from 'node:assert/strict';
import {
  formatLastActive,
  formatPresenceRole,
  formatPresenceSystem,
  groupOnlinePresence,
  PRESENCE_ONLINE_WINDOW_MS,
} from '../src/city/presenceModel.js';

const now = 1_800_000_000_000;
const online = groupOnlinePresence([
  {
    uid: 'staff-1',
    email: 'staff@example.org',
    name: 'Staff Member',
    role: 'city_lead',
    system: 'city',
    updatedAt: now - 30_000,
  },
  {
    uid: 'staff-1',
    email: 'staff@example.org',
    name: 'Staff Member',
    role: 'city_lead',
    system: 'winter_academy',
    updatedAt: now - 10_000,
  },
  {
    uid: 'fellow-1',
    name: 'Offline Fellow',
    role: 'fellow',
    system: 'city',
    updatedAt: now - PRESENCE_ONLINE_WINDOW_MS - 1,
  },
], now);

assert.equal(online.length, 1, 'stale sessions must not count as online');
assert.equal(online[0].uid, 'staff-1');
assert.deepEqual(online[0].systems, ['city', 'winter_academy']);
assert.equal(online[0].sessionCount, 2, 'multiple sessions should group under one user');
assert.equal(online[0].lastActive, now - 10_000);
assert.equal(
  groupOnlinePresence([{ uid: 'boundary', updatedAt: now - PRESENCE_ONLINE_WINDOW_MS }], now).length,
  1,
  'the two-minute cutoff is inclusive',
);
assert.equal(
  groupOnlinePresence([{ uid: 'future', updatedAt: now + 5_000 }], now).length,
  1,
  'small server/client clock skew should not hide an active session',
);
assert.equal(formatLastActive(now - 60_000, now), '1 min ago');
assert.equal(formatPresenceRole('city_lead'), 'City Lead');
assert.equal(formatPresenceSystem('system_picker'), 'Choosing a system');

console.log('Calendar presence model checks passed.');
