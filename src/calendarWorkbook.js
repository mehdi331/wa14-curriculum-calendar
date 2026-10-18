const jsonCell = value => JSON.stringify(value == null ? [] : value);

export function buildCalendarWorkbookSheets({
  sessions = [],
  rooms = [],
  roster = [],
  planners = [],
  accounts = [],
  waSettings = {},
  cityItems = [],
  citySettings = {},
} = {}) {
  const staffByEmail = {};
  [...accounts, ...planners].forEach(person => {
    const email = String(person.email || '').trim().toLowerCase();
    if (email) staffByEmail[email] = { ...staffByEmail[email], ...person, email };
  });
  const staff = Object.values(staffByEmail);
  return [
    {
      name: 'WA Sessions',
      headers: ['id', 'name', 'date', 'start', 'end', 'week', 'calendared', 'type', 'pillar', 'mode', 'roomIdsJson', 'roomsJson', 'afaGroup'],
      rows: sessions.map(session => ({
        id: session.id,
        name: session.name || '',
        date: session.date || '',
        start: session.start || '',
        end: session.end || '',
        week: session.week ?? '',
        calendared: session.calendared !== false,
        type: session.type || session.pillar || '',
        pillar: session.pillar || '',
        mode: session.mode || '',
        roomIdsJson: jsonCell(session.roomIds || []),
        roomsJson: jsonCell(session.rooms || []),
        afaGroup: session.afaGroup || '',
      })),
    },
    {
      name: 'WA Rooms',
      headers: ['id', 'name', 'fellowIdsJson'],
      rows: rooms.map(room => ({
        id: room.id,
        name: room.name || '',
        fellowIdsJson: jsonCell(room.fellowIds || []),
      })),
    },
    {
      name: 'Fellows',
      headers: ['id', 'email', 'cohort', 'afaGroup'],
      rows: roster.map(fellow => ({
        id: fellow.id,
        email: fellow.email || '',
        cohort: fellow.cohort ?? '',
        afaGroup: fellow.afaGroup || '',
      })),
    },
    {
      name: 'Staff',
      headers: ['email', 'role', 'systemsJson'],
      rows: staff.map(person => ({
        email: person.email || '',
        role: person.role || '',
        systemsJson: jsonCell(person.systems || []),
      })),
    },
    {
      name: 'WA Settings',
      headers: ['key', 'value'],
      rows: [
        { key: 'startDate', value: waSettings.startDate || '' },
        { key: 'fellowWeeksJson', value: jsonCell(waSettings.fellowWeeks || []) },
      ],
    },
    {
      name: 'City Items',
      headers: ['id', 'kind', 'name', 'date', 'start', 'end', 'type', 'mode', 'cohortsJson', 'visibleToFellows', 'fellowNotes'],
      rows: cityItems.map(item => ({
        id: item.id,
        kind: item.kind || 'space',
        name: item.name || '',
        date: item.date || '',
        start: item.start || '',
        end: item.end || '',
        type: item.type || '',
        mode: item.mode || '',
        cohortsJson: jsonCell(item.cohorts == null ? ['all'] : item.cohorts),
        visibleToFellows: item.visibleToFellows !== false,
        fellowNotes: item.fellowNotes || '',
      })),
    },
    {
      name: 'City Settings',
      headers: ['key', 'value'],
      rows: [
        { key: 'year', value: citySettings.year || '' },
        { key: 'fellowMonthsJson', value: jsonCell(citySettings.fellowMonths || []) },
      ],
    },
    {
      name: 'Instructions',
      headers: ['Instructions'],
      rows: [
        { Instructions: 'Import or replace the seven data tabs in your connected Google Sheet, keep this Instructions tab and the bound script, then choose Google Calendar > Sync now.' },
        { Instructions: 'This workbook is a snapshot. Re-export it after changing schedules, then replace the corresponding data tabs before syncing.' },
      ],
    },
  ];
}
