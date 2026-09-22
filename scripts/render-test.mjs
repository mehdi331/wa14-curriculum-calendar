// Runner: loads cases.jsx through Vite (JSX transform) and renders each panel.
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';

// Minimal browser shims so Firebase (imported by App.jsx) can load under Node
const g = globalThis;
if (!g.window) { g.window = g; g.self = g; g.globalThis_window = true; }
if (!g.navigator) g.navigator = { userAgent: 'node', language: 'en-US', languages: ['en-US'] };
if (!g.document) g.document = { createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), createElementNS: () => ({ style: {} }), querySelector: () => null, head: { appendChild() {} } };
if (!g.localStorage) g.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
if (!g.location) g.location = { href: 'http://localhost/', origin: 'http://localhost', protocol: 'http:', host: 'localhost', hostname: 'localhost', pathname: '/', search: '', hash: '' };


const vite = await createServer({
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
});

const { cases } = await vite.ssrLoadModule('/scripts/cases.jsx');

let failed = 0;
for (const [name, factory] of cases) {
  try {
    const html = renderToString(factory());
    if (html.length < 60) { console.log('WARN  ' + name + ' small (' + html.length + ')'); failed++; }
    else console.log('OK    ' + name + ' (' + html.length + ' chars)');
  } catch (err) {
    failed++;
    console.log('FAIL  ' + name + ': ' + err.message);
    console.log('   ' + String(err.stack || '').split('\n').slice(1, 4).join('\n   '));
  }
}
// Score math check: paragraph review (3/4) + correct single answer (2/2) = 5/6
const mod2 = await vite.ssrLoadModule('/src/App.jsx');
const mockAssessment = { id: 'a1', questions: [{ id: 'q1', type: 'paragraph', points: 4 }, { id: 'q2', type: 'single', points: 2, correct: ['a'] }] };
const mockAttempt = { questionOrder: ['q1', 'q2'], answers: { q2: 'a' }, reviews: { q1: { status: 'reviewed', score: 3, questionId: 'q1' } } };
const sc = mod2.__panels.computeAttemptScore(mockAttempt, mockAssessment);
const pct = mod2.__panels.computeAttemptPercentage(mockAttempt, mockAssessment);
if (sc.earned === 5 && sc.total === 6 && pct === 83) console.log('OK    computeAttemptScore 5/6 = 83%');
else { console.log('FAIL  computeAttemptScore got ' + JSON.stringify(sc) + ' pct=' + pct); failed++; }

// attendance code + grade helpers
try {
  const phase = mod2.__panels.attendancePhase;
  const elig = mod2.__panels.attendanceEligible;
  const syncSession = { mode: 'Sync', date: '2026-10-25', start: '09:00', end: '10:00' };
  const phaseChecks = [
    ['upcoming', phase(syncSession, new Date('2026-10-25T02:59:00Z'))],
    ['on_time', phase(syncSession, new Date('2026-10-25T03:04:59Z'))],
    ['late', phase(syncSession, new Date('2026-10-25T03:05:00Z'))],
    ['closed', phase(syncSession, new Date('2026-10-25T03:15:00Z'))],
  ];
  const asyncNull = phase({ mode: 'Async', date: '2026-10-25', start: '09:00', end: '10:00' }, new Date('2026-10-25T03:04:59Z')) === null;
  if (phaseChecks.every(([want, got]) => got === want) && asyncNull && elig(syncSession) === true && elig({ mode: 'Async' }) === false) console.log('OK    attendancePhase window boundaries');
  else { console.log('FAIL  attendancePhase got ' + JSON.stringify(phaseChecks) + ' asyncNull=' + asyncNull); failed++; }
  const released = mod2.__panels.isGradeReleased({ gradesReleased: true });
  const hidden = mod2.__panels.isGradeReleased({ gradesReleased: false });
  const submittedUngraded = mod2.__panels.attemptGradeStatus({ status: 'submitted', questionOrder: ['q1'], answers: { q1: 'x' }, reviews: {} }, mockAssessment);
  const submittedGraded = mod2.__panels.attemptGradeStatus(mockAttempt, mockAssessment);
  const fp = mod2.__panels.getDeviceFingerprint();
  if (released === true && hidden === false && submittedUngraded === 'pending_review' && submittedGraded === 'graded' && typeof fp === 'string' && fp.startsWith('dev-')) console.log('OK    grade/device helpers');
  else { console.log('FAIL  grade/device helpers got ' + JSON.stringify({ released, hidden, submittedUngraded, submittedGraded, fp })); failed++; }
} catch (err) { console.log('FAIL  grade/device helpers: ' + err.message); failed++; }

