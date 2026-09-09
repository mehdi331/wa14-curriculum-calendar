var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix session list text colors: #FFFFFF → #003223

// Session card date/time text
s = s.replace(
  /color:'#FFFFFF',whiteSpace:'nowrap'\}>\{dateLabel\(s\.date\)\}/g,
  "color:'#003223',whiteSpace:'nowrap'}>{dateLabel(s.date)}"
);

// "All sessions are scheduled." text
s = s.replace(
  /fontSize:12\.5,color:'#FFFFFF'\}>All sessions are scheduled\./g,
  "fontSize:12.5,color:'#003223'}>All sessions are scheduled."
);

fs.writeFileSync(p, s, 'utf8');

console.log('Session list text color fixes applied:');
console.log('  Session card date/time → #003223');
console.log('  "All sessions are scheduled." → #003223');

// Verification
console.log('\nVerification:');
console.log('  Remaining #FFFFFF in session list:', (s.match(/color:'#FFFFFF',whiteSpace:'nowrap'\}/g) || []).length);
console.log('  Remaining #FFFFFF in "All sessions":', (s.match(/fontSize:12\.5,color:'#FFFFFF'\}>All/g) || []).length);
