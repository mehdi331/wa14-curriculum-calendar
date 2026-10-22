export const PRESENCE_ONLINE_WINDOW_MS = 2 * 60 * 1000;

function timestampMillis(timestamp) {
  return typeof timestamp?.toMillis === 'function'
    ? timestamp.toMillis()
    : Number(timestamp);
}

function isRecent(timestamp, now) {
  const updatedAt = timestampMillis(timestamp);
  return Number.isFinite(updatedAt)
    && now - updatedAt <= PRESENCE_ONLINE_WINDOW_MS;
}

export function groupOnlinePresence(records, now = Date.now()) {
  const users = new Map();
  for (const record of records) {
    if (!isRecent(record.updatedAt, now) || !record.uid) continue;
    const updatedAt = timestampMillis(record.updatedAt);
    const entry = users.get(record.uid) || {
      uid: record.uid, email: '', name: 'Calendar user', role: 'staff',
      systems: new Set(), lastActive: 0, sessionCount: 0,
    };
    if (record.system) entry.systems.add(record.system);
    if (updatedAt >= entry.lastActive) {
      entry.email = record.email || '';
      entry.name = record.name || record.email || 'Calendar user';
      entry.role = record.role || 'staff';
    }
    entry.lastActive = Math.max(entry.lastActive, updatedAt);
    entry.sessionCount += 1;
    users.set(record.uid, entry);
  }
  return [...users.values()]
    .map(user => ({ ...user, systems: [...user.systems] }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function formatPresenceSystem(system) {
  if (system === 'winter_academy') return 'Winter Academy';
  if (system === 'city') return 'City';
  if (system === 'system_picker') return 'Choosing a system';
  return 'Calendar';
}

export function formatPresenceRole(role) {
  const labels = {
    superadmin: 'Superadmin',
    planner: 'Planning team',
    resource_planner: 'Resources only',
    staff: 'Staff',
    fellow: 'Fellow',
    academy_lead: 'Academy Lead',
    afa_lead: 'Academy Fellow Advisor Lead',
    curriculum_specialist: 'Curriculum Specialist',
    afa: 'AFA',
    placement_ops: 'School Placement & Ops',
    city_lead: 'City Lead',
    coach: 'Coach',
  };
  return labels[role] || String(role || 'Staff').replace(/_/g, ' ');
}

export function formatLastActive(timestamp, now = Date.now()) {
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < 60 * 1000) return 'Just now';
  const minutes = Math.floor(elapsed / (60 * 1000));
  return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
}
