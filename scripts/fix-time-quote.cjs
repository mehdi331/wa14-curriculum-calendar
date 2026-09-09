var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix: replace the quote between start and end times with a hyphen
// The current code is: s.start ? s.start+'\"'+s.end : '--'
// We want: s.start ? s.start+' - '+s.end : '--'
s = s.replace("s.start ? s.start+'\"'+s.end", "s.start ? s.start+' - '+s.end");

fs.writeFileSync(p, s, 'utf8');
console.log('Fixed time column quote');
