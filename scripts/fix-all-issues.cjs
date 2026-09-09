var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix 1: Mojibake at line 123 - comment line
s = s.replace('// -- Responsive design, attendance codes, grade release & assessment integrity helpers â"--â"--', '// Responsive design, attendance codes, grade release & assessment integrity helpers');

// Fix 2: Loading schedule ellipsis -> three dots
s = s.replace('Loading schedule…', 'Loading schedule...');

// Fix 3: Menu button arrows - use simple < and > instead of ‹ ›
s = s.replace("{open ? '‹' : '›'}", "{open ? '<' : '>'}");

// Fix 4: weekLabel en-dash -> hyphen (to avoid mojibake)
s = s.replace("return fmt(s)+' – '+fmt(e);", "return fmt(s)+' - '+fmt(e);");

// Fix 5: Calendar text colors - #FFFFFF -> #003223 (on white background)
// Line 1145: hour labels
s = s.replace("className=\"absolute right-2 text-[10.5px] text-[#FFFFFF]\"", "className=\"absolute right-2 text-[10.5px] text-[#003223]\"");
// Line 1156: date label in day header
s = s.replace("className=\"font-normal text-[#FFFFFF] text-[11px] leading-tight\"", "className=\"font-normal text-[#003223] text-[11px] leading-tight\"");
// Line 1168: session name (keep white) and (cont.) text
s = s.replace("fontWeight:400, color:'#FFFFFF'", "fontWeight:400, color:'#003223'");
// Line 1169: until time
s = s.replace("color:'#FFFFFF'}}>until {s.end}", "color:'#003223'}}>until {s.end}");
// Line 1183: time range in session block
s = s.replace("color:'#FFFFFF'}}>{s.start}\"{s.end}", "color:'#003223'}}>{s.start}-{s.end}");
// Lines 1185, 1188, 1191: facilitator, room, resources text
s = s.replace(/color:'#FFFFFF', display:'flex', alignItems:'center', gap:2, fontSize:10\.5, marginTop:1/g, "color:'#003223', display:'flex', alignItems:'center', gap:2, fontSize:10.5, marginTop:1");
// Line 1191: resources
s = s.replace("color:'#FFFFFF', display:'flex', alignItems:'center', gap:3, marginTop:1}", "color:'#003223', display:'flex', alignItems:'center', gap:3, marginTop:1}");

// Fix 6: Session list text color
s = s.replace("fontSize:13, fontWeight:700, marginBottom:10}}>Session list", "fontSize:13, fontWeight:700, marginBottom:10, color:'#003223'}}>Session list");
s = s.replace("fontSize:12.5,cursor:'pointer'}}><span>{s.name}</span><span style={{color:'#FFFFFF'", "fontSize:12.5,cursor:'pointer'}}><span style={{color:'#003223'}}>{s.name}</span><span style={{color:'#003223'");

// Fix 7: Unscheduled sessions text
s = s.replace("fontSize:13, fontWeight:700, marginBottom:10}}>Unscheduled sessions", "fontSize:13, fontWeight:700, marginBottom:10, color:'#003223'}}>Unscheduled sessions");
s = s.replace("fontSize:12.5,color:'#FFFFFF'}}>All sessions are scheduled.", "fontSize:12.5,color:'#003223'}}>All sessions are scheduled.");

// Fix 8: Week button text color for unselected (already #003223, but let's ensure)
// Line 1124: color: activeWeek===w ? '#fff' : '#003223' - this is correct

// Fix 9: Day labels color (Sunday, Monday, etc.)
s = s.replace("fontSize:12.5, color:'#D5E0D5', cursor:'pointer'", "fontSize:12.5, color:'#003223', cursor:'pointer'");

// Fix 10: Fellow-visible weeks text color (should be #D5E0D5 on dark bg - already correct)
// Line 1118: color:'#D5E0D5' - this is correct

// Fix 11: Academy dates text color
s = s.replace("fontSize:12.5,color:'#003223',background:'#fff'", "fontSize:12.5,color:'#003223',background:'#fff'");

// Fix 12: Mojibake in review saved toast
s = s.replace("'Review saved âœ\" -- score added to the fellow\\'s total.'", "'Review saved - score added to the fellow\\'s total.'");

fs.writeFileSync(p, s, 'utf8');
console.log('All fixes applied');

// Verification
console.log('Remaining mojibake â€:', (s.match(/â€/g) || []).length);
console.log('Remaining â:', (s.match(/â/g) || []).length);
console.log('Remaining #FFFFFF in calendar:', (s.match(/#FFFFFF/g) || []).length);
