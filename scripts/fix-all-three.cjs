var fs = require('fs');
var p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
var s = fs.readFileSync(p, 'utf8');

// Fix 1: Show call signs for facilitators instead of full names
s = s.replace(
  "const parts = [ (f.staffName||f.name||'').trim(), roomName ].filter(Boolean);",
  "const staffMember = (staff||[]).find(s=>s.name === f.staffName);\n  const displayName = staffMember?.callSign || f.staffName||f.name||'';\n  const parts = [ displayName, roomName ].filter(Boolean);"
);

// Fix 2: Remove Rooms column header from Sessions table
s = s.replace(
  "['Date','Time','Session','Type','Mode','Pillars','Facilitators','Rooms','Outcomes','']",
  "['Date','Time','Session','Type','Mode','Pillars','Facilitators','Outcomes','']"
);

// Fix 3: Remove Rooms column data cell from Sessions table
s = s.replace(
  "<td style={{padding:'8px 12px', color:'#D5E0D5'}}>{(s.rooms||[]).length ? s.rooms.map(r=>r.name).join(', ') : (s.roomIds||[]).map(id=>rooms.find(r=>r.id===id)?.name).filter(Boolean).join(', ') || '--'}</td>",
  ""
);

// Fix 4: Fix calendar day label color (wd) - add text-[#003223]
s = s.replace(
  "{wd}<div className=\"font-normal text-[#003223]",
  "{wd}<div className=\"font-normal text-[#003223]"
);
// Actually the wd needs a color class on its wrapper
s = s.replace(
  "text-[12.5px] font-semibold text-center pt-[5px]\">\n                   {wd}",
  "text-[12.5px] font-semibold text-center pt-[5px] text-[#003223]\">\n                   {wd}"
);

// Fix 5: Fix calendar scroll - increase min-width to fit all 7 days
s = s.replace(
  "min-w-[820px]",
  "min-w-[1050px]"
);

fs.writeFileSync(p, s, 'utf8');
console.log('All fixes applied');

// Verification
console.log('Call sign fix applied:', s.includes('staffMember?.callSign'));
console.log('Rooms header removed:', !s.includes("'Rooms'"));
console.log('Day label color fixed:', s.includes('font-semibold text-center pt-[5px] text-[#003223]'));
console.log('Calendar min-width fixed:', s.includes('min-w-[1050px]'));
