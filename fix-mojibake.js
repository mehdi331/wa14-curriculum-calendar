const fs = require('fs');
const p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
let s = fs.readFileSync(p,'utf8');

// Fix mojibake using Unicode escapes (avoid encoding issues in the script itself)
// These sequences are UTF-8 bytes interpreted as Windows-1252 then re-encoded
const fixes = [
  ['\u00E2\u20AC\u201D', '\u2014'],  // â€" → em dash (—)
  ['\u00E2\u20AC\u2013', '\u2013'],  // â€" → en dash (–)
  ['\u00E2\u20AC\u2039', '\u2039'],  // â€¹ → single left angle (‹)
  ['\u00E2\u20AC\u203A', '\u203A'],  // â€º → single right angle (›)
  ['\u00E2\u20AC\u2026', '\u2026'],  // â€¦ → ellipsis (…)
  ['\u00E2\u20AC\u0099', '\u2019'],  // â€™ → right single quote (')
  ['\u00E2\u20AC\u2122', '\u2122'],  // â„¢ → trademark (™)
  ['\u00E2\u20AC\u201C', '\u201C'],  // â€œ → left double quote (")

  // These two are trickier because they involve a literal quote char
  ['\u00E2\u20AC\x22', '\u201D'],    // â€" → right double quote (")
  ['\u00C2\u00B7', '\u00B7'],         // Â· → middle dot (·)
  ['\u00C2\x20', ''],                // Â  → nothing (non-breaking space artifact)
  ['\u00C2', ''],                    // Â → nothing
];

let count = 0;
fixes.forEach(([from,to]) => {
  // Escape regex special chars in 'from'
  const escaped = from.replace(/[.*+?^${}()|[\\]\\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  let m;
  while ((m = re.exec(s)) !== null) {
    s = s.slice(0, m.index) + to + s.slice(re.lastIndex);
    re.lastIndex = m.index + to.length;
    count++;
  }
});

fs.writeFileSync(p, s, 'utf8');
console.log('Total mojibake fixed:', count);

// Show remaining problematic chars
const remaining = [];
['\u20AC','\u00E2\u20AC','\u00C2'].forEach(ch => {
  const c = (s.match(new RegExp(ch.replace(/[.*+?^${}()|[\\]\\\]/g,'\\$&'),'g'))||[]).length;
  if (c > 0) remaining.push(ch + ': ' + c);
});
if (remaining.length) console.log('Remaining:', remaining.join(', '));
else console.log('No remaining mojibake patterns');
