var path = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var fs = require('fs');
var s = fs.readFileSync(path, 'utf8');

// Mojiabake patterns: UTF-8 bytes interpreted as Windows-1252 then re-encoded
// Format: [searchString, replacementString]
var fixes = [
  // em dash U+2014  (â€")
  ['\u00E2\u20AC\u201D', '\u2014'],
  // en dash U+2013   (â€")
  ['\u00E2\u20AC\u2013', '\u2013'],
  // single left angle quote U+2039  (â€¹)
  ['\u00E2\u20AC\u2039', '\u2039'],
  // single right angle quote U+203A  (â€º)
  ['\u00E2\u20AC\u203A', '\u203A'],
  // ellipsis U+2026  (â€¦)
  ['\u00E2\u20AC\u2026', '\u2026'],
  // right single quote U+2019  (â€™)
  ['\u00E2\u20AC\u0099', '\u2019'],
  // trademark U+2122  (â„¢)
  ['\u00E2\u20AC\u2122', '\u2122'],
  // left double quote U+201C  (â€œ)
  ['\u00E2\u20AC\u201C', '\u201C'],
  // right double quote U+201D  (â€")  -- note: this ends with a literal " char
  ['\u00E2\u20AC\x22', '\u201D'],
  // middle dot U+00B7  (Â·)
  ['\u00C2\u00B7', '\u00B7'],
  // non-breaking space artifact U+00A0  (Â )
  ['\u00C2\u00A0', '\u00A0'],
  // stray A-circumflex (Â)  -- remove standalone
  ['\u00C2', ''],
];

var total = 0;
fixes.forEach(function(f) {
  var re = new RegExp(f[0].replace(/[.*+?^${}()|[\\]\\\]/g, '\\$&'), 'g');
  var m;
  while ((m = re.exec(s)) !== null) {
    s = s.slice(0, m.index) + f[1] + s.slice(re.lastIndex);
    re.lastIndex = m.index + f[1].length;
    total++;
  }
});

fs.writeFileSync(path, s, 'utf8');
console.log('Fixed mojibake occurrences:', total);

// Report remaining euro symbols
var euroCount = (s.match(/\u20AC/g) || []).length;
console.log('Remaining € symbols:', euroCount);
if (euroCount > 0) {
  console.log('Lines with €:');
  s.split('\n').forEach(function(line, i) {
    if (line.includes('\u20AC')) console.log((i+1) + ': ' + line.substring(0, 120));
  });
}
