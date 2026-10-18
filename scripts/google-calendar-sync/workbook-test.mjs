import assert from 'node:assert/strict';
import { buildCalendarWorkbookSheets } from '../../src/calendarWorkbook.js';
import * as XLSX from 'xlsx';

const sheets = buildCalendarWorkbookSheets({
  sessions: [
    { id: 'wa-1', name: 'A session', date: '2026-10-25', start: '09:00', end: '10:00', roomIds: ['r1'], afaGroup: 'AFA 1' },
  ],
  rooms: [{ id: 'r1', name: 'Room 1', fellowIds: ['f1'] }],
  roster: [{ id: 'f1', email: 'fellow.one@teachforbangladesh.org', cohort: 2027, afaGroup: 'AFA 1' }],
  accounts: [{ email: 'staff@teachforbangladesh.org', role: 'planner' }],
  planners: [
    { email: 'staff@teachforbangladesh.org', role: 'academy_lead', systems: ['winter_academy'] },
    { email: 'citylead@teachforbangladesh.org', role: 'city_lead', systems: ['city'] },
  ],
  waSettings: { startDate: '2026-10-25', fellowWeeks: [0, 1] },
  cityItems: [
    { id: 'city-1', kind: 'space', name: 'Shared City', date: '2026-11-01', cohorts: ['2026', '2025'] },
    { id: 'city-2', kind: 'task', name: 'Hidden City', date: '2026-11-02', cohorts: 'both', visibleToFellows: false },
  ],
  citySettings: { year: 2026, fellowMonths: [0, 1] },
});

assert.deepEqual(sheets.map(sheet => sheet.name), [
  'WA Sessions', 'WA Rooms', 'Fellows', 'Staff', 'WA Settings',
  'City Items', 'City Settings', 'Instructions',
]);
assert.deepEqual(sheets[5].headers, ['id', 'kind', 'name', 'date', 'start', 'end', 'type', 'mode', 'cohortsJson', 'visibleToFellows', 'fellowNotes']);
assert.deepEqual(sheets[0].rows[0], {
  id: 'wa-1',
  name: 'A session',
  date: '2026-10-25',
  start: '09:00',
  end: '10:00',
  week: '',
  calendared: true,
  type: '',
  pillar: '',
  mode: '',
  roomIdsJson: '["r1"]',
  roomsJson: '[]',
  afaGroup: 'AFA 1',
});
assert.equal(sheets[1].rows[0].fellowIdsJson, '["f1"]');
assert.equal(sheets[2].rows[0].email, 'fellow.one@teachforbangladesh.org');
assert.equal(sheets[3].rows.length, 2);
assert.equal(sheets[3].rows.find(row => row.email === 'staff@teachforbangladesh.org').role, 'academy_lead');
assert.equal(sheets[3].rows.find(row => row.email === 'staff@teachforbangladesh.org').systemsJson, '["winter_academy"]');
assert.equal(sheets[4].rows.find(row => row.key === 'fellowWeeksJson').value, '[0,1]');
assert.equal(sheets[5].rows[0].cohortsJson, '["2026","2025"]');
assert.equal(sheets[5].rows[1].cohortsJson, '"both"');
assert.equal(sheets[5].rows[1].visibleToFellows, false);
assert.equal(sheets[6].rows.find(row => row.key === 'fellowMonthsJson').value, '[0,1]');
const emptyWorkbook = buildCalendarWorkbookSheets();
assert.deepEqual(emptyWorkbook[0].headers.slice(0, 3), ['id', 'name', 'date']);
assert.equal(emptyWorkbook[0].rows.length, 0);
const workbook = XLSX.utils.book_new();
sheets.forEach(sheet => XLSX.utils.book_append_sheet(
  workbook,
  XLSX.utils.json_to_sheet(sheet.rows, { header: sheet.headers }),
  sheet.name,
));
const bytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
const parsedWorkbook = XLSX.read(bytes);
assert.deepEqual(parsedWorkbook.SheetNames, sheets.map(sheet => sheet.name));
const emptyRoomRows = XLSX.utils.sheet_to_json(parsedWorkbook.Sheets['WA Rooms'], { header: 1 });
assert.deepEqual(emptyRoomRows[0], sheets[1].headers);

console.log('Calendar workbook export tests passed.');
