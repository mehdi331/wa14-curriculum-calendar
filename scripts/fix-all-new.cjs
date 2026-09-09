var fs = require('fs');
var path = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(path, 'utf8');

console.log('=== Starting fixes ===\n');

// Fix 1: Replace dagger symbols (U+2020) with -->
var daggerRe = /\u2020/g;
var daggerBefore = (s.match(daggerRe) || []).length;
s = s.replace(daggerRe, '-->');
var daggerAfter = (s.match(daggerRe) || []).length;
console.log('Dagger (U+2020):', daggerBefore, '->', daggerAfter, 'remaining');

// Fix 2: Change #B84C4C to #D0A023 (delete button color)
var B84C4CBefore = (s.match(/#B84C4C/g) || []).length;
s = s.replace(/#B84C4C/g, '#D0A023');
var B84C4CAfter = (s.match(/#B84C4C/g) || []).length;
var D0A023Count = (s.match(/#D0A023/g) || []).length;
console.log('#B84C4C -> #D0A023: replaced', B84C4CBefore, 'times (', D0A023Count, 'now)');

// Fix 3: Change faded calendar text colors to white
var fadedColors = [
  { from: '#5B6672', to: '#FFFFFF' },
  { from: '#8A96A3', to: '#FFFFFF' },
  { from: '#9AA5B1', to: '#FFFFFF' },
  { from: '#9FB0BE', to: '#FFFFFF' }
];

fadedColors.forEach(function(c) {
  var from = c.from, to = c.to;
  var re = new RegExp(from.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'), 'g');
  var before = (s.match(re) || []).length;
  s = s.replace(re, to);
  var after = (s.match(re) || []).length;
  console.log(from, '->', to + ':', before, 'replaced (', after, 'remaining)');
});

// Write back
fs.writeFileSync(path, s, 'utf8');
console.log('\n=== All fixes applied ===');

// Final verification
console.log('\nFinal verification:');
var check = {
  euro: (s.match(/\u20AC/g) || []).length,
  dagger: (s.match(/\u2020/g) || []).length,
  B84C4C: (s.match(/#B84C4C/g) || []).length,
  D0A023: (s.match(/#D0A023/g) || []).length,
  '5B6672': (s.match(/#5B6672/g) || []).length,
  '8A96A3': (s.match(/#8A96A3/g) || []).length,
  '9AA5B1': (s.match(/#9AA5B1/g) || []).length,
  '9FB0BE': (s.match(/#9FB0BE/g) || []).length
};
Object.keys(check).forEach(function(k) {
  console.log('  ' + k + ':', check[k]);
});