// normalizeHashTab routing rules
try {
  const nht = mod2.__panels.normalizeHashTab;
  const nhtChecks = [
    ['', false, false, false, true, 'overview'],
    ['fellowAnalytics', false, false, false, true, 'fellowAnalytics'],
    ['dashboard', false, false, false, true, 'overview'],
    ['academyArchives', false, false, false, true, 'overview'],
    ['', true, true, true, false, 'dashboard'],
    ['academyArchives', true, true, true, false, 'academyArchives'],
    ['overview', true, true, true, false, 'overview'],
    ['bogus', true, false, false, false, 'dashboard'],
    ['bogus', false, false, false, true, 'overview'],
    ['bogus', false, false, false, false, 'calendar'],
  ];
  const nhtBad = nhtChecks.filter(([h, a, f, s, fl, want]) => nht(h, a, f, s, fl) !== want);
  if (!nhtBad.length) console.log('OK    normalizeHashTab routing rules');
  else { console.log('FAIL  normalizeHashTab got ' + JSON.stringify(nhtBad)); failed++; }
} catch (err) { console.log('FAIL  normalizeHashTab: ' + err.message); failed++; }
// weekForDate: 2026-10-25 is a Sunday → dates map to correct week indexes
// Week 00 is the full week before (Oct 18-24), Week 01 is Oct 25-31, etc.
const wf = mod2.__panels.weekForDate;
const wfChecks = [['2026-10-18', 0], ['2026-10-24', 0], ['2026-10-25', 1], ['2026-10-31', 1], ['2026-11-01', 2], ['2026-11-07', 2], ['2026-11-08', 3]];
for (const [d, expected] of wfChecks) {
  const got = wf(d, '2026-10-25');
  if (got === expected) console.log('OK    weekForDate ' + d + ' → ' + got);
  else { console.log('FAIL  weekForDate ' + d + ' → ' + got + ' (expected ' + expected + ')'); failed++; }
}

// Overlap layout + type/mode colors + fellow visibility helpers
try {
  const lo = mod2.__panels.layoutOverlapping([
    { id: 'a', start: '09:00', end: '10:30' },
    { id: 'b', start: '09:00', end: '10:00' },
    { id: 'c', start: '11:00', end: '12:00' },
  ]);
  const a = lo.find(x => x.s.id === 'a'), b = lo.find(x => x.s.id === 'b'), c = lo.find(x => x.s.id === 'c');
  const overlapOk = a && b && c && a.cols === 2 && b.cols === 2 && a.col !== b.col && c.cols === 1;
  const tc = mod2.__panels.getTypeColor('Team Culture', null);
  const mc = mod2.__panels.getModeColor('Sync', null);
  const mcCustom = mod2.__panels.getModeColor('Clinic', [{ id: 'm9', name: 'Clinic', color: '#123456' }]);
  const fellowRoster = [{ id: 'fe1', email: 'f1@x.dev' }];
  const vis = mod2.__panels.isSessionVisibleToFellow({ roomIds: [], rooms: [], afaGroup: '' }, { role: 'fellow', fellowId: 'fe1', email: 'f1@x.dev' }, fellowRoster, []);
  const visTargeted = mod2.__panels.isSessionVisibleToFellow({ roomIds: ['rx'], rooms: [], afaGroup: '' }, { role: 'fellow', fellowId: 'fe1', email: 'f1@x.dev' }, fellowRoster, []);
  if (overlapOk && typeof mod2.__panels.getTypeColor('Team Culture', null) === 'string' && mcCustom === '#123456' && vis === true && visTargeted === false) console.log('OK    overlap layout + type/mode colors + fellow visibility');
  else { console.log('FAIL  overlap/color/visibility ' + JSON.stringify({ a, b, c, mcCustom, vis, visTargeted })); failed++; }
} catch (err) { console.log('FAIL  overlap/color/visibility: ' + err.message); failed++; }

