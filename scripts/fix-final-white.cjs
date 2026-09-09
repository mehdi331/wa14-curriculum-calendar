var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix remaining #FFFFFF in "All sessions are scheduled."
s = s.replace(
  "fontSize:12.5,color:'#FFFFFF'}>All sessions are scheduled.",
  "fontSize:12.5,color:'#003223'}>All sessions are scheduled."
);

fs.writeFileSync(p, s, 'utf8');

console.log('Fixed remaining #FFFFFF in "All sessions are scheduled."');

// Final verification
var remaining = (s.match(/#FFFFFF/g) || []).length;
console.log('Remaining #FFFFFF in file:', remaining);
if (remaining > 0) {
  s.split('\n').forEach(function(l, i) {
    if (l.includes('#FFFFFF')) console.log('  Line ' + (i+1) + ': ' + l.substring(0, 100));
  });
}
