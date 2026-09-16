// One-off: academy overview, historical archives, session reuse (per approved plan).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let failed = 0;

const mkApply = () => {
  let text = '';
  return {
    get: () => text,
    set: (t) => { text = t; },
    apply(findN, replaceN, label) {
      for (const sep of ['\r\n', '\n']) {
        const find = findN.split('\n').join(sep);
        const replace = replaceN === null ? '' : replaceN.split('\n').join(sep);
        const n = text.split(find).length - 1;
        if (n === 1) { text = text.replace(find, replace); console.log('OK    ' + label); return; }
        if (n > 1) { console.log('BAD   ' + label + ' (count=' + n + ')'); failed++; return; }
      }
      console.log('MISS  ' + label); failed++;
    },
  };
};
const app = mkApply();
app.set(fs.readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8'));

// --- 0. storage.js: new keys ---
{
  const sFile = path.join(root, 'src', 'storage.js');
  let s = fs.readFileSync(sFile, 'utf8');
  const anchor = 'export function parseStoredArray(record) {';
  if (s.split(anchor).length - 1 !== 1) { console.log('BAD   storage.js anchor'); failed++; }
  else {
    s = s.replace(anchor, 'export const ACADEMY_KEYS = {\n  academyOverview: \'wa14-academy-overview\',\n  historicalAcademies: \'wa-historical-academies\',\n};\n\n' + anchor);
    fs.writeFileSync(sFile, s);
    console.log('OK    storage.js ACADEMY_KEYS');
  }
}

// --- 1. imports ---
app.apply(
  "import { storage, ASSESSMENT_KEYS, parseStoredArray } from './storage';",
  "import { storage, ASSESSMENT_KEYS, ACADEMY_KEYS, parseStoredArray } from './storage';",
  'imports: ACADEMY_KEYS'
);

// --- 2. HASH_TABS + normalizeHashTab ---
app.apply(
  "const HASH_TABS = ['dashboard', 'calendar', 'sessions', 'attendance', 'summary', 'fellows', 'rooms', 'sessionTypes', 'pillarTags', 'modes', 'requests', 'assessments', 'review', 'analytics', 'incidents', 'devices', 'planners', 'roles', 'staffCalendar', 'legend'];",
  "const HASH_TABS = ['dashboard', 'calendar', 'sessions', 'attendance', 'summary', 'fellows', 'rooms', 'sessionTypes', 'pillarTags', 'modes', 'requests', 'assessments', 'review', 'analytics', 'incidents', 'devices', 'planners', 'roles', 'staffCalendar', 'legend', 'overview', 'fellowAnalytics', 'academyArchives'];",
  'HASH_TABS extended'
);

app.apply(
  "function normalizeHashTab(hash, isAdmin, isFullAdmin, isSuperadmin) {\n"
  + "  const base = HASH_TABS.includes(hash) ? hash : (isAdmin ? 'dashboard' : 'calendar');\n"
  + "  if (base === 'staffCalendar' && isAdmin) return 'staffCalendar';\n"
  + "  if (base === 'calendar') return 'calendar';\n"
  + "  if (base === 'dashboard') return isAdmin ? 'dashboard' : 'calendar';\n"
  + "  if (base === 'legend') return 'legend';\n"
  + "  if (base === 'sessions' && isAdmin) return 'sessions';\n"
  + "  if (base === 'attendance' && isFullAdmin) return 'attendance';\n"
  + "  if ((base === 'summary' || base === 'fellows' || base === 'rooms' || base === 'sessionTypes' || base === 'pillarTags' || base === 'modes' || base === 'requests') && isFullAdmin) return base;\n"
  + "  if ((base === 'assessments' || base === 'review' || base === 'analytics') && isAdmin) return base;\n"
  + "  if ((base === 'incidents' || base === 'devices') && isFullAdmin) return base;\n"
  + "  if ((base === 'planners' || base === 'roles') && isSuperadmin) return base;\n"
  + "  return 'calendar';\n"
  + "}",
  "function normalizeHashTab(hash, isAdmin, isFullAdmin, isSuperadmin, isFellow) {\n"
  + "  const home = isAdmin ? 'dashboard' : (isFellow ? 'overview' : 'calendar');\n"
  + "  const base = HASH_TABS.includes(hash) ? hash : home;\n"
  + "  if (base === 'staffCalendar' && isAdmin) return 'staffCalendar';\n"
  + "  if (base === 'calendar') return 'calendar';\n"
  + "  if (base === 'overview') return 'overview';\n"
  + "  if (base === 'fellowAnalytics' && isFellow) return 'fellowAnalytics';\n"
  + "  if (base === 'dashboard') return isAdmin ? 'dashboard' : home;\n"
  + "  if (base === 'legend') return 'legend';\n"
  + "  if (base === 'sessions' && isAdmin) return 'sessions';\n"
  + "  if (base === 'attendance' && isFullAdmin) return 'attendance';\n"
  + "  if ((base === 'summary' || base === 'fellows' || base === 'rooms' || base === 'sessionTypes' || base === 'pillarTags' || base === 'modes' || base === 'requests') && isFullAdmin) return base;\n"
  + "  if ((base === 'assessments' || base === 'review' || base === 'analytics') && isAdmin) return base;\n"
  + "  if ((base === 'incidents' || base === 'devices' || base === 'academyArchives') && isFullAdmin) return base;\n"
  + "  if ((base === 'planners' || base === 'roles') && isSuperadmin) return base;\n"
  + "  return home;\n"
  + "}",
  'normalizeHashTab: fellow home = overview'
);

app.apply(
  "  const isFullAdmin = isSuperadmin || isFullControl;",
  "  const isFullAdmin = isSuperadmin || isFullControl;\n  const isFellow = auth.role === 'fellow';",
  'isFellow const'
);
app.apply(
  "  const [tab, setTab] = useState(() => normalizeHashTab(window.location.hash.slice(1), isAdmin, isFullAdmin, isSuperadmin));",
  "  const [tab, setTab] = useState(() => normalizeHashTab(window.location.hash.slice(1), isAdmin, isFullAdmin, isSuperadmin, isFellow));",
  'tab init: isFellow'
);
app.apply(
  "    const onHash = () => setTab(normalizeHashTab(window.location.hash.slice(1), isAdmin, isFullAdmin, isSuperadmin));",
  "    const onHash = () => setTab(normalizeHashTab(window.location.hash.slice(1), isAdmin, isFullAdmin, isSuperadmin, isFellow));",
  'hash listener: isFellow'
);
app.apply(
  "  }, [isAdmin, isFullAdmin, isSuperadmin]);",
  "  }, [isAdmin, isFullAdmin, isSuperadmin, isFellow]);",
  'hash listener deps'
);
// --- 3. state / load / persist / gate ---
app.apply(
  "  const [academySettings, setAcademySettings] = useState(null);",
  "  const [academySettings, setAcademySettings] = useState(null);\n  const [academyOverview, setAcademyOverview] = useState(null);",
  'state: academyOverview'
);
app.apply(
  "  const settingsSaveTimer = useRef(null);",
  "  const settingsSaveTimer = useRef(null);\n  const overviewSaveTimer = useRef(null);",
  'ref: overviewSaveTimer'
);
app.apply(
  "  const persistSettings = debouncedPersist(setAcademySettings, settingsSaveTimer, 'wa14-settings');",
  "  const persistSettings = debouncedPersist(setAcademySettings, settingsSaveTimer, 'wa14-settings');\n  const persistAcademyOverview = debouncedPersist(setAcademyOverview, overviewSaveTimer, ACADEMY_KEYS.academyOverview);",
  'persist: persistAcademyOverview'
);
app.apply(
  "      catch (e) { setAcademySettings({ fellowWeeks: WEEKS }); }",
  "      catch (e) { setAcademySettings({ fellowWeeks: WEEKS }); }\n"
  + "      try { const r = await storage.get(ACADEMY_KEYS.academyOverview); setAcademyOverview(r && r.value ? JSON.parse(r.value) : { academyName: 'Winter Academy 14', theme: '', vision: '', goals: [], outcomes: [], pillars: [] }); }\n"
  + "      catch (e) { setAcademyOverview({ academyName: 'Winter Academy 14', theme: '', vision: '', goals: [], outcomes: [], pillars: [] }); }",
  'load: academyOverview'
);
app.apply(
  "!academySettings || !assessments",
  "!academySettings || !academyOverview || !assessments",
  'loading gate: academyOverview'
);

// --- 4. session import handler ---
app.apply(
  "  showToast('Attendance exported');\n};",
  "  showToast('Attendance exported');\n};\n\nconst importArchivedSessions = (imported) => {\n  if (!Array.isArray(imported) || !imported.length) return;\n  persist([...(sessions || []), ...imported]);\n  showToast(imported.length + ' session' + (imported.length === 1 ? '' : 's') + ' imported from archive');\n};",
  'handler: importArchivedSessions'
);

// --- 5. sidebar tabs ---
app.apply(
  "  const tabs = [\n    ...(isAdmin ? [{ id: 'dashboard', label: 'Dashboard', icon: BarChart3 }] : []),",
  "  const tabs = [\n    { id: 'overview', label: 'Vision, Goals & Pillars', icon: GradCapIcon },\n    ...(isAdmin ? [{ id: 'dashboard', label: 'Dashboard', icon: BarChart3 }] : []),",
  'sidebar: overview tab first'
);
app.apply(
  "      { id: 'requests', label: 'Requests' + (openRequests ? ' (' + openRequests + ')' : ''), icon: MessageSquare },\n    ] : []),",
  "      { id: 'requests', label: 'Requests' + (openRequests ? ' (' + openRequests + ')' : ''), icon: MessageSquare },\n      { id: 'academyArchives', label: 'Historical Academies', icon: Clock },\n    ] : []),",
  'sidebar: Historical Academies tab'
);

// --- 6. render blocks ---
app.apply(
  "          {tab === 'fellowAnalytics' && auth.role === 'fellow' && (\n"
  + "            <FellowAnalyticsPanel sessions={sessions} attendance={attendance} auth={auth} assessments={assessments} attempts={assessmentAttempts} roster={roster} />\n"
  + "          )}",
  "          {tab === 'fellowAnalytics' && auth.role === 'fellow' && (\n"
  + "            <FellowAnalyticsPanel sessions={sessions} attendance={attendance} auth={auth} assessments={assessments} attempts={assessmentAttempts} roster={roster} />\n"
  + "          )}\n"
  + "          {tab === 'overview' && (\n"
  + "            <AcademyOverviewPanel overview={academyOverview} onChange={persistAcademyOverview} canEdit={isAdmin} />\n"
  + "          )}\n"
  + "          {tab === 'academyArchives' && isFullAdmin && (\n"
  + "            <HistoricalAcademiesPanel\n"
  + "              current={{ academyName: (academyOverview && academyOverview.academyName) || 'Winter Academy 14', theme: (academyOverview && academyOverview.theme) || '', vision: (academyOverview && academyOverview.vision) || '', goals: (academyOverview && academyOverview.goals) || [], outcomes: (academyOverview && academyOverview.outcomes) || [], pillars: (academyOverview && academyOverview.pillars) || [], startDate: (academySettings && academySettings.startDate) || null, endDate: (academySettings && academySettings.endDate) || null, sessions: sessions || [], attendance: attendance || [], assessments: assessments || [], questions: assessmentQuestions || [], attempts: assessmentAttempts || [], rooms: rooms || [], staff: planners || [], roster: roster || [] }}\n"
  + "              onImportSessions={importArchivedSessions}\n"
  + "              showToast={showToast}\n"
  + "            />\n"
  + "          )}",
  'render: overview + academyArchives blocks'
);

// --- 7. exports ---
app.apply(
  "FellowOverview, AttendanceRecordsPanel, MyAttendancePanel, FellowAnalyticsPanel, FellowRecentAttempts, IncidentLogPanel",
  "FellowOverview, AttendanceRecordsPanel, MyAttendancePanel, FellowAnalyticsPanel, FellowRecentAttempts, AcademyOverviewPanel, HistoricalAcademiesPanel, ReuseSessionsModal, normalizeHashTab, IncidentLogPanel",
  'exports: new panels + normalizeHashTab'
);
// --- 8. new components (read from scripts/_academy-components.jsx, inserted before AssessmentInstruction) ---
{
  const compFile = path.join(root, 'scripts', '_academy-components.jsx');
  let comp = fs.readFileSync(compFile, 'utf8');
  if (comp.charCodeAt(0) === 0xFEFF) comp = comp.slice(1);
  app.apply('function AssessmentInstruction({ assessment, sessionName, onStart, onBack, resumed }) {', comp + '\nfunction AssessmentInstruction({ assessment, sessionName, onStart, onBack, resumed }) {', 'new: overview/history/reuse components');
}

fs.writeFileSync(path.join(root, 'src', 'App.jsx'), app.get());
console.log(failed ? 'PATCH FAILED: ' + failed + ' issue(s)' : 'APP PATCH COMPLETE');
if (failed) process.exit(1);

// --- 9. cases.jsx ---
{
  const casesFile = path.join(root, 'scripts', 'cases.jsx');
  let c = fs.readFileSync(casesFile, 'utf8');
  const anchor = "  ['FellowAnalyticsPanel', () => <P.FellowAnalyticsPanel sessions={sessions} attendance={attendanceRecs} auth={fellowAuth} assessments={assessments} attempts={attempts} roster={roster} />],";
  if (c.split(anchor).length - 1 !== 1) { console.log('BAD   cases anchor'); failed++; }
  else {
    const add = "\n"
      + "  ['AcademyOverviewPanel', () => <P.AcademyOverviewPanel overview={{ academyName: 'Winter Academy 14', theme: 'Foundations', vision: 'Every child receives an excellent education.', goals: ['Goal one', 'Goal two'], outcomes: ['Outcome one'], pillars: ['Pillar A', 'Pillar B'] }} onChange={noop} canEdit={false} />],\n"
      + "  ['AcademyOverviewPanel-edit', () => <P.AcademyOverviewPanel overview={null} onChange={noop} canEdit />],\n"
      + "  ['HistoricalAcademiesPanel-empty', () => <P.HistoricalAcademiesPanel current={{ academyName: 'Winter Academy 14', sessions: [], attendance: [], assessments: [], questions: [], attempts: [], rooms: [], staff: [], roster: [] }} onImportSessions={noop} showToast={noop} />],\n"
      + "  ['ReuseSessionsModal', () => <P.ReuseSessionsModal archive={{ academyName: 'Winter Academy 13', sessions: [{ id: 1, name: 'Old session', week: 1, date: '2025-11-02', start: '09:00', end: '10:30', facilitators: [{ staffName: 'Nusrat' }], resources: [{ id: 'r1', label: 'Deck', url: 'https://x.dev' }] }] }} onClose={noop} onImport={noop} />],";
    c = c.replace(anchor, anchor + add);
    fs.writeFileSync(casesFile, c);
    console.log('OK    cases: 4 new cases added');
  }
}

// --- 10. render-test.mjs: normalizeHashTab routing tests ---
{
  const rtFile = path.join(root, 'scripts', 'render-test.mjs');
  let rt = fs.readFileSync(rtFile, 'utf8');
  const anchor = "// weekForDate: 2026-10-25 is a Sunday";
  if (rt.split(anchor).length - 1 !== 1) { console.log('BAD   render-test anchor'); failed++; }
  else {
    const add = [
      "// normalizeHashTab routing rules",
      "try {",
      "  const nht = mod2.__panels.normalizeHashTab;",
      "  const nhtChecks = [",
      "    ['', false, false, false, true, 'overview'],",
      "    ['fellowAnalytics', false, false, false, true, 'fellowAnalytics'],",
      "    ['dashboard', false, false, false, true, 'overview'],",
      "    ['academyArchives', false, false, false, true, 'overview'],",
      "    ['', true, true, true, false, 'dashboard'],",
      "    ['academyArchives', true, true, true, false, 'academyArchives'],",
      "    ['overview', true, true, true, false, 'overview'],",
      "    ['bogus', true, false, false, false, 'dashboard'],",
      "    ['bogus', false, false, false, true, 'overview'],",
      "    ['bogus', false, false, false, false, 'calendar'],",
      "  ];",
      "  const nhtBad = nhtChecks.filter(([h, a, f, s, fl, want]) => nht(h, a, f, s, fl) !== want);",
      "  if (!nhtBad.length) console.log('OK    normalizeHashTab routing rules');",
      "  else { console.log('FAIL  normalizeHashTab got ' + JSON.stringify(nhtBad)); failed++; }",
      "} catch (err) { console.log('FAIL  normalizeHashTab: ' + err.message); failed++; }",
      "",
    ].join('\n');
    rt = rt.replace(anchor, add + anchor);
    fs.writeFileSync(rtFile, rt);
    console.log('OK    render-test: normalizeHashTab tests added');
  }
}

console.log(failed ? 'PATCH FAILED: ' + failed + ' issue(s)' : 'ALL PATCHES COMPLETE');
process.exit(failed ? 1 : 0);

