// Runner: loads cases.jsx through Vite (JSX transform) and renders each panel.
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';

// Minimal browser shims so Firebase (imported by App.jsx) can load under Node
const g = globalThis;
if (!g.window) { g.window = g; g.self = g; g.globalThis_window = true; }
if (!g.navigator) g.navigator = { userAgent: 'node', language: 'en-US', languages: ['en-US'] };
if (!g.document) g.document = { createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), createElementNS: () => ({ style: {} }), querySelector: () => null, head: { appendChild() {} } };
if (!g.localStorage) g.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
if (!g.location) g.location = { href: 'http://localhost/', origin: 'http://localhost', protocol: 'http:' };


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

await vite.close();
console.log(failed === 0 ? 'ALL PANELS RENDER OK' : failed + ' PANEL(S) FAILED');
process.exit(failed === 0 ? 0 : 1);
