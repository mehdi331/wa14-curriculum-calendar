var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix calendar text colors: #FFFFFF → #003223 (calendar has white background)

// Calendar time labels (left side)
s = s.replace(/text-\\[10\.5px\\] text-\\[#FFFFFF\\]/g, 'text-[10.5px] text-[#003223]');

// Day date labels (e.g., "Oct 18")
s = s.replace(/text-\\[#FFFFFF\\] text-\\[11px\\]/g, 'text-[#003223] text-[11px]');

// Session carry-over label "(cont.)"
s = s.replace(/color:'#FFFFFF'\}>\(cont\.\)/g, "color:'#003223'}>(cont.)");

// Session time display (e.g., "18:00-19:30")
s = s.replace(/color:'#FFFFFF'\}>\{s\.start\}/g, "color:'#003223'}>{s.start}");

// Fix time separator: start"end → start–end (en dash)
s = s.replace(/\{s\.start\}"\{s\.end\}/g, "{s.start}–{s.end}");

// Fix any remaining white text in calendar grid context
s = s.replace(/color:'#FFFFFF',fontWeight:400/g, "color:'#003223',fontWeight:400");

fs.writeFileSync(p, s, 'utf8');

console.log('Calendar text color fixes applied:');
console.log('  Time labels → #003223');
console.log('  Day date labels → #003223');
console.log('  (cont.) label → #003223');
console.log('  Session time → #003223');
console.log('  Time separator → en dash (–)');

// Verification
console.log('\nVerification:');
console.log('  Remaining #FFFFFF in calendar:', (s.match(/text-\\[#FFFFFF\\]/g) || []).length);
console.log('  Remaining \'"\' in calendar:', (s.match(/\{s\.start\}"\{s\.end\}/g) || []).length);
