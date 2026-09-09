var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix remaining mojibake patterns
// â-->' (in comments/code) → → (right arrow)
s = s.replace(/â-->'/g, '→');

// â--¦ (ellipsis variant) → …
s = s.replace(/â--¦/g, '…');

// â-- (truncated at line end, followed by various chars) → …
s = s.replace(/â--/g, '…');

// Fix truncated "Loading schedule…" strings
s = s.replace(/Loading schedule…-/g, 'Loading schedule…');
s = s.replace(/Loading schedule…/g, 'Loading schedule…');

fs.writeFileSync(p, s, 'utf8');

console.log('Additional fixes applied:');
console.log('  â-->\' → → (right arrow)');
console.log('  â--¦ → … (ellipsis)');
console.log('  â-- → … (ellipsis)');
console.log('  Loading schedule… fixed');

// Final verification
console.log('\nFinal verification:');
console.log('  Remaining â--:', (s.match(/â--/g) || []).length);
console.log('  Remaining â:', (s.match(/â/g) || []).length);
console.log('  Remaining €:', (s.match(/€/g) || []).length);
