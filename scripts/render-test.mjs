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
const { __panels: P } = await vite.ssrLoadModule('/src/App.jsx');
const { mergeAttendanceChanges } = await vite.ssrLoadModule('/src/storage.js');

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
// Goals visibility: fellows (canEdit=false) must never receive goal text;
// staff (canEdit=true) must see goals grouped under their pillar with serials.
const renderHtml = name => { const c = cases.find(x => x[0] === name); return c ? renderToString(c[1]()) : ''; };
const adminPanelHtml = renderHtml('AdminPanel-full');
const loginAuditHtml = renderHtml('LoginAuditPanel');
const auditViewChecks = [
  ['Admin panel exposes Login history', adminPanelHtml.includes('Login history')],
  ['history explains approximate device data and no location tracking', loginAuditHtml.includes('approximate') && loginAuditHtml.includes('does not collect IP address or location')],
];
const badAuditView = auditViewChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (badAuditView.length === 0) console.log('OK    login audit admin tab + privacy disclosure');
else { console.log('FAIL  login audit view: ' + badAuditView.join('; ')); failed++; }
const fellowHtml = renderHtml('AcademyOverviewPanel-fellow');
const staffHtml = renderHtml('AcademyOverviewPanel-goals');
const editHtml = renderHtml('AcademyOverviewPanel-edit');
const legacyHtml = renderHtml('AcademyOverviewPanel-legacy');
const fellowChecks = [
  ['fellow sees vision', fellowHtml.includes('Every child receives an excellent education.')],
  ['fellow sees pillar name', fellowHtml.includes('Leadership')],
  ['fellow does NOT see goal text', !fellowHtml.includes('SECRET GOAL TEXT')],
  ['fellow does NOT see Goals heading', !fellowHtml.includes('>Goals<')],
  ['staff sees goal text', staffHtml.includes('First Leadership goal')],
  ['staff sees serial numbers', staffHtml.includes('1.') && staffHtml.includes('2.')],
  ['staff sees pillar grouping', staffHtml.includes('Leadership')],
  ['staff view exposes Edit overview', editHtml.includes('Edit overview')],
  ['legacy string goal survives normalization', legacyHtml.includes('Legacy goal one')],
];
const badVis = fellowChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (badVis.length === 0) console.log('OK    goals hidden from fellows, grouped for staff');
else { console.log('FAIL  goals visibility: ' + badVis.join('; ')); failed++; }

// Analytics opt-outs must disappear from staff aggregates and Fellow-level
// breakdowns while the roster still exposes an explicit management control.
const optedOutAnalyticsHtml = renderHtml('ExpandedAnalyticsPanel-opt-out');
const rosterAdminHtml = renderHtml('RosterPanel');
const analyticsOptOutChecks = [
  ['opted-out Fellow excluded from analytics breakdown', !optedOutAnalyticsHtml.includes('Fellow Two')],
  ['included Fellow remains in analytics breakdown', optedOutAnalyticsHtml.includes('Fellow One')],
  ['existing Fellows have an opt-out control', rosterAdminHtml.includes('Don&#x27;t include in analysis')],
];
const badAnalyticsOptOut = analyticsOptOutChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (badAnalyticsOptOut.length === 0) console.log('OK    analytics opt-out filtering and roster control');
else { console.log('FAIL  analytics opt-out: ' + badAnalyticsOptOut.join('; ')); failed++; }
const fellowEditHtml = renderHtml('FellowProfileEditForm');
const validFellowEdit = {
  name: 'Fellow One',
  email: 'fellow.one@teachforbangladesh.org',
  cohort: '2026',
  track: 'primary',
  grade: '3',
  placementCity: 'Dhaka',
  afaGroup: 'AFA 1',
};
const fellowEditRoster = [{ id: 'fe2', email: 'second.person@teachforbangladesh.org' }];
const fellowEditChecks = [
  ['edit form exposes AFA assignment and other profile fields', fellowEditHtml.includes('AFA group') && fellowEditHtml.includes('AFA 1') && fellowEditHtml.includes('Cohort year') && fellowEditHtml.includes('Placement city')],
  ['valid profile can be saved', P.fellowEditError(validFellowEdit, fellowEditRoster, 'fe1') === ''],
  ['duplicate email is rejected', P.fellowEditError({ ...validFellowEdit, email: 'second.person@teachforbangladesh.org' }, fellowEditRoster, 'fe1') === 'That email is already on the roster.'],
  ['invalid email is rejected', P.fellowEditError({ ...validFellowEdit, email: 'not-an-email' }, fellowEditRoster, 'fe1').startsWith('Email must look like')],
  ['invalid cohort year is rejected', P.fellowEditError({ ...validFellowEdit, cohort: 'abc' }, fellowEditRoster, 'fe1') === 'Enter a valid cohort year.'],
];
const badFellowEdit = fellowEditChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (badFellowEdit.length === 0) console.log('OK    Fellow editor profile fields, AFA assignment, and validation');
else { console.log('FAIL  Fellow editor: ' + badFellowEdit.join('; ')); failed++; }

