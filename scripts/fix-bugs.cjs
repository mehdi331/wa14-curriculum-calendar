var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix BUG 1: Fellow-visible weeks checkbox label color when checked
s = s.replace(
  "<label key={w} style={{display:'flex',alignItems:'center',gap:4}}>",
  "<label key={w} style={{display:'flex',alignItems:'center',gap:4, color: fellowWeeks.includes(w) ? '#003223' : '#D5E0D5'}}>"
);

// Fix BUG 1: Day-selector checkbox label color when checked
s = s.replace(
  "color:'#003223', cursor:'pointer'}}>",
  "color: !hiddenDays[d] ? '#003223' : '#D5E0D5', cursor:'pointer'}}>"
);

// Fix BUG 2a: Calendar inner div overflow - change overflow-visible to overflow-hidden
s = s.replace(
  "overflow-visible min-w-[1050px]",
  "overflow-hidden min-w-[1050px]"
);

// Fix BUG 2b: Remove duplicate sidebar label span
s = s.replace(
  "{(open || typeof window==='undefined') && <span>{t.label}</span>}<span className=\"lg:hidden\">{t.label}</span>",
  "{(open || typeof window==='undefined') && <span>{t.label}</span>}"
);

fs.writeFileSync(p, s, 'utf8');
console.log('All bug fixes applied');

// Verification
console.log('Fellow-visible weeks color fix:', s.includes("fellowWeeks.includes(w) ? '#003223'"));
console.log('Day-selector color fix:', s.includes("!hiddenDays[d] ? '#003223'"));
console.log('Calendar overflow fix:', s.includes('overflow-hidden min-w-[1050px]'));
console.log('Sidebar duplication fix:', !s.includes('lg:hidden'));
