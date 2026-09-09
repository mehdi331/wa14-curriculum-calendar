var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// FIX 1: Fellow-visible weeks checkbox label color -> #D5E0D5 (light on dark bg)
s = s.replace(
  "color: fellowWeeks.includes(w) ? '#003223' : '#D5E0D5'",
  "color: '#D5E0D5'"
);

// FIX 1: Day-selector checkbox label color -> #D5E0D5 (light on dark bg)
s = s.replace(
  "color: !hiddenDays[d] ? '#003223' : '#D5E0D5'",
  "color: '#D5E0D5'"
);

fs.writeFileSync(p, s, 'utf8');
console.log('Fix 1 applied: checkbox label colors -> #D5E0D5');

// FIX 2: Fix calendar scroll clipping
var cssPath = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/styles.css';
var css = fs.readFileSync(cssPath, 'utf8');

// Change .wa14-content overflow-x from hidden to visible so calendar can scroll
css = css.replace(
  '.wa14-content { flex: 1; min-width: 0; overflow-x: hidden; }',
  '.wa14-content { flex: 1; min-width: 0; overflow-x: visible; }'
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Fix 2 applied: .wa14-content overflow-x -> visible');

// Verification
var s2 = fs.readFileSync(p, 'utf8');
console.log('');
console.log('Verification:');
console.log('  Fellow-visible weeks color:', s2.includes("color: '#D5E0D5'"));
console.log('  Day-selector color:', s2.includes("color: '#D5E0D5'"));
console.log('  .wa14-content overflow-x:', css.includes('overflow-x: visible'));
