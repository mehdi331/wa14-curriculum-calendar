// Shared City/Cohort helpers. These are designed to be portable: on the real
// app the import is `../city/cohort` added beside the existing helpers.
// [CITY] foundation helper -- no existing behaviour is changed.

export const SYSTEMS = {
  winter_academy: { id: 'winter_academy', label: 'Winter Academy', blurb: 'The 6–7 week Winter Academy training calendar, sessions and assessments.' },
  city: { id: 'city', label: 'City', blurb: 'The year-round City fellowship calendar: spaces, tasks and deadlines by cohort.' },
};

// City TYPES are the countable taxonomy (report rows) -- user-editable in the
// "Types & modes" tab, stored in wa14-city-types. MODES are the delivery
// format (report columns), stored in wa14-city-modes. Both lists are shared
// by spaces, tasks and deadlines. The Learning Circle checkbox is gone: a
// Learning Circle is simply a type.
export const DEFAULT_CITY_TYPES = [
  { id: 'ct0', name: 'PD Session', color: '#3E8FA0' },
  { id: 'ct1', name: 'Learning Circle', color: '#8A78C2' },
  { id: 'ct2', name: 'Workshop', color: '#D97355' },
  { id: 'ct3', name: 'Clinic', color: '#5FA97E' },
];
export const DEFAULT_CITY_MODES = [
  { id: 'cm0', name: 'Sync', color: '#D65641' },
  { id: 'cm1', name: 'Async', color: '#B8863B' },
  { id: 'cm2', name: 'Coaching', color: '#6B5CA5' },
];
// Colour lookup for an editable list; unknown names get the muted fallback.
export function colorFor(name, list, fallback = '#9DB09D') {
  const hit = (list || []).find(x => x.name === name);
  return hit ? hit.color : fallback;
}

export const CITY_KINDS = [
  { id: 'space', label: 'Programming space' },
  { id: 'task', label: 'Task' },
  { id: 'deadline', label: 'Deadline' },
];

export function yearOf(now = new Date()) { return (now instanceof Date ? now : new Date(now)).getFullYear(); }

// Cohort model (C = cohort year, Y = current year):
//   C === Y + 1 -> winter_academy (in WA now, e.g. 2027 cohort in 2026)
//   C === Y     -> year1
//   C === Y - 1 -> year2
//   C <= Y - 2  -> alumni
//   C >  Y + 1  -> future (approved later, no access yet)
export function cohortRole(cohort, now = new Date()) {
  const y = yearOf(now);
  if (cohort === null || cohort === undefined || cohort === '') return 'unknown';
  const c = Number(cohort);
  if (!Number.isFinite(c)) return 'unknown';
  if (c === y + 1) return 'winter_academy';
  if (c === y) return 'year1';
  if (c === y - 1) return 'year2';
  if (c <= y - 2) return 'alumni';
  return 'future';
}

export const COHORT_ROLE_LABEL = {
  winter_academy: 'Winter Academy',
  year1: 'Year 1 Fellow',
  year2: 'Year 2 Fellow',
  alumni: 'Alumni',
  future: 'Upcoming cohort',
  unknown: 'No cohort',
};

// Access ends 31 Dec of the 2nd fellowship year (cohort year + 1).
// A 2024 cohort: Year 1 in 2024, Year 2 in 2025, revoked after 31 Dec 2025.
export function cohortAccessEndsAt(cohort) {
  const c = Number(cohort);
  if (!Number.isFinite(c)) return null;
  return new Date(c + 1, 11, 31, 23, 59, 59);
}
export function cohortAccessRevoked(cohort, now = new Date()) {
  const role = cohortRole(cohort, now);
  if (role !== 'alumni' && role !== 'unknown') return false;
  const endsAt = cohortAccessEndsAt(cohort);
  if (!endsAt) return role === 'unknown';
  return (now instanceof Date ? now : new Date(now)) > endsAt;
}

// A City Fellow sees City items whose `cohorts` target includes their cohort
// (or items explicitly marked 'all'). Winter Academy Fellows never see city items.
export function cityItemsForCohort(items, cohort) {
  const c = String(cohort ?? '');
  return (items || []).filter(item => {
    const targets = item.cohorts == null ? ['all'] : (Array.isArray(item.cohorts) ? item.cohorts : [item.cohorts]);
    return targets.map(String).some(t => t === 'all' || t === c);
  });
}