// Practice teaching: per-Fellow subjects, unassigned rule, and Fellow-facing
// gating (grade/school/partners/outcomes by individual assignment only).
const assignedHtml = renderHtml('FellowPracticePanel');
const unassignedHtml = renderHtml('FellowPracticePanel-unassigned');
const adminHtml = renderHtml('PracticeTeachingPanel-assigned');
const fellowOnePracticeHtml = renderHtml('FellowPracticePanel-individual-fe1');
const fellowTwoPracticeHtml = renderHtml('FellowPracticePanel-individual-fe2');
const ptChecks = [
  ['admin panel shows S1 + school', adminHtml.includes('S1') && adminHtml.includes('Dhaka Collegiate School')],
  ['admin panel shows unassigned section', adminHtml.includes('Unassigned Fellows')],
  ['fellow sees school', assignedHtml.includes('Dhaka Collegiate School')],
  ['fellow sees partner name', assignedHtml.includes('Fellow Two')],
  ['fellow sees grade', assignedHtml.includes('Grade 9')],
  ['fellow sees own day-1 outcome', assignedHtml.includes('SECRET_BANGLA_DAY1')],
  ['fellow sees day-1 outcome chapter + pages', assignedHtml.includes('Chapter 7 · Algebra') && assignedHtml.includes('12-15')],
  ['unassigned fellow sees NO outcome metadata', !unassignedHtml.includes('Chapter 7 · Algebra')],
  ['fellow sees distinct day-2 outcome', assignedHtml.includes('SECRET_BANGLA_DAY2')],
  ['fellow does not see another Fellow subject outcome', !assignedHtml.includes('SECRET_ENGLISH_DAY1')],
  ['fellow does not see another grade\'s outcomes', !assignedHtml.includes('OTHER_GRADE_OUTCOME')],
  ['individual outcome is visible only to its assigned Fellow', fellowOnePracticeHtml.includes('FELLOW_ONE_OUTCOME') && !fellowOnePracticeHtml.includes('FELLOW_TWO_OUTCOME')],
  ['second Fellow sees their own distinct outcome', fellowTwoPracticeHtml.includes('FELLOW_TWO_OUTCOME') && !fellowTwoPracticeHtml.includes('FELLOW_ONE_OUTCOME')],
  ['Fellows can have different subjects on the same day', fellowOnePracticeHtml.includes('Bangla') && !fellowOnePracticeHtml.includes('English') && fellowTwoPracticeHtml.includes('English') && !fellowTwoPracticeHtml.includes('Bangla')],
  ['unassigned fellow sees gate message', unassignedHtml.includes('once your practice teaching assignment is set')],
  ['unassigned fellow sees NO outcomes', !unassignedHtml.includes('SECRET_BANGLA_DAY1') && !unassignedHtml.includes('SECRET_ENGLISH_DAY1')],
  ['unassigned fellow sees NO school', !unassignedHtml.includes('Dhaka Collegiate School')],
];
const badPt = ptChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (badPt.length === 0) console.log('OK    practice teaching panel + fellow gating');
else { console.log('FAIL  practice teaching: ' + badPt.join('; ')); failed++; }

const attendanceSettingsHtml = renderHtml('AttendanceRecordsPanel');
const sessionEditHtml = renderHtml('EditPanel-new');
const attendanceUiChecks = [
  ['attendance records do not expose global timing settings', !attendanceSettingsHtml.includes('Attendance window settings') && !attendanceSettingsHtml.includes('Save attendance window')],
  ['session editor exposes per-session attendance inclusion', sessionEditHtml.includes('Count attendance for this session')],
  ['session editor exposes timing controls and defaults', sessionEditHtml.includes('Attendance button window') && sessionEditHtml.includes('Open before start (minutes)') && sessionEditHtml.includes('On-time cutoff (minutes after start)') && sessionEditHtml.includes('Late window duration (minutes after on-time cutoff)') && sessionEditHtml.includes('value="3"') && sessionEditHtml.includes('value="2"') && sessionEditHtml.includes('value="10"')],
];
const badAttendanceUi = attendanceUiChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (!badAttendanceUi.length) console.log('OK    per-session attendance controls; no global timing form');
else { console.log('FAIL  attendance controls: ' + badAttendanceUi.join('; ')); failed++; }
const attendanceChanges = mergeAttendanceChanges(
  [
    { sessionId: 's1', fellowId: 'f1', status: 'late' },
    { sessionId: 's1', fellowId: 'f2', status: 'on_time' },
    { sessionId: 's1', fellowId: 'f3', status: 'late' },
  ],
  [
    { sessionId: 's1', fellowId: 'f1', status: 'late' },
    { sessionId: 's1', fellowId: 'f2', status: 'on_time' },
  ],
  [
    { sessionId: 's1', fellowId: 'f1', status: 'on_time' },
    { sessionId: 's1', fellowId: 'f3', status: 'late' },
  ],
);
const attendanceMergeChecks = [
  ['changed record updates target Fellow', attendanceChanges.find(record => record.fellowId === 'f1')?.status === 'on_time'],
  ['removed record is removed', !attendanceChanges.some(record => record.fellowId === 'f2')],
  ['unrelated concurrent check-in is preserved', attendanceChanges.some(record => record.fellowId === 'f3' && record.status === 'late')],
];
const badAttendanceMerge = attendanceMergeChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (!badAttendanceMerge.length) console.log('OK    transactional attendance update preserves concurrent records');
else { console.log('FAIL  attendance storage: ' + badAttendanceMerge.join('; ')); failed++; }

// Saved list preview shows all entries and their per-outcome metadata.
const loMultiHtml = renderHtml('LearningOutcomesPanel-multi');
const loPrevChecks = [
  ['all catalog outcomes visible', loMultiHtml.includes('MULTI_ONE_A') && loMultiHtml.includes('MULTI_ONE_B') && loMultiHtml.includes('MULTI_TWO') && loMultiHtml.includes('MULTI_THREE') && loMultiHtml.includes('MULTI_FOUR')],
  ['chapter ref stays with outcome', loMultiHtml.includes('Ch 1') && loMultiHtml.includes('1-2')],
];
const badLoPrev = loPrevChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (badLoPrev.length === 0) console.log('OK    outcome catalog list preview');
else { console.log('FAIL  outcomes preview: ' + badLoPrev.join('; ')); failed++; }

