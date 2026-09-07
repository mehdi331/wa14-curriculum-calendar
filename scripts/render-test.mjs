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

await vite.close();
console.log(failed === 0 ? 'ALL PANELS RENDER OK' : failed + ' PANEL(S) FAILED');
process.exit(failed === 0 ? 0 : 1);