// ---- Staff systems / admin access ------------------------------------------
// Roles map to a Training System; a staff record may additionally carry an
// explicit `systems` array (set in the Admin panel). Both together decide
// whether the Training System picker shows automatically.
export const SYSTEM_ROLE_SYSTEMS = {
  superadmin: ['winter_academy', 'city'],
  academy_lead: ['winter_academy'],
  afa_lead: ['winter_academy'],
  curriculum_specialist: ['winter_academy'],
  placement_ops: ['winter_academy'],
  resource_planner: ['winter_academy'],
  planner: ['winter_academy'],
  staff: ['winter_academy'],
  afa: ['winter_academy'],          // default; the Admin panel can add 'city' for City AFAs
  city_lead: ['city'],
  coach: ['city'],
};
// City access levels (set in the City admin panel). 'full' sees everything;
// 'calendar' edits the calendar/sessions/tasks only; 'fellows' manages the
// City fellow roster only; 'resources' is read-only/viewer access.
export const CITY_ACCESS = [
  { id: 'full', label: 'Full control' },
  { id: 'calendar', label: 'Calendar editing only' },
  { id: 'fellows', label: 'Fellows only' },
  { id: 'resources', label: 'Resources only' },
];
export function systemsForStaff(record = {}) {
  if (record.role === 'superadmin') return ['winter_academy', 'city'];
  // An explicit systems list (set in the Admin panel) is authoritative; the
  // role map is only the default for records that never declared one.
  const explicit = Array.isArray(record.systems) ? record.systems.filter(Boolean) : [];
  if (explicit.length) return [...new Set(explicit)];
  return SYSTEM_ROLE_SYSTEMS[record.role] || ['winter_academy'];
}
// The effective access for a given system. City uses `access` (edited in the
// City admin panel); the Winter Academy uses `waAccess` when present (set when
// a City staffer is granted WA, editable from the WA Staff tab) and otherwise
// keeps the legacy WA rule so existing WA-only staff are unaffected.
export function accessForSystem(record = {}, system = 'winter_academy', adminRoles = []) {
  if (record.role === 'superadmin') return 'full';
  if (system === 'city') return record.access || 'resources';
  if (record.waAccess) return record.waAccess;
  if (record.systems && !systemsForStaff(record).includes('winter_academy')) return 'resources';
  return record.access || (adminRoles.includes(record.role) || record.role === 'planner' ? 'full' : 'resources');
}
// A staffer may edit the City calendar/sessions/staff tasks: full control or
// the dedicated calendar-editing access.
export function canEditCityCalendar(auth = {}) {
  return auth.role === 'superadmin' || auth.access === 'full' || auth.access === 'calendar';
}
// A staffer may manage the City fellow roster: full control or the dedicated
// fellows access (AFA/Coach manage Fellows only when given fellows access).
export function canManageCityFellows(auth = {}) {
  if (auth.role === 'superadmin' || auth.access === 'full' || auth.access === 'fellows') return true;
  return (auth.role === 'afa' || auth.role === 'coach') && auth.access !== 'resources' && auth.access !== 'calendar';
}
// The Admin panel is open to Superadmin, full-access staff, fellows-access
// staff, AFA/Coach (their own scope), or anyone flagged `adminPanel` by a
// superadmin in the backend.
export function canOpenAdminPanel(auth = {}) {
  return auth.role === 'superadmin' || auth.access === 'full' || auth.access === 'fellows' || auth.role === 'afa' || auth.role === 'coach' || auth.adminPanel === true;
}
// A Winter Academy AFA: role 'afa' whose systems include the Winter Academy.
export function isWinterAcademyAfa(auth = {}) {
  return auth.role === 'afa' && systemsForStaff(auth).includes('winter_academy');
}
// Cohort pre-fill for Fellow creation: only a Winter Academy AFA gets the
// automatic next-year assignment; everyone else defaults to the current year.
export function defaultCohortForCreator(auth, now = new Date()) {
  return isWinterAcademyAfa(auth) ? yearOf(now) + 1 : yearOf(now);
}

// ---- Fellow visibility ------------------------------------------------------
// `fellowMonths` mirrors the WA app's `fellowWeeks`: an array of visible month
// indexes (0-11). Unset/empty means every month is visible.
export function monthsInclude(fellowMonths, date) {
  if (!Array.isArray(fellowMonths) || !fellowMonths.length) return true;
  if (!date) return true;
  const m = Number(String(date).slice(5, 7)) - 1;
  return fellowMonths.includes(m);
}
// The Fellow-side filter: cohort targeting + the per-item visibility flag +
// the settings-level month visibility. Staff views never use this.
export function cityItemsForFellow(items, { cohort, fellowMonths } = {}) {
  return (items || []).filter(item => {
    if (item.visibleToFellows === false) return false;
    if (!monthsInclude(fellowMonths, item.date)) return false;
    return cityItemsForCohort([item], cohort).length > 0;
  });
}