// Call signs + role labels
try {
  const cs = mod2.__panels.callSignFromName;
  const mmc = cs('Mehdi Morshed Chowdhury'), ar = cs('Md Asifur Rahman');
  const lbl = mod2.__panels.getRoleLabel;
  const customOk = lbl('assessment_lead', [{ id:'assessment_lead', label:'Assessment Lead' }]) === 'Assessment Lead';
  const builtinOk = lbl('afa', null) === 'AFA';
  const fallbackOk = lbl('unknown_role', null) === 'unknown role';
  if (mmc === 'MMC' && ar === 'AR' && customOk && builtinOk && fallbackOk) console.log('OK    callSignFromName + getRoleLabel');
  else { console.log('FAIL  callSignFromName/getRoleLabel ' + JSON.stringify({ mmc, ar, customOk, builtinOk, fallbackOk })); failed++; }
} catch (err) { console.log('FAIL  callSign/role helpers: ' + err.message); failed++; }

// [CITY] cohort + city assertions. The sandbox proves the new helpers with
// the same harness, so the port carries its tests along.
try {
  const city = await vite.ssrLoadModule('/src/city/index.js');
  const now = new Date('2026-09-18T00:00:00Z');
  const roleChecks = [
    [2027, 'winter_academy'], [2026, 'year1'], [2025, 'year2'],
    [2024, 'alumni'], [2023, 'alumni'], [2028, 'future'], [null, 'unknown'],
  ];
  const roleBad = roleChecks.filter(([c, want]) => city.cohortRole(c, now) !== want);
  if (!roleBad.length) console.log('OK    cohortRole year boundaries');
  else { console.log('FAIL  cohortRole got ' + JSON.stringify(roleBad)); failed++; }

  const endsOk = city.cohortAccessEndsAt(2024).getFullYear() === 2025 && city.cohortAccessEndsAt(2024).getMonth() === 11 && city.cohortAccessEndsAt(2024).getDate() === 31;
  const revokedOk = city.cohortAccessRevoked(2024, now) === true && city.cohortAccessRevoked(2025, now) === false && city.cohortAccessRevoked(2026, now) === false;
  if (endsOk && revokedOk) console.log('OK    cohortAccessEndsAt + cohortAccessRevoked (Dec-31 rule)');
  else { console.log('FAIL  cohort access rule ' + JSON.stringify({ endsOk, revokedOk })); failed++; }

  const scoped = city.cityItemsForCohort([
    { id: 's1', cohorts: [2026] }, { id: 's2', cohorts: [2025] }, { id: 's3', cohorts: [2026, 2025] }, { id: 's4' },
  ], 2026).map(s => s.id).sort().join(',');
  if (scoped === 's1,s3,s4') console.log('OK    cityItemsForCohort targeting');
  else { console.log('FAIL  cityItemsForCohort got ' + scoped); failed++; }

  const counts = city.citySpaceCounts([
    { kind: 'space', date: '2026-03-06', type: 'PD Session', mode: 'Sync', cohorts: [2026, 2025] },
    { kind: 'space', date: '2026-03-13', type: 'Workshop', mode: 'Sync', cohorts: [2026] },
    { kind: 'space', date: '2026-03-20', type: 'Clinic', mode: 'Coaching', cohorts: [2026] },
    { kind: 'space', date: '2026-03-27', type: 'Learning Circle', mode: 'Sync', cohorts: [2026] },
    { kind: 'task', date: '2026-03-21', type: 'PD Session', mode: 'Sync', cohorts: [2026] },
    { kind: 'space', date: '2026-04-14', type: 'Workshop', mode: 'Async', cohorts: [2025] },
    { kind: 'space', date: '2026-03-06', type: 'PD Session', mode: 'Sync', cohorts: [2026], visibleToFellows: false },
  ]);
  const y1mar = counts.counts['2026'].months[2];
  const y1ytd = counts.counts['2026'].ytd;
  const y2ytd = counts.counts['2025'].ytd;
  const countsOk = y1mar.pd === 5
    && (y1mar.byType['PD Session'] || 0) === 2 && (y1mar.byType['Workshop'] || 0) === 1
    && (y1mar.byType['Clinic'] || 0) === 1 && (y1mar.byType['Learning Circle'] || 0) === 1
    && (y1mar.byMode['Sync'] || 0) === 4 && (y1mar.byMode['Coaching'] || 0) === 1
    && y1ytd.pd === 5 && ((counts.counts['2026'].matrix['Clinic'] || {})['Coaching']) === 1
    && y2ytd.pd === 2 && (y2ytd.byType['Workshop'] || 0) === 1 && (y2ytd.byMode['Async'] || 0) === 1;
  if (countsOk) console.log('OK    citySpaceCounts type×mode per cohort/month/YTD');
  else { console.log('FAIL  citySpaceCounts got ' + JSON.stringify({ y1mar, y1ytd, y2ytd })); failed++; }

  const scopedItems = [
    { id: 'v1', cohorts: [2026], type: 'PD Session', visibleToFellows: true, date: '2026-03-05' },
    { id: 'v2', cohorts: [2026], type: 'PD Session', visibleToFellows: false, date: '2026-03-06' },
    { id: 'v3', cohorts: [2025], type: 'PD Session', date: '2026-03-07' },
    { id: 'v4', cohorts: [2026], type: 'PD Session', date: '2026-07-04' },
  ];
  const vis = city.cityItemsForFellow(scopedItems, { cohort: 2026, fellowMonths: [2, 6] }).map(s => s.id).sort().join(',');
  if (vis === 'v1,v4') console.log('OK    cityItemsForFellow (cohort + visibility + hidden months)');
  else { console.log('FAIL  cityItemsForFellow got ' + vis); failed++; }

  const sysChecks = [
    [{ role: 'city_lead' }, ['city']],
    [{ role: 'coach' }, ['city']],
    [{ role: 'curriculum_specialist' }, ['winter_academy']],
    [{ role: 'curriculum_specialist', systems: ['city'] }, ['city']],
    [{ role: 'afa', systems: ['winter_academy', 'city'] }, ['winter_academy', 'city']],
    [{ role: 'superadmin' }, ['winter_academy', 'city']],
    [{ role: 'afa' }, ['winter_academy']],
    [{}, ['winter_academy']],
  ];
  const sysBad = sysChecks.filter(([rec, want]) => JSON.stringify(city.systemsForStaff(rec)) !== JSON.stringify(want));
  if (!sysBad.length) console.log('OK    systemsForStaff (role map + explicit systems)');
  else { console.log('FAIL  systemsForStaff ' + JSON.stringify(sysBad)); failed++; }

  const adminOk = city.canOpenAdminPanel({ role: 'afa', access: 'resources' }) === true
    && city.canOpenAdminPanel({ role: 'coach', access: 'resources' }) === true
    && city.canOpenAdminPanel({ role: 'superadmin' }) === true
    && city.canOpenAdminPanel({ role: 'city_lead', access: 'full' }) === true
    && city.canOpenAdminPanel({ role: 'city_lead', access: 'fellows' }) === true
    && city.canOpenAdminPanel({ role: 'city_lead', access: 'calendar' }) === false
    && city.canOpenAdminPanel({ role: 'city_lead', access: 'resources' }) === false;
  if (adminOk) console.log('OK    canOpenAdminPanel (AFA/Coach/full/fellows/superadmin)');
  else { console.log('FAIL  canOpenAdminPanel'); failed++; }

  const cityRightsOk = city.canEditCityCalendar({ role: 'city_lead', access: 'calendar' }) === true
    && city.canEditCityCalendar({ role: 'coach', access: 'calendar' }) === true
    && city.canEditCityCalendar({ role: 'city_lead', access: 'full' }) === true
    && city.canEditCityCalendar({ role: 'superadmin' }) === true
    && city.canEditCityCalendar({ role: 'afa', access: 'fellows' }) === false
    && city.canEditCityCalendar({ role: 'coach', access: 'resources' }) === false
    && city.canManageCityFellows({ role: 'afa', access: 'fellows' }) === true
    && city.canManageCityFellows({ role: 'city_lead', access: 'fellows' }) === true
    && city.canManageCityFellows({ role: 'superadmin' }) === true
    && city.canManageCityFellows({ role: 'afa', access: 'calendar' }) === false
    && city.canManageCityFellows({ role: 'coach', access: 'resources' }) === false;
  if (cityRightsOk) console.log('OK    City access levels (calendar/fellows editing rights)');
  else { console.log('FAIL  City access levels'); failed++; }

  const perSystemOk = city.accessForSystem({ role: 'city_lead', access: 'full', waAccess: 'resources' }, 'city') === 'full'
    && city.accessForSystem({ role: 'city_lead', access: 'full', waAccess: 'resources' }, 'winter_academy') === 'resources'
    && city.accessForSystem({ role: 'academy_lead' }, 'winter_academy', ['academy_lead']) === 'full'
    && city.accessForSystem({ role: 'staff', systems: ['city'] }, 'winter_academy') === 'resources'
    && city.accessForSystem({ role: 'superadmin' }, 'city') === 'full';
  if (perSystemOk) console.log('OK    Per-system access (City access vs WA access)');
  else { console.log('FAIL  Per-system access'); failed++; }

  const cohortAuto = city.defaultCohortForCreator({ role: 'afa', systems: ['winter_academy', 'city'] }, now) === 2027
    && city.defaultCohortForCreator({ role: 'afa', systems: ['city'] }, now) === 2026
    && city.defaultCohortForCreator({ role: 'city_lead' }, now) === 2026
    && city.isWinterAcademyAfa({ role: 'afa', systems: ['winter_academy'] }) === true
    && city.isWinterAcademyAfa({ role: 'afa', systems: ['city'] }) === false;
  if (cohortAuto) console.log('OK    WA AFA auto-cohort (next year) + isWinterAcademyAfa');
  else { console.log('FAIL  WA AFA auto-cohort'); failed++; }

  const bucketItems = [
    { id: 'b1', date: '2026-09-18', start: '10:00' },
    { id: 'b2', date: '2026-09-22', start: '10:00' },
    { id: 'b3', date: '2026-10-05', start: '10:00' },
  ];
  const buckets = city.cityUpcomingBuckets(bucketItems, new Date('2026-09-18T00:00:00+06:00'));
  if (buckets.next24h.length === 1 && buckets.nextWeek.length === 1 && buckets.nextMonth.length === 1) console.log('OK    cityUpcomingBuckets 24h/week/month');
  else { console.log('FAIL  cityUpcomingBuckets got ' + JSON.stringify({ h24: buckets.next24h.length, w: buckets.nextWeek.length, m: buckets.nextMonth.length })); failed++; }
  const bucketsHidden = city.cityUpcomingBuckets(bucketItems, new Date('2026-09-18T00:00:00+06:00'), { fellowMonths: [8] });
  if (bucketsHidden.next24h.length === 1 && bucketsHidden.nextWeek.length === 1 && bucketsHidden.nextMonth.length === 0) console.log('OK    cityUpcomingBuckets respects hidden months');
  else { console.log('FAIL  cityUpcomingBuckets hidden months got ' + JSON.stringify(bucketsHidden.nextMonth.length)); failed++; }

  // Cohort access revocation: current-programme fellow is not revoked,
  // while an alumni (cohort two years before) is revoked after Dec-31 of their 2nd year.
  const priorCohortRevoked = city.cohortAccessRevoked(2024, now);   // 31 Dec 2025 has passed
  const currentCohortRevoked = city.cohortAccessRevoked(2026, now); // still in Year 1
  const futureCohortRevoked = city.cohortAccessRevoked(2027, now);  // Winter Academy, not revoked
  if (priorCohortRevoked && !currentCohortRevoked && !futureCohortRevoked)
    console.log('OK    cohortAccessRevoked ( alumni blocked, current/future OK )');
  else { console.log('FAIL  cohortAccessRevoked got ' + JSON.stringify({ priorCohortRevoked, currentCohortRevoked, futureCohortRevoked })); failed++; }
} catch (err) { console.log('FAIL  city/cohort helpers: ' + err.message); failed++; }

await vite.close();
console.log(failed === 0 ? 'ALL PANELS RENDER OK' : failed + ' PANEL(S) FAILED');
process.exit(failed === 0 ? 0 : 1);
