const fs = require('fs');
const p = 'd:/TFB/2026/Winter Academy/Calendar/wa14-curriculum-calendar/src/App.jsx';
let s = fs.readFileSync(p, 'utf8');

// Fix mojibake properly with correct Unicode characters
const mojibakeFixes = [
  ['â€¦', '…'],      // ellipsis …
  ['â€"', '–'],      // en dash –
  ['â€"', '–'],      // en dash variant
  ['â€¹', '‹'],      // single left angle quote
  ['â€º', '›'],      // single right angle quote
  ['â€œ', '"'],     // left double quote
  ['â€', '"'],       // right double quote
  ['â€™', "'"],     // right single quote
  ['â„¢', '™'],      // trademark
  ['Â·', '·'],       // middle dot
  ['Â ', ' '],       // non-breaking space
  ['Â', ''],         // stray A-circumflex
];

mojibakeFixes.forEach(([from, to]) => {
  s = s.split(from).join(to);
});

// Fix delete button color #B84C4C -> #D0A023
s = s.replace(/color:'#B84C4C'/g, "color:'#D0A023'");

// Fix calendar text colors to #003223 (dark green)
// Find CalendarView section
const calendarStart = s.indexOf('function CalendarView');
const calendarEnd = s.indexOf('function ', calendarStart + 1);
if (calendarStart !== -1 && calendarEnd !== -1) {
  const beforeCalendar = s.substring(0, calendarStart);
  let calendarSection = s.substring(calendarStart, calendarEnd);
  const afterCalendar = s.substring(calendarEnd);
  
  // Replace faded colors with #003223 in calendar
  ['#5B6672', '#8A96A3', '#9AA5B1', '#9FB0BE', '#9DB09D', '#a0a5ad', '#a3a8b0'].forEach(color => {
    const regex = new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    calendarSection = calendarSection.replace(regex, '#003223');
  });
  
  s = beforeCalendar + calendarSection + afterCalendar;
}

// Fix week button text colors - unselected should be #003223
// Find the week button styling and fix
s = s.replace(/color: activeWeek===w \? '#fff' : '#fff'/g, "color: activeWeek===w ? '#fff' : '#003223'");
s = s.replace(/color: activeWeek===w \? '#FFFFFF' : '#FFFFFF'/g, "color: activeWeek===w ? '#FFFFFF' : '#003223'");

// Fix session list text colors to #003223
// Find session list/card sections and fix text colors
const sessionListStart = s.indexOf('function SessionList');
const sessionListEnd = s.indexOf('function ', sessionListStart + 1);
if (sessionListStart !== -1 && sessionListEnd !== -1) {
  const beforeSessionList = s.substring(0, sessionListStart);
  let sessionListSection = s.substring(sessionListStart, sessionListEnd);
  const afterSessionList = s.substring(sessionListEnd);
  
  ['#5B6672', '#8A96A3', '#9AA5B1', '#9FB0BE', '#9DB09D'].forEach(color => {
    const regex = new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    sessionListSection = sessionListSection.replace(regex, '#003223');
  });
  
  s = beforeSessionList + sessionListSection + afterSessionList;
}

fs.writeFileSync(p, s, 'utf8');

// Verify
console.log('Done');
console.log('Mojibake remaining:', (s.match(/â€/g) || []).length);
console.log('Delete #D0A023:', (s.match(/#D0A023/g) || []).length);
console.log('Calendar #003223:', (s.match(/#003223/g) || []).length);

