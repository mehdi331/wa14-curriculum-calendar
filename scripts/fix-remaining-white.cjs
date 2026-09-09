var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix remaining #FFFFFF instances in calendar (should be #003223 on white background)
// Line 1139: "No sessions match" text
s = s.replace("color:'#FFFFFF', fontSize:14}}>No sessions match", "color:'#003223', fontSize:14}}>No sessions match");
// Line 1183: time range in session block
s = s.replace("color:'#FFFFFF'}}>{s.start}–{s.end}", "color:'#003223'}}>{s.start}–{s.end}");
// Line 1188: facilitator text
s = s.replace("color:'#FFFFFF', display:'flex', alignItems:'center', gap:3, marginTop:1}}><Users", "color:'#003223', display:'flex', alignItems:'center', gap:3, marginTop:1}}><Users");
// Line 1191: resources text
s = s.replace("color:'#FFFFFF', display:'flex', alignItems:'center', gap:3, marginTop:1}}><LinkIcon", "color:'#003223', display:'flex', alignItems:'center', gap:3, marginTop:1}}><LinkIcon");

fs.writeFileSync(p, s, 'utf8');
console.log('Remaining #FFFFFF fixed');

// Verification
console.log('Remaining #FFFFFF:', (s.match(/#FFFFFF/g) || []).length);
