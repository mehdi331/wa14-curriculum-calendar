var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix Fellow-visible weeks text color: #003223 → #D5E0D5
s = s.replace(
  /fontSize:12\.5,color:'#003223'}}><b>Fellow-visible weeks<\/b>/g,
  "fontSize:12.5,color:'#D5E0D5'}}><b>Fellow-visible weeks</b>"
);

// Fix day labels text color: #003223 → #D5E0D5
s = s.replace(
  /fontSize:12\.5, color:'#003223', cursor:'pointer'/g,
  "fontSize:12.5, color:'#D5E0D5', cursor:'pointer'"
);

fs.writeFileSync(p, s, 'utf8');

console.log('Fixes applied:');
console.log('  Fellow-visible weeks text → #D5E0D5');
console.log('  Day labels text → #D5E0D5');

// Verification
console.log('\nVerification:');
console.log('  Fellow-visible weeks color:', s.match(/Fellow-visible weeks.*?color:'#[A-Fa-f0-6]+'/)?.[0]?.match(/color:'#[A-Fa-f0-6]+'/)?.[0] || 'not found');