// Fellow home: accountability partner beside the AFA group; without a roster the
// line still reads "Not assigned" (backward compatible).
const fellowHomePartner = renderHtml('FellowOverview-partner');
const fellowHomeBare = renderHtml('FellowOverview');
const foChecks = [
  ['partner beside AFA group', fellowHomePartner.includes('Accountability partner:') && fellowHomePartner.includes('Fellow Two')],
  ['no roster still Not assigned', fellowHomeBare.includes('Accountability partner:') && fellowHomeBare.includes('Not assigned')],
];
const badFo = foChecks.filter(([, ok]) => !ok).map(([label]) => label);
if (badFo.length === 0) console.log('OK    fellow home shows accountability partner');
else { console.log('FAIL  fellow home partner: ' + badFo.join('; ')); failed++; }

// Score math check: paragraph review (3/4) + correct single answer (2/2) = 5/6
const mod2 = await vite.ssrLoadModule('/src/App.jsx');

// Practice teaching helpers: per-Fellow subject tallies, legacy migration,
// individual outcomes, and the unassigned rule (collab AND accountability).
try {
  const { normalizeCollab, nextCollabCode, rotationTallies, scheduledDays, normalizeOutcomeRecord, outcomesForDay, outcomesForSubject, isFellowAssigned, unassignedFellows, learningOutcomesFor, accountabilityGroups, inAccountabilityGroup, setAccountabilityGroup, clearAccountabilityGroup } = mod2.__panels;
  const subjectsByFellowByDay = {};
  for (let day = 1; day <= 3; day++) subjectsByFellowByDay[String(day)] = { a: 'Bangla', b: 'English' };
  subjectsByFellowByDay['4'] = { a: 'Math' };
  const t = rotationTallies({ fellowIds: ['a', 'b'], subjectsByFellowByDay });
  const codesOk = nextCollabCode([{ code: 'S1', band: 'secondary' }], 'secondary') === 'S2'
    && nextCollabCode([{ code: 'S1', band: 'secondary' }], 'primary') === 'P1'
    && nextCollabCode([], 'secondary') === 'S1';
  const tallyOk = t.a.Bangla === 3 && t.a.Math === 1 && t.b.English === 3
    && scheduledDays({ subjectsByFellowByDay }) === 4;
  const rosterMixed = [{ id: 'a', accountabilityIds: ['b'] }, { id: 'b', accountabilityIds: [] }, { id: 'c', accountabilityIds: ['a'] }];
  const collabs = [{ id: 'x', fellowIds: ['a'] }];
  const assignOk = isFellowAssigned(rosterMixed[0], collabs) === true
    && isFellowAssigned(rosterMixed[1], collabs) === false
    && isFellowAssigned(rosterMixed[2], collabs) === false
    && unassignedFellows(rosterMixed, collabs).map(f => f.id).join(',') === 'b,c';
  const loLib = [
    { grade: 'Grade 9', subject: 'Bangla', outcomesByDay: { 1: ['day1'], 2: ['day2'] } },
    { grade: 'Grade 9', subject: 'English', outcomesByDay: { 1: ['eng1'] } },
    { grade: 'Grade 5', subject: 'Bangla', outcomesByDay: { 1: ['other'] } },
  ];
  const loOk = learningOutcomesFor(loLib, 'grade 9 ', ['Bangla']).length === 1
    && learningOutcomesFor(loLib, 'Grade 9', ['English']).length === 1
    && learningOutcomesFor(loLib, 'Grade 5', ['Bangla']).length === 1
    && learningOutcomesFor(loLib, 'Grade 4', ['Bangla']).length === 0
    && JSON.stringify(outcomesForSubject(loLib, 'Grade 9', 'Bangla').map(outcome => outcome.text)) === '["day1","day2"]'
    && JSON.stringify(outcomesForDay(loLib, 'Grade 9', 'Bangla', 1)) === '["day1"]'
    && JSON.stringify(outcomesForDay(loLib, 'Grade 9', 'Bangla', 2)) === '["day2"]'
    && outcomesForDay(loLib, 'Grade 9', 'Bangla', 9).length === 0
    && outcomesForDay(loLib, 'Grade 9', 'English', 1).length === 1
    && outcomesForDay(loLib, 'Grade 9', 'Math', 1).length === 0
    && JSON.stringify(outcomesForDay(loLib, 'Grade 5', 'Bangla', 1)) === '["other"]';
  const legacyNorm = normalizeOutcomeRecord({ grade: 'Grade 9', subject: 'Bangla', outcomes: ['flat'] });
  const legacyOk = legacyNorm.outcomes[0].legacyDay === '*'
    && JSON.stringify(outcomesForDay([legacyNorm], 'Grade 9', 'Bangla', 4)) === '["flat"]'
    && legacyNorm.outcomes[0].text === 'flat';
  const metaLib = [{ grade: 'Grade 9', subject: 'Bangla', outcomesByDay: { 1: ['x'], 2: ['y'] }, chaptersByDay: { 1: { chapter: 'Chapter 7', pages: '12-15' } } }];
  const metaOutcomes = normalizeOutcomeRecord(metaLib[0]).outcomes;
  const metaOk = metaOutcomes.length === 2
    && metaOutcomes[0].chapter === 'Chapter 7' && metaOutcomes[0].pages === '12-15'
    && !metaOutcomes[1].chapter && !metaOutcomes[1].pages
    && normalizeOutcomeRecord(metaLib[0]).outcomes[0].id === normalizeOutcomeRecord(normalizeOutcomeRecord(metaLib[0])).outcomes[0].id;
  const norm = normalizeCollab({ code: 'S3', band: 'primary', fellowIds: [1, 2], rotation: { 1: { 1: 'Bangla', 9: 'Math' }, 2: { 1: 'Paint' } }, days: 0 });
  const normOk = norm.band === 'primary' && JSON.stringify(norm.fellowIds) === '["1","2"]'
    && norm.subjectsByFellowByDay['1']['1'] === 'Bangla' && !norm.subjectsByFellowByDay['2'] && norm.days === 12;
  const migratedLegacy = normalizeCollab({
    id: 'legacy', grade: 'Grade 9', days: 2, fellowIds: ['a', 'b'],
    rotation: { 1: { a: 'Bangla', b: 'English' } },
  }, loLib);
  const normalizedAgain = normalizeCollab(migratedLegacy, loLib);
  const migrationOk = migratedLegacy.subjectsByFellowByDay['1'].a === 'Bangla'
    && migratedLegacy.subjectsByFellowByDay['1'].b === 'English'
    && migratedLegacy.outcomeAssignments['1'].a[0] === outcomesForSubject(loLib, 'Grade 9', 'Bangla')[0].id
    && migratedLegacy.outcomeAssignments['1'].b[0] === outcomesForSubject(loLib, 'Grade 9', 'English')[0].id
    && JSON.stringify(normalizedAgain.outcomeAssignments) === JSON.stringify(migratedLegacy.outcomeAssignments)
    && migratedLegacy.outcomeAssignmentVersion === 2;
  const assignedIndividually = normalizeCollab({
    id: 'individual', grade: 'Grade 9', days: 1, fellowIds: ['a', 'b'],
    subjectsByFellowByDay: { 1: { a: 'Bangla', b: 'English' } }, outcomeAssignmentVersion: 2,
    outcomeAssignments: { 1: { a: ['Chosen A'], b: ['Chosen B'] } },
  }, loLib);
  const individualOk = assignedIndividually.subjectsByFellowByDay['1'].a === 'Bangla'
    && assignedIndividually.subjectsByFellowByDay['1'].b === 'English'
    && assignedIndividually.outcomeAssignments['1'].a[0] === 'Chosen A'
    && assignedIndividually.outcomeAssignments['1'].b[0] === 'Chosen B';
  const banglaCatalog = outcomesForSubject(loLib, 'Grade 9', 'Bangla');
  const repeatAssignments = normalizeCollab({
    id: 'repeat', grade: 'Grade 9', days: 2, fellowIds: ['a', 'b'],
    subjectsByFellowByDay: { 1: { a: 'Bangla', b: 'Bangla' }, 2: { a: 'Bangla' } },
    outcomeAssignmentVersion: 2,
    outcomeAssignments: { 1: { a: [banglaCatalog[0].id, banglaCatalog[1].id], b: [banglaCatalog[0].id] }, 2: { a: [banglaCatalog[0].id] } },
  }, loLib);
  const reuseOk = repeatAssignments.outcomeAssignments['1'].a.length === 2
    && repeatAssignments.outcomeAssignments['1'].b[0] === banglaCatalog[0].id
    && repeatAssignments.outcomeAssignments['2'].a[0] === banglaCatalog[0].id;
  // Cross-school collabs: per-member schools override the group school.
  const schoolForMember = mod2.__panels.schoolForMember;
  const crossCollab = { id: 'cx', code: 'S9', band: 'secondary', grade: 'Grade 8', school: 'Group School', days: 12, fellowIds: ['m1', 'm2', 'm3'], schools: { m2: 'Other School' }, rotation: {} };
  const schoolOk = schoolForMember(crossCollab, 'm1') === 'Group School'
    && schoolForMember(crossCollab, 'm2') === 'Other School'
    && schoolForMember(crossCollab, 'm3') === 'Group School'
    && schoolForMember({ school: 'Only School' }, 'm1') === 'Only School'
    && schoolForMember({}, 'm1') === '';
  // Mutual accountability groups: pairs and a triple derive as units, a Fellow
  // is in at most one group, growing a group makes everyone mutual, shrinking
  // frees the removed Fellow, a grouped Fellow is stripped from their old
  // group when set elsewhere, and clearing frees the whole group.
  const grpRoster = [
    { id: 'a', name: 'A', accountabilityIds: ['b'] },
    { id: 'b', name: 'B', accountabilityIds: ['a'] },
    { id: 'c', name: 'C', accountabilityIds: [] },
    { id: 'g', name: 'G', accountabilityIds: ['h', 'i'] },
    { id: 'h', name: 'H', accountabilityIds: ['g', 'i'] },
    { id: 'i', name: 'I', accountabilityIds: ['g', 'h'] },
    { id: 'x', name: 'X', accountabilityIds: [] },
  ];
  const sortIds = arr => JSON.stringify((arr || []).map(g0 => g0.slice().sort()).sort());
  const deriveOk = sortIds(accountabilityGroups(grpRoster)) === sortIds([['a', 'b'], ['g', 'h', 'i']]);
  const inOk = inAccountabilityGroup(grpRoster, 'a') === true
    && inAccountabilityGroup(grpRoster, 'g') === true
    && inAccountabilityGroup(grpRoster, 'c') === false
    && inAccountabilityGroup(grpRoster, 'zzz') === false;
  const grown = setAccountabilityGroup(grpRoster, ['a', 'b', 'c']);
  const growOk = JSON.stringify(grown.find(f => f.id === 'a').accountabilityIds) === '["b","c"]'
    && JSON.stringify(grown.find(f => f.id === 'c').accountabilityIds) === '["a","b"]';
  const shrunk = setAccountabilityGroup(grpRoster, ['b']);
  const shrinkOk = shrunk.find(f => f.id === 'a').accountabilityIds.length === 0
    && shrunk.find(f => f.id === 'b').accountabilityIds.length === 0;
  const moved = setAccountabilityGroup(grpRoster, ['g', 'h', 'i', 'a']);
  const moveOk = moved.find(f => f.id === 'b').accountabilityIds.length === 0
    && JSON.stringify(moved.find(f => f.id === 'a').accountabilityIds) === '["g","h","i"]';
  const groupCleared = clearAccountabilityGroup(grpRoster, ['g', 'h', 'i']);
  const clearOk = ['g', 'h', 'i'].every(id => groupCleared.find(f => f.id === id).accountabilityIds.length === 0)
    && groupCleared.find(f => f.id === 'a').accountabilityIds.length === 1;
  const solo = setAccountabilityGroup(grpRoster, ['c']);
  const soloOk = solo.find(f => f.id === 'c').accountabilityIds.length === 0;
  const exclOk = deriveOk && inOk && growOk && shrinkOk && moveOk && clearOk && soloOk;
  if (codesOk && tallyOk && assignOk && loOk && legacyOk && normOk && migrationOk && individualOk && reuseOk && schoolOk && metaOk && exclOk)
    console.log('OK    collaboration subjects + legacy migration + individual outcomes + accountability groups');
  else { console.log('FAIL  practice helpers ' + JSON.stringify({ codesOk, tallyOk, assignOk, loOk, legacyOk, normOk, migrationOk, individualOk, reuseOk, schoolOk, metaOk, exclOk, deriveOk, inOk, growOk, shrinkOk, moveOk, clearOk, soloOk })); failed++; }
} catch (err) { console.log('FAIL  practice helpers: ' + err.message); failed++; }
// Goal records: legacy strings convert, serial ordering is honoured, blanks dropped.
try {
  const ng = mod2.__panels.normalizeGoals;
  const legacy = ng(['first legacy', 'second legacy']);
  const ordered = ng([
    { id: 'b', pillarId: 'p1', serial: 2, text: 'second' },
    { id: 'a', pillarId: 'p1', serial: 1, text: 'first' },
    { id: 'z', pillarId: 'p1', serial: 3, text: '   ' }
  ]);
  const ok = legacy.length === 2 && legacy[0].text === 'first legacy' && legacy[0].pillarId === ''
    && legacy[0].serial === 1
    && ordered.length === 2 && ordered[0].text === 'first' && ordered[1].text === 'second'
    && ordered[0].pillarId === 'p1' && ng(null).length === 0;
  if (ok) console.log('OK    normalizeGoals legacy + serial ordering');
  else { console.log('FAIL  normalizeGoals got ' + JSON.stringify({ legacy, ordered })); failed++; }
} catch (err) { console.log('FAIL  normalizeGoals: ' + err.message); failed++; }
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
  const timing = mod2.__panels.attendanceTimingFromSession;
  const validateTiming = mod2.__panels.validateAttendanceTiming;
  const normalizeSessionAttendance = mod2.__panels.normalizeSessionAttendance;
  const syncSession = { mode: 'Sync', date: '2026-10-25', start: '09:00', end: '10:00' };
  // Defaults: opens at -3, on time until +2, then late for 10 more minutes.
  const phaseChecks = [
    ['upcoming', phase(syncSession, new Date('2026-10-25T02:56:59Z'))],
    ['on_time', phase(syncSession, new Date('2026-10-25T02:57:00Z'))],
    ['on_time', phase(syncSession, new Date('2026-10-25T03:01:59Z'))],
    ['late', phase(syncSession, new Date('2026-10-25T03:02:00Z'))],
    ['closed', phase(syncSession, new Date('2026-10-25T03:12:00Z'))],
  ];
  const asyncNull = phase({ mode: 'Async', date: '2026-10-25', start: '09:00', end: '10:00' }, new Date('2026-10-25T03:01:59Z')) === null;
  const custom = { openBeforeStartMinutes: 10, onTimeUntilMinutes: 2, lateWindowMinutes: 6 };
  const customSession = { ...syncSession, attendanceTiming: custom };
  const customChecks = phase(customSession, new Date('2026-10-25T02:50:00Z')) === 'on_time'
    && phase(customSession, new Date('2026-10-25T03:02:00Z')) === 'late'
    && phase(customSession, new Date('2026-10-25T03:08:00Z')) === 'closed';
  const extendedLateWindow = { ...syncSession, attendanceTiming: { openBeforeStartMinutes: 3, onTimeUntilMinutes: 2, lateWindowMinutes: 120 } };
  const extendedChecks = phase(extendedLateWindow, new Date('2026-10-25T05:01:59Z')) === 'late'
    && phase(extendedLateWindow, new Date('2026-10-25T05:02:00Z')) === 'closed'
    && !validateTiming(extendedLateWindow.attendanceTiming);
  const individualizedChecks = phase(syncSession, new Date('2026-10-25T03:03:00Z')) === 'late'
    && phase({ ...syncSession, attendanceTiming: { openBeforeStartMinutes: 1, onTimeUntilMinutes: 5, lateWindowMinutes: 4 } }, new Date('2026-10-25T03:03:00Z')) === 'on_time';
  const legacyTiming = { openBeforeStartMinutes: 10, onTimeUntilMinutes: 2, lateUntilMinutes: 8 };
  const migrationChecks = JSON.stringify(normalizeSessionAttendance({ ...syncSession }).attendanceTiming) === JSON.stringify({ openBeforeStartMinutes: 3, onTimeUntilMinutes: 2, lateWindowMinutes: 10 })
    && JSON.stringify(normalizeSessionAttendance({ ...syncSession, attendanceTiming: legacyTiming }).attendanceTiming) === JSON.stringify({ openBeforeStartMinutes: 10, onTimeUntilMinutes: 2, lateWindowMinutes: 6 })
    && JSON.stringify(timing({ invalid: true })) === JSON.stringify({ openBeforeStartMinutes: 3, onTimeUntilMinutes: 2, lateWindowMinutes: 10 });
  const validationChecks = !validateTiming(custom)
    && Boolean(validateTiming({ ...custom, onTimeUntilMinutes: 2.5 }))
    && Boolean(validateTiming({ ...custom, lateWindowMinutes: 121 }));
  const overrideChecks = elig({ mode: 'Async', attendanceRequired: true }) === true
    && elig({ mode: 'Sync', attendanceRequired: false }) === false
    && elig({ mode: 'Sync' }) === true && elig({ mode: 'Async' }) === false;
  const timingDefaults = JSON.stringify(timing({})) === JSON.stringify({ openBeforeStartMinutes: 3, onTimeUntilMinutes: 2, lateWindowMinutes: 10 });
  const legacyDefaultMigration = JSON.stringify(normalizeSessionAttendance({ ...syncSession, attendanceTiming: { openBeforeStartMinutes: 3, onTimeUntilMinutes: 2, lateUntilMinutes: 12 } }).attendanceTiming) === JSON.stringify({ openBeforeStartMinutes: 3, onTimeUntilMinutes: 2, lateWindowMinutes: 10 });
  if (phaseChecks.every(([want, got]) => got === want) && asyncNull && customChecks && extendedChecks && individualizedChecks && migrationChecks && legacyDefaultMigration && validationChecks && overrideChecks && timingDefaults) console.log('OK    per-session attendance boundaries + defaults + validation + eligibility');
  else { console.log('FAIL  attendance timing got ' + JSON.stringify({ phaseChecks, asyncNull, customChecks, extendedChecks, individualizedChecks, migrationChecks, legacyDefaultMigration, validationChecks, overrideChecks, timingDefaults })); failed++; }
  const released = mod2.__panels.isGradeReleased({ gradesReleased: true });
  const hidden = mod2.__panels.isGradeReleased({ gradesReleased: false });
  const submittedUngraded = mod2.__panels.attemptGradeStatus({ status: 'submitted', questionOrder: ['q1'], answers: { q1: 'x' }, reviews: {} }, mockAssessment);
  const submittedGraded = mod2.__panels.attemptGradeStatus(mockAttempt, mockAssessment);
  const fp = mod2.__panels.getDeviceFingerprint();
  if (released === true && hidden === false && submittedUngraded === 'pending_review' && submittedGraded === 'graded' && typeof fp === 'string' && fp.startsWith('dev-')) console.log('OK    grade/device helpers');
  else { console.log('FAIL  grade/device helpers got ' + JSON.stringify({ released, hidden, submittedUngraded, submittedGraded, fp })); failed++; }
} catch (err) { console.log('FAIL  grade/device helpers: ' + err.message); failed++; }

