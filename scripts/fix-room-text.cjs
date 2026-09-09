var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix remaining #FFFFFF in calendar (line 1188: room text with DoorOpen icon)
s = s.replace("color:'#FFFFFF', display:'flex', alignItems:'center', gap:3, marginTop:1}}><DoorOpen", "color:'#003223', display:'flex', alignItems:'center', gap:3, marginTop:1}}><DoorOpen");

fs.writeFileSync(p, s, 'utf8');
console.log('Fixed room text color');

// Verification - only the menu button should remain white
var lines = s.split('\n');
lines.forEach(function(l,i){if(l.includes('#FFFFFF'))console.log((i+1)+': '+l.substring(0,100))});
