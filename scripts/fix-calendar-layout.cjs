var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix the calendar structure
// Current: <div className="wa14-cal-scroll" style={{width:'100%'}}><div className="flex bg-white rounded-lg border border-[#DDE2E6] overflow-hidden min-w-[1050px]">
// Issue: The inner flex div with bg-white is being constrained by the outer wrapper width
// Fix: Separate into outer scroll wrapper (width:100%, overflow-x:auto) and inner content div (sizes to content)

s = s.replace(
  '<div className="wa14-cal-scroll" style={{width:\'100%\'}}><div className="flex bg-white rounded-lg border border-[#DDE2E6] overflow-hidden min-w-[1050px]">',
  '<div className="wa14-cal-scroll" style={{width:\'100%\',overflowX:\'auto\'}}><div className="flex bg-white rounded-lg border border-[#DDE2E6] min-w-[1050px]" style={{width:\'max-content\'}}>'
);

fs.writeFileSync(p, s, 'utf8');
console.log('Calendar layout fix applied');

// Verification
var s2 = fs.readFileSync(p, 'utf8');
console.log('Inner div has width:max-content:', s2.includes('width:\'max-content\''));
console.log('Outer div has overflow-x:auto:', s2.includes('overflowX:\'auto\''));