// [PLAN] Main Room defaults, AFA attendance gating, collapsible grade details.
try {
  const ensuredEmpty = mod2.__panels.ensureMainRoom([]);
  const ensuredAgain = mod2.__panels.ensureMainRoom(ensuredEmpty.rooms);
  const mainRooms = [{ id: 'room-main', name: 'Main Room', fellowIds: [] }];
  const visMain = mod2.__panels.isSessionVisibleToFellow({ roomIds: ['room-main'], rooms: [], afaGroup: '' }, { role: 'fellow', fellowId: 'fe9', email: 'new@x.dev' }, [{ id: 'fe9', email: 'new@x.dev' }], mainRooms);
  const visOther = mod2.__panels.isSessionVisibleToFellow({ roomIds: ['r1'], rooms: [], afaGroup: '' }, { role: 'fellow', fellowId: 'fe9', email: 'new@x.dev' }, [{ id: 'fe9', email: 'new@x.dev' }], [{ id: 'r1', name: 'Room A', fellowIds: ['someone-else'] }]);
  const mainVisible = mod2.__panels.getVisibleRooms({ rooms: [], roomIds: ['room-main'] }, { role: 'fellow', email: 'stranger@x.dev' }, [], mainRooms);
  const afaHtml = renderHtml('AttendanceRecordsPanel-afa');
  const fullHtml = renderHtml('AttendanceRecordsPanel');
  const gradesHtml = renderHtml('FellowGradesPanel-released');
  const planChecks = [
    ['main room auto-created once', ensuredEmpty.room.name === 'Main Room' && ensuredAgain.rooms === ensuredEmpty.rooms && ensuredAgain.room.id === ensuredEmpty.room.id],
    ['main-room targeting does not hide sessions', visMain === true],
    ['other rooms still restrict', visOther === false],
    ['main room link visible to non-member fellow', mainVisible.length === 1],
    ['AFA staffer sees own-group note', afaHtml.includes('their own AFA group')],
    ['AFA staffer blocked outside own group', afaHtml.includes('Not your AFA group')],
    ['bulk actions hidden from AFA staff', !afaHtml.includes('Mark all On Time')],
    ['full admin keeps all attendance buttons', !fullHtml.includes('Not your AFA group') && fullHtml.includes('On Time') && fullHtml.includes('Mark all On Time')],
    ['grade details collapsed by default', gradesHtml.includes('Show question details') && !gradesHtml.includes('Feedback: Good')],
    ['assign-rooms button removed', !renderHtml('ViewPanel').includes('Assign rooms')],
    ['fellow sidebar behind one gate', renderHtml('Sidebar-fellow').includes('Practice Teaching')],
  ];
  const planBad = planChecks.filter(([, ok]) => !ok).map(([label]) => label);
  if (!planBad.length) console.log('OK    plan: Main Room + AFA gating + collapsible grades + assign-flow removal');
  else { console.log('FAIL  plan checks: ' + planBad.join('; ') + ' :: ' + JSON.stringify({ visMain, visOther, mainVisibleLen: mainVisible.length })); failed++; }
} catch (err) { console.log('FAIL  plan checks: ' + err.message); failed++; }

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
    ['onlineUsers', true, true, true, false, 'onlineUsers'],
    ['onlineUsers', true, false, false, false, 'dashboard'],
    ['onlineUsers', false, false, false, true, 'overview'],
    ['bogus', true, false, false, false, 'dashboard'],
    ['bogus', false, false, false, true, 'overview'],
    ['bogus', false, false, false, false, 'calendar'],
  ];
  const nhtBad = nhtChecks.filter(([h, a, f, s, fl, want]) => nht(h, a, f, s, fl) !== want);
  if (!nhtBad.length) console.log('OK    normalizeHashTab routing rules');
  else { console.log('FAIL  normalizeHashTab got ' + JSON.stringify(nhtBad)); failed++; }
} catch (err) { console.log('FAIL  normalizeHashTab: ' + err.message); failed++; }

