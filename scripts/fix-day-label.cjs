var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix: Add text-[#003223] to calendar day label (wd)
s = s.replace(
  "bg-[#F7F8F9] text-[12.5px] font-semibold text-center pt-[5px]\">",
  "bg-[#F7F8F9] text-[12.5px] font-semibold text-center pt-[5px] text-[#003223]\">"
);

fs.writeFileSync(p, s, 'utf8');
console.log('Day label color fixed');
