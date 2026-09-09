var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix 1: Replace "--" (mojibake for em-dash/ellipsis) with proper ellipsis in UI strings
// "Loading schedule--" → "Loading schedule…"
s = s.replace(/Loading schedule--/g, 'Loading schedule…');

// Fix 2: Menu button arrows - replace mojibake with proper angle quotes
// 'â--¹' → '‹' (single left angle quote), 'â--º' → '›' (single right angle quote)
s = s.replace(/â--¹/g, '‹');
s = s.replace(/â--º/g, '›');

// Fix 3: Week button date separator - replace " with – (en dash)
// fmt(s)+' " '+fmt(e) → fmt(s)+' – '+fmt(e)
s = s.replace(/fmt\(s\)\+' " '\+fmt\(e\)/g, "fmt(s)+' – '+fmt(e)");

// Fix 4: Calendar text colors - change #FFFFFF to #003223 in calendar context
// Week button unselected text: color: activeWeek===w ? '#fff' : '#FFFFFF' → color: activeWeek===w ? '#fff' : '#003223'
s = s.replace(/color: activeWeek===w \? '#fff' : '#FFFFFF'/g, "color: activeWeek===w ? '#fff' : '#003223'");

// Fix 5: Day labels color: '#FFFFFF' → '#003223' (in calendar context)
s = s.replace(/fontSize:12\.5, color:'#FFFFFF', cursor:'pointer'/g, "fontSize:12.5, color:'#003223', cursor:'pointer'");

// Fix 6: Week selector container text color
s = s.replace(/fontSize:12\.5,color:'#FFFFFF',background:'#fff'/g, "fontSize:12.5,color:'#003223',background:'#fff'");

// Fix 7: Fellow-visible weeks text color
s = s.replace(/fontSize:12\.5,color:'#FFFFFF'}}><b>Fellow-visible weeks<\/b>/g, "fontSize:12.5,color:'#003223'}}><b>Fellow-visible weeks</b>");

// Fix 8: Calendar day headers and time labels - change white to #003223
// Day header text (Sat, Sun, etc.)
s = s.replace(/color:'#FFFFFF',fontWeight:600,fontSize:11/g, "color:'#003223',fontWeight:600,fontSize:11");

// Fix 9: Session list text colors - change #D5E0D5 to #003223 for session cards
// Session card text (date, time, name)
s = s.replace(/color:'#D5E0D5',fontWeight:600,fontSize:14/g, "color:'#003223',fontWeight:600,fontSize:14");
s = s.replace(/color:'#D5E0D5',fontSize:12/g, "color:'#003223',fontSize:12");

// Fix 10: Calendar grid text (dates, times)
s = s.replace(/color:'#D5E0D5',fontSize:10/g, "color:'#003223',fontSize:10");

fs.writeFileSync(p, s, 'utf8');

console.log('Fixes applied:');
console.log('  1. Loading schedule ellipsis');
console.log('  2. Menu button arrows (‹ ›)');
console.log('  3. Week button date separator (–)');
console.log('  4. Unselected week button text (#003223)');
console.log('  5. Day labels text (#003223)');
console.log('  6. Week selector text (#003223)');
console.log('  7. Fellow-visible weeks text (#003223)');
console.log('  8. Calendar day headers (#003223)');
console.log('  9. Session list text (#003223)');
console.log('  10. Calendar grid text (#003223)');

// Verification
console.log('\nVerification:');
console.log('  Remaining --:', (s.match(/--/g) || []).length);
console.log('  Remaining â--:', (s.match(/â--/g) || []).length);
console.log('  Remaining \'"\':', (s.match(/'"'/g) || []).length);