// TnDOS desktop icons must preserve the existing role-based navigation.
try {
  const getTabs = mod2.__panels.getSidebarTabs;
  const adminTabs = getTabs({ isAdmin: true, isFullAdmin: true, isSuperadmin: true, isFellow: false, openRequests: 2 });
  const fellowTabs = getTabs({ isAdmin: false, isFullAdmin: false, isSuperadmin: false, isFellow: true });
  const tabChecks = [
    ['every admin menu item has an icon', adminTabs.every(item => !!item.icon)],
    ['admin menu retains online users', adminTabs.some(item => item.id === 'onlineUsers')],
    ['admin menu retains request count', adminTabs.some(item => item.id === 'requests' && item.label.includes('(2)'))],
    ['fellow menu excludes staff-only modules', !fellowTabs.some(item => ['planners', 'onlineUsers', 'fellows'].includes(item.id))],
    ['fellow menu items all have icons', fellowTabs.every(item => !!item.icon)],
  ];
  const tabFailures = tabChecks.filter(([, ok]) => !ok).map(([label]) => label);
  if (!tabFailures.length) console.log('OK    TnDOS icon navigation keeps existing role access');
  else { console.log('FAIL  TnDOS navigation: ' + tabFailures.join('; ')); failed++; }
} catch (err) { console.log('FAIL  TnDOS navigation: ' + err.message); failed++; }

