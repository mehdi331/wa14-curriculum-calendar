var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix 1: Add text-[#003223] to calendar day label (wd)
s = s.replace(
  "text-[12.5px] font-semibold text-center pt-[5px]\">\n                   {wd}",
  "text-[12.5px] font-semibold text-center pt-[5px] text-[#003223]\">\n                   {wd}"
);

// Fix 2: Fix calendar scroll - ensure the scroll container works properly
// The issue is that the inner flex div has overflow-hidden which clips the content
// Change overflow-hidden to overflow-visible on the inner flex div
s = s.replace(
  "flex bg-white rounded-lg border border-[#DDE2E6] overflow-hidden min-w-[1050px]",
  "flex bg-white rounded-lg border border-[#DDE2E6] overflow-visible min-w-[1050px]"
);

// Fix 3: Also ensure the scroll container has proper width
s = s.replace(
  "className=\"wa14-cal-scroll\"",
  "className=\"wa14-cal-scroll\" style={{width:'100%'}}"
);

fs.writeFileSync(p, s, 'utf8');
console.log('Remaining fixes applied');
