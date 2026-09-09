var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Comprehensive fix for all #FFFFFF in calendar and session list context
// These are on white backgrounds and should be #003223

// Calendar time labels
s = s.replace(/text-\\[10\.5px\\] text-\\[#FFFFFF\\]/g, 'text-[10.5px] text-[#003223]');

// Day date labels
s = s.replace(/text-\\[#FFFFFF\\] text-\\[11px\\]/g, 'text-[#003223] text-[11px]');

// "(cont.)" label in calendar
s = s.replace(/color:'#FFFFFF'\}>\(cont\.\)/g, "color:'#003223'}>(cont.)");

// "until {s.end}" in calendar
s = s.replace(/color:'#FFFFFF'\}>until \{s\.end\}/g, "color:'#003223'}>until {s.end}");

// "{s.start}–{s.end}" in calendar
s = s.replace(/color:'#FFFFFF'\}>\{s\.start\}–\{s\.end\}/g, "color:'#003223'}>{s.start}–{s.end}");

// Session details in calendar (facilitator, room, type)
s = s.replace(/color:'#FFFFFF', display:'flex', alignItems:'center', gap:3/g, "color:'#003223', display:'flex', alignItems:'center', gap:3");

// Session card date/time in session list
s = s.replace(/color:'#FFFFFF',whiteSpace:'nowrap'\}>\{dateLabel\(s\.date\)/g, "color:'#003223',whiteSpace:'nowrap'}>{dateLabel(s.date)");

// "All sessions are scheduled."
s = s.replace(/color:'#FFFFFF'\}>All sessions are scheduled\./g, "color:'#003223'}>All sessions are scheduled.");

// "No sessions" message in calendar
s = s.replace(/color:'#FFFFFF', fontSize:14\}>No session/g, "color:'#003223', fontSize:14}>No session");

fs.writeFileSync(p, s, 'utf8');

console.log('Comprehensive #FFFFFF fixes applied');

// Final verification
var remaining = (s.match(/#FFFFFF/g) || []).length;
console.log('Remaining #FFFFFF in file:', remaining);
if (remaining > 0) {
  console.log('Remaining instances:');
  s.split('\n').forEach(function(l, i) {
    if (l.includes('#FFFFFF')) console.log('  Line ' + (i+1) + ': ' + l.substring(0, 100));
  });
}