// Fellow gating: systemAccessFor must not stamp the legacy 'full' onto Fellows,
// and deriveRoleFlags must keep Fellows out of isAdmin/isFullAdmin even when an
// auth object carries access: 'full' (regression: Fellows saw the full admin
// sidebar -- Attendance records, Time Summary, Fellows, Rooms, Incidents...).
try {
  const sysAccess = mod2.__panels.systemAccessFor;
  const flags = mod2.__panels.deriveRoleFlags;
  const fAcc = sysAccess({ role: 'fellow' }, 'winter_academy');
  const fAccExplicit = sysAccess({ role: 'fellow', access: 'full' }, 'winter_academy');
  const staffAcc = sysAccess({ role: 'planner' }, 'winter_academy');
  const flagsFellow = flags({ role: 'fellow' });
  const flagsFellowPoisoned = flags({ role: 'fellow', access: 'full' });
  const flagsSuper = flags({ role: 'superadmin' });
  const flagsAfaFull = flags({ role: 'afa', access: 'full' });
  const flagsResStaff = flags({ role: 'academy_lead', access: 'resources' });
  const sidebarFellow = renderHtml('Sidebar-derived-fellow');
  const fellowNav = [...sidebarFellow.matchAll(/href="#([A-Za-z]+)"/g)].map(m => m[1]);
  const gatingChecks = [
    ['fellow access not stamped full', fAcc === undefined],
    ['fellow explicit access passes through', fAccExplicit === 'full'],
    ['staff legacy fallback stays full', staffAcc === 'full'],
    ['plain fellow is not admin', flagsFellow.isAdmin === false && flagsFellow.isFullAdmin === false && flagsFellow.isFellow === true],
    ['fellow with access full still blocked', flagsFellowPoisoned.isAdmin === false && flagsFellowPoisoned.isFullAdmin === false],
    ['superadmin keeps admin', flagsSuper.isAdmin === true && flagsSuper.isFullAdmin === true],
    ['AFA full keeps attendance admin', flagsAfaFull.isAdmin === true && flagsAfaFull.isFullAdmin === true],
    ['resources-only staff stays non-full', flagsResStaff.isAdmin === true && flagsResStaff.isFullAdmin === false],
    ['fellow sidebar is exactly 5 items ending at Legend', JSON.stringify(fellowNav) === JSON.stringify(['overview', 'calendar', 'fellowAnalytics', 'fellowPractice', 'legend'])],
    ['fellow sidebar hides admin pages', !sidebarFellow.includes('Attendance records') && !sidebarFellow.includes('Time Summary') && !sidebarFellow.includes('Incidents') && !sidebarFellow.includes('Devices') && !sidebarFellow.includes('WA Staff')],
  ];
  const badGate = gatingChecks.filter(([, ok]) => !ok).map(([label]) => label);
  if (!badGate.length) console.log('OK    fellow gating: systemAccessFor + deriveRoleFlags + sidebar');
  else { console.log('FAIL  fellow gating: ' + badGate.join('; ') + ' :: ' + JSON.stringify({ fAcc, staffAcc, fellowNav })); failed++; }
} catch (err) { console.log('FAIL  fellow gating: ' + err.message); failed++; }
// weekForDate: 2026-10-25 is a Sunday → dates map to correct week indexes
// Week 00 is the full week before (Oct 18-24), Week 01 is Oct 25-31, etc.
const wf = mod2.__panels.weekForDate;
const wfChecks = [['2026-10-18', 0], ['2026-10-24', 0], ['2026-10-25', 1], ['2026-10-31', 1], ['2026-11-01', 2], ['2026-11-07', 2], ['2026-11-08', 3]];
for (const [d, expected] of wfChecks) {
  const got = wf(d, '2026-10-25');
  if (got === expected) console.log('OK    weekForDate ' + d + ' → ' + got);
  else { console.log('FAIL  weekForDate ' + d + ' → ' + got + ' (expected ' + expected + ')'); failed++; }
}

