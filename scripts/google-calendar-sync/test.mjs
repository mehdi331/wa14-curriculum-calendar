import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const source = readFileSync(new URL('./Code.js', import.meta.url), 'utf8');
const context = {
  Utilities: {
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    Charset: { UTF_8: 'UTF-8' },
    computeDigest(_algorithm, value) {
      return [...createHash('sha256').update(String(value), 'utf8').digest()];
    },
  },
  console,
};
vm.runInNewContext(source, context, { filename: fileURLToPath(new URL('./Code.js', import.meta.url)) });

const plan = context.buildCalendarPlan({
  sessions: [
    { id: 'all', name: 'All WA', date: '2026-10-25', start: '09:00', end: '10:00', week: 1, calendared: true },
    { id: 'targeted', name: 'Room + group', date: '2026-10-26', start: '09:00', end: '10:00', week: 1, calendared: true, roomIds: ['r1'], afaGroup: 'AFA A' },
    { id: 'hidden-week', name: 'Hidden week', date: '2026-11-01', start: '09:00', end: '10:00', week: 2, calendared: true },
  ],
  rooms: [{ id: 'r1', name: 'Room 1', fellowIds: ['f1'] }],
  roster: [
    { id: 'f1', email: 'fellow.one@teachforbangladesh.org', cohort: 2027, afaGroup: 'AFA A' },
    { id: 'f2', email: 'fellow.two@teachforbangladesh.org', cohort: 2027, afaGroup: 'AFA A' },
    { id: 'f3', email: 'fellow.three@teachforbangladesh.org', cohort: 2027, afaGroup: 'AFA B' },
    { id: 'f4', email: 'fellow.name@teachforbangladesh.org', cohort: 2027 },
    { id: 'y1', email: 'year.one@teachforbangladesh.org', cohort: 2026 },
    { id: 'y2', email: 'year.two@teachforbangladesh.org', cohort: 2025 },
    { id: 'alumni', email: 'alumni.one@teachforbangladesh.org', cohort: 2024 },
  ],
  planners: [
    { email: 'wastaff@teachforbangladesh.org', role: 'academy_lead' },
    { email: 'citystaff@teachforbangladesh.org', role: 'city_lead' },
    { email: 'fellow.name@teachforbangladesh.org', role: 'city_lead' },
  ],
  accounts: [],
  waSettings: { startDate: '2026-10-25', fellowWeeks: [0, 1] },
  cityItems: [
    { id: 'shared', name: 'Shared city item', date: '2026-01-15', cohorts: ['2026', '2025'], visibleToFellows: true },
    { id: 'year1-only', name: 'Year 1 only', date: '2026-01-18', cohorts: ['2026'], visibleToFellows: true },
    { id: 'legacy-both', name: 'Legacy both value', date: '2026-01-17', cohorts: 'both', visibleToFellows: true },
    { id: 'hidden', name: 'Hidden city item', date: '2026-01-16', cohorts: 'all', visibleToFellows: false },
    { id: 'hidden-month', name: 'Hidden month', date: '2026-02-01', cohorts: 'all', visibleToFellows: true },
  ],
  citySettings: { year: 2026, fellowMonths: [0] },
}, 2026);

const calendars = Object.values(plan.calendars);
const targetedMatches = calendars.filter(calendar => Object.values(calendar.events).some(event => event.summary === 'Room + group'));
assert.equal(targetedMatches.length, 1, 'room and AFA matches must route to one exact-audience calendar');
assert.deepEqual([...targetedMatches[0].readers].sort(), [
  'fellow.one@teachforbangladesh.org',
  'fellow.two@teachforbangladesh.org',
  'wastaff@teachforbangladesh.org',
]);

assert.equal(calendars.some(calendar => Object.values(calendar.events).some(event => event.summary === 'Hidden week')), false);
assert.equal(calendars.some(calendar => Object.values(calendar.events).some(event => event.summary === 'Hidden city item')), false);
assert.equal(calendars.some(calendar => Object.values(calendar.events).some(event => event.summary === 'Hidden month')), false);
assert.equal(calendars.some(calendar => Object.values(calendar.events).some(event => event.summary === 'Legacy both value')), false);

const cityYear1 = plan.calendars['city-y1-2026'];
const cityYear2 = plan.calendars['city-y2-2025'];
const cityShared = plan.calendars['city-shared-2026'];
assert.ok(Object.values(cityShared.events).some(event => event.summary === 'Shared city item'));
assert.ok(!Object.values(cityYear1.events).some(event => event.summary === 'Shared city item'));
assert.ok(!Object.values(cityYear2.events).some(event => event.summary === 'Shared city item'));
assert.ok(Object.values(cityYear1.events).some(event => event.summary === 'Year 1 only'));
assert.ok(!Object.values(cityYear2.events).some(event => event.summary === 'Year 1 only'));
assert.ok(!Object.values(cityShared.events).some(event => event.summary === 'Year 1 only'));
assert.ok(cityYear1.readers.has('year.one@teachforbangladesh.org'));
assert.ok(!cityYear1.readers.has('year.two@teachforbangladesh.org'));
assert.ok(cityYear2.readers.has('year.two@teachforbangladesh.org'));
assert.ok(!cityYear2.readers.has('year.one@teachforbangladesh.org'));
assert.ok(cityShared.readers.has('year.one@teachforbangladesh.org'));
assert.ok(cityShared.readers.has('year.two@teachforbangladesh.org'));
assert.ok(!cityShared.readers.has('alumni.one@teachforbangladesh.org'));
assert.ok(!cityShared.readers.has('fellow.name@teachforbangladesh.org'));

const aclCalls = [];
context.Calendar = {
  Acl: {
    list() {
      return { items: [
        { id: 'owner@teachforbangladesh.org', role: 'owner', scope: { type: 'user', value: 'owner@teachforbangladesh.org' } },
        { id: 'writer@teachforbangladesh.org', role: 'writer', scope: { type: 'user', value: 'writer@teachforbangladesh.org' } },
        { id: 'removed@teachforbangladesh.org', role: 'reader', scope: { type: 'user', value: 'removed@teachforbangladesh.org' } },
      ] };
    },
    patch(resource, calendarId, ruleId) { aclCalls.push(['patch', resource.role, calendarId, ruleId]); },
    remove(calendarId, ruleId) { aclCalls.push(['remove', calendarId, ruleId]); },
    insert(resource, calendarId, options) { aclCalls.push(['insert', resource.scope.value, calendarId, options.sendNotifications]); },
  },
};
context.syncCalendarReaders_('calendar-1', [
  'writer@teachforbangladesh.org',
  'new@teachforbangladesh.org',
]);
assert.deepEqual(aclCalls, [
  ['patch', 'reader', 'calendar-1', 'writer@teachforbangladesh.org'],
  ['remove', 'calendar-1', 'removed@teachforbangladesh.org'],
  ['insert', 'new@teachforbangladesh.org', 'calendar-1', true],
]);

console.log('Google Calendar sync audience tests passed.');