// Fellow week-visibility (regression): the Fellow filter must hide sessions by the
// week their DATE occupies in the grid (anchor = start date's Sunday-of-week-before),
// NOT by the possibly-stale stored session.week field. Otherwise, deselecting a week
// in the admin panel left its sessions visible because the grid rendered them by date.
try {
  const ew = mod2.__panels.effectiveWeekOf;
  const startDate = '2026-10-25';
  // Stored week is stale (0) but the session's date falls in Week 2 (Nov 1-7):
  const stale = { date: '2026-11-01', week: 0 };
  // Stored week agrees with the date:
  const consistent = { date: '2026-11-01', week: 2 };
  // No date → fall back to stored week (how unscheduled sessions appear in the grid):
  const noDate = { date: '', week: 3 };
  // Date but no start date → cannot derive, fall back to stored week:
  const noStart = { date: '2026-11-01', week: 5 };
  const staleGot = ew(stale, startDate);
  const consistentGot = ew(consistent, startDate);
  const noDateGot = ew(noDate, startDate);
  const noStartGot = ew(noStart, null);
  // Simulate the Fellow calendarSessions filter with Week 2 deselected:
  const fellowWeeksOff = [0, 1, 3, 4, 5, 6]; // Week 2 unchecked
  const fellowWeeksOn = [0, 1, 2, 3, 4, 5, 6];
  const hiddenWhenOff = !fellowWeeksOff.includes(ew(stale, startDate));
  const shownWhenOn = fellowWeeksOn.includes(ew(stale, startDate));
  const ewChecks = [
    ['date-derived week wins over stale stored week', staleGot === 2],
    ['matching date/week stays consistent', consistentGot === 2],
    ['no date falls back to stored week', noDateGot === 3],
    ['no start date falls back to stored week', noStartGot === 5],
    ['stale session hidden when its DATE week is off', hiddenWhenOff === true],
    ['stale session shown when its DATE week is on', shownWhenOn === true],
  ];
  const ewBad = ewChecks.filter(([, ok]) => !ok).map(([label]) => label);
  if (!ewBad.length) console.log('OK    fellow week visibility: date-derived week filters stale sessions');
  else { console.log('FAIL  fellow week visibility: ' + ewBad.join('; ') + ' :: ' + JSON.stringify({ staleGot, consistentGot, noDateGot, noStartGot, hiddenWhenOff, shownWhenOn })); failed++; }
} catch (err) { console.log('FAIL  fellow week visibility: ' + err.message); failed++; }

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

// Session assessment marks: admin panel + fellow view + ViewPanel
try {
  const marksHtml = renderHtml('SessionMarksPanel');
  const marksEmptyHtml = renderHtml('SessionMarksPanel-empty');
  const fellowMarksHtml = renderHtml('FellowAnalyticsPanel-marks');
  const fellowNoMarksHtml = renderHtml('FellowAnalyticsPanel');
  const viewHtml = renderHtml('ViewPanel');
  const marksChecks = [
    ['admin panel renders with total checkbox', marksHtml.includes('This session has an assessment')],
    ['admin panel shows session total when set', marksHtml.includes('Total marks:')],
    ['admin panel per-fellow table has no Total column', marksHtml.includes('>Fellow<') && marksHtml.includes('>Track / AFA<') && marksHtml.includes('>Mark<') && marksHtml.includes('>Actions<')],
    ['empty marks panel renders', marksEmptyHtml.length > 60],
    ['fellow with marks sees session assessment section', fellowMarksHtml.includes('Session assessment marks')],
    ['fellow with marks sees total', fellowMarksHtml.includes('10')],
    ['fellow with marks sees own mark', fellowMarksHtml.includes('8')],
    ['fellow without marks still sees assessment table', fellowNoMarksHtml.includes('Session assessment marks')],
    ['ViewPanel shows assessment total', viewHtml.includes('Total marks:') && viewHtml.includes('10')],
  ];
  const badMarks = marksChecks.filter(([, ok]) => !ok).map(([label]) => label);
  if (!badMarks.length) console.log('OK    session assessment marks (admin + fellow + ViewPanel)');
  else { console.log('FAIL  session marks: ' + badMarks.join('; ')); failed++; }
} catch (err) { console.log('FAIL  session marks: ' + err.message); failed++; }

await vite.close();
console.log(failed === 0 ? 'ALL PANELS RENDER OK' : failed + ' PANEL(S) FAILED');
process.exit(failed === 0 ? 0 : 1);
