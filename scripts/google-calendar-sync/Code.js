const CALENDAR_SYNC = {
  timezone: 'Asia/Dhaka',
  managedBy: 'wa14-curriculum-calendar',
  markerPrefix: 'WA14_SYNC_KEY=',
};

const STAFF_SYSTEMS = {
  superadmin: ['winter_academy', 'city'],
  academy_lead: ['winter_academy'],
  afa_lead: ['winter_academy'],
  curriculum_specialist: ['winter_academy'],
  placement_ops: ['winter_academy'],
  resource_planner: ['winter_academy'],
  planner: ['winter_academy'],
  staff: ['winter_academy'],
  afa: ['winter_academy'],
  city_lead: ['city'],
  coach: ['city'],
};

const REQUIRED_HEADERS = {
  'WA Sessions': ['id', 'name', 'date', 'start', 'end', 'week', 'calendared', 'type', 'pillar', 'mode', 'roomIdsJson', 'roomsJson', 'afaGroup'],
  'WA Rooms': ['id', 'name', 'fellowIdsJson'],
  Fellows: ['id', 'email', 'cohort', 'afaGroup'],
  Staff: ['email', 'role', 'systemsJson'],
  'WA Settings': ['key', 'value'],
  'City Items': ['id', 'kind', 'name', 'date', 'start', 'end', 'type', 'mode', 'cohortsJson', 'visibleToFellows', 'fellowNotes'],
  'City Settings': ['key', 'value'],
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Google Calendar')
    .addItem('Sync now', 'syncCalendarSchedules')
    .addToUi();
}

function syncCalendarSchedules() {
  try {
    const sources = readWorkbookSources_();
    const plan = buildCalendarPlan(sources, bangladeshYear_());
    const result = applyCalendarPlan_(plan);
    SpreadsheetApp.getUi().alert(
      'Calendar sync complete',
      'Updated ' + result.calendarCount + ' calendars with ' + result.eventCount + ' events.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    console.error('Google Calendar sync failed: ' + message);
    SpreadsheetApp.getUi().alert(
      'Calendar sync failed',
      message + '\n\nNo successful completion was reported. Check the Apps Script Executions log for details.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    throw error;
  }
}

function readWorkbookSources_() {
  const sessions = readSheetRows_('WA Sessions').map(row => ({
    id: row.id,
    name: row.name,
    date: isoDate_(row.date),
    start: clockTime_(row.start),
    end: clockTime_(row.end),
    week: weekNumber_(row.week),
    calendared: booleanCell_(row.calendared, true),
    type: row.type,
    pillar: row.pillar,
    mode: row.mode,
    roomIds: jsonCell_(row.roomIdsJson, []),
    rooms: jsonCell_(row.roomsJson, []),
    afaGroup: row.afaGroup,
  }));
  const rooms = readSheetRows_('WA Rooms').map(row => ({
    id: row.id,
    name: row.name,
    fellowIds: jsonCell_(row.fellowIdsJson, []),
  }));
  const roster = readSheetRows_('Fellows').map(row => ({
    id: row.id,
    email: row.email,
    cohort: Number(row.cohort),
    afaGroup: row.afaGroup,
  }));
  const planners = readSheetRows_('Staff').map(row => ({
    email: row.email,
    role: row.role,
    systems: jsonCell_(row.systemsJson, []),
  }));
  const waSettings = settingsObject_(readSheetRows_('WA Settings'));
  if (!Object.prototype.hasOwnProperty.call(waSettings, 'fellowWeeksJson')) {
    throw new Error('WA Settings is missing fellowWeeksJson. Re-import the Calendar Sync workbook tabs.');
  }
  waSettings.fellowWeeks = jsonCell_(waSettings.fellowWeeksJson, []);
  const cityItems = readSheetRows_('City Items').map(row => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    date: isoDate_(row.date),
    start: clockTime_(row.start),
    end: clockTime_(row.end),
    type: row.type,
    mode: row.mode,
    cohorts: jsonCell_(row.cohortsJson, ['all']),
    visibleToFellows: booleanCell_(row.visibleToFellows, true),
    fellowNotes: row.fellowNotes,
  }));
  const citySettings = settingsObject_(readSheetRows_('City Settings'));
  if (!Object.prototype.hasOwnProperty.call(citySettings, 'year') ||
      !Object.prototype.hasOwnProperty.call(citySettings, 'fellowMonthsJson')) {
    throw new Error('City Settings is missing required rows. Re-import the Calendar Sync workbook tabs.');
  }
  citySettings.year = Number(citySettings.year);
  citySettings.fellowMonths = jsonCell_(citySettings.fellowMonthsJson, []);
  if (!planners.some(person => validStaffEmail_(person.email))) {
    throw new Error('Staff has no valid TFB staff emails. Refusing to remove existing calendar access.');
  }
  return { sessions, rooms, roster, planners, waSettings, cityItems, citySettings };
}

function readSheetRows_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Required workbook tab "' + name + '" is missing. Re-import the Calendar Sync workbook tabs.');
  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('Workbook tab "' + name + '" has no header row.');
  const headers = values[0].map(value => String(value || '').trim());
  const missing = (REQUIRED_HEADERS[name] || []).filter(header => !headers.includes(header));
  if (missing.length) {
    throw new Error('Workbook tab "' + name + '" is missing columns: ' + missing.join(', ') + '. Re-import the Calendar Sync workbook tabs.');
  }
  if (values.length < 2) return [];
  return values.slice(1).filter(row => row.some(value => value !== '' && value != null)).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      if (header) item[header] = row[index];
    });
    return item;
  });
}

function settingsObject_(rows) {
  return rows.reduce((settings, row) => {
    if (row.key) settings[String(row.key)] = row.value;
    return settings;
  }, {});
}

function jsonCell_(value, fallback) {
  if (value == null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch (error) {
    throw new Error('Invalid JSON in workbook cell: ' + String(value).slice(0, 100));
  }
}

function booleanCell_(value, fallback) {
  if (value === '' || value == null) return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', '1'].includes(normalized)) return true;
  if (['false', 'no', '0'].includes(normalized)) return false;
  throw new Error('Invalid boolean value in workbook cell: ' + String(value));
}

function isoDate_(value) {
  if (!value) return '';
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return Utilities.formatDate(value, CALENDAR_SYNC.timezone, 'yyyy-MM-dd');
  }
  if (typeof value === 'number' && value > 0) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    return Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) throw new Error('Invalid date in workbook: ' + text);
  return Utilities.formatDate(parsed, CALENDAR_SYNC.timezone, 'yyyy-MM-dd');
}

function clockTime_(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return Utilities.formatDate(value, CALENDAR_SYNC.timezone, 'HH:mm');
  }
  if (typeof value === 'number') {
    const minutes = Math.round(value * 1440) % 1440;
    return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
  }
  const text = String(value).trim();
  const match = /^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?\s*(AM|PM)?$/i.exec(text);
  if (!match) throw new Error('Invalid time in workbook: ' + text);
  let hour = Number(match[1]);
  const suffix = (match[3] || '').toUpperCase();
  if (suffix) {
    if (hour < 1 || hour > 12) throw new Error('Invalid time in workbook: ' + text);
    hour = (hour % 12) + (suffix === 'PM' ? 12 : 0);
  }
  if (hour > 23) throw new Error('Invalid time in workbook: ' + text);
  return String(hour).padStart(2, '0') + ':' + match[2];
}

function weekNumber_(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  const match = /(\d+)/.exec(String(value));
  return match ? Number(match[1]) : null;
}

function buildCalendarPlan(sources, currentYear) {
  const year = Number(currentYear) || new Date().getFullYear();
  const planners = Array.isArray(sources.planners) ? sources.planners : [];
  const staff = mergeStaff_(planners);
  const roster = Array.isArray(sources.roster) ? sources.roster : [];
  const rooms = Array.isArray(sources.rooms) ? sources.rooms : [];
  const waSettings = sources.waSettings || {};
  const citySettings = sources.citySettings || {};
  const cityYear = Number(citySettings.year) || year;
  const calendars = {};

  const waStaff = staff.filter(person => hasSystem_(person, 'winter_academy')).map(person => person.email);
  const cityStaff = staff.filter(person => hasSystem_(person, 'city')).map(person => person.email);
  const waFellows = roster.filter(fellow =>
    validFellowEmail_(fellow.email) && Number(fellow.cohort) === year + 1
  );

  const waSessions = Array.isArray(sources.sessions) ? sources.sessions : [];
  const fellowWeeks = Array.isArray(waSettings.fellowWeeks)
    ? new Set(waSettings.fellowWeeks.map(Number))
    : new Set([0, 1, 2, 3, 4, 5, 6]);
  waSessions.forEach(session => {
    if (!session || session.calendared === false || !session.date || !session.start || !session.end) return;
    if (session.id == null || String(session.id) === '') throw new Error('A scheduled Winter Academy session has no stable ID.');
    const week = effectiveWeek_(session, waSettings.startDate);
    if (week == null || !fellowWeeks.has(Number(week))) return;

    const visibleFellows = waFellows.filter(fellow => sessionVisibleToFellow_(session, fellow, rooms));
    const audienceEmails = visibleFellows.map(fellow => fellow.email);
    const audienceKey = 'wa-' + sha256_(audienceEmails.slice().sort().join('\n')).slice(0, 24);
    const calendar = ensurePlanCalendar_(calendars, audienceKey, 'Winter Academy - ' + audienceKey.slice(3, 11), [
      ...audienceEmails, ...waStaff,
    ]);
    addEvent_(calendar, 'wa-session-' + String(session.id), {
      summary: String(session.name || 'Winter Academy session').trim() || 'Winter Academy session',
      description: [session.type || session.pillar, session.mode].filter(Boolean).join(' · '),
      start: { dateTime: bangladeshDateTime_(session.date, session.start), timeZone: CALENDAR_SYNC.timezone },
      end: { dateTime: bangladeshDateTime_(session.date, session.end, session.end <= session.start), timeZone: CALENDAR_SYNC.timezone },
    });
  });

  const cityFellows = roster.filter(fellow =>
    validFellowEmail_(fellow.email) && [year, year - 1].includes(Number(fellow.cohort))
  );
  const visibleMonths = Array.isArray(citySettings.fellowMonths) && citySettings.fellowMonths.length
    ? new Set(citySettings.fellowMonths.map(Number))
    : new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const cityItems = Array.isArray(sources.cityItems) ? sources.cityItems : [];
  const cityCohorts = [
    { key: 'city-y1-' + cityYear, cohort: cityYear, title: 'City Year 1 (' + cityYear + ')' },
    { key: 'city-y2-' + (cityYear - 1), cohort: cityYear - 1, title: 'City Year 2 (' + (cityYear - 1) + ')' },
  ];
  const cityShared = ensurePlanCalendar_(calendars, 'city-shared-' + cityYear, 'City Shared (' + cityYear + ')', [
    ...cityFellows.map(fellow => fellow.email), ...cityStaff,
  ]);
  cityItems.forEach(item => {
    if (!cityItemVisible_(item, cityYear, visibleMonths) || !cityItemVisible_(item, cityYear - 1, visibleMonths)) return;
    if (item.id == null || String(item.id) === '') throw new Error('A visible City item has no stable ID.');
    addEvent_(cityShared, 'city-item-' + String(item.id), cityEvent_(item));
  });
  cityCohorts.forEach(group => {
    const fellows = cityFellows.filter(fellow => Number(fellow.cohort) === group.cohort);
    const calendar = ensurePlanCalendar_(calendars, group.key, group.title, [
      ...fellows.map(fellow => fellow.email), ...cityStaff,
    ]);
    cityItems.forEach(item => {
      if (!cityItemVisible_(item, group.cohort, visibleMonths)) return;
      if (cityItemVisible_(item, cityYear, visibleMonths) && cityItemVisible_(item, cityYear - 1, visibleMonths)) return;
      if (item.id == null || String(item.id) === '') throw new Error('A visible City item has no stable ID.');
      addEvent_(calendar, 'city-item-' + String(item.id), cityEvent_(item));
    });
  });

  return { calendars };
}

function sessionVisibleToFellow_(session, fellow, rooms) {
  const isMainRoom = room => String(room && room.name || '').trim().toLowerCase() === 'main room';
  const targetedRoomIds = (session.roomIds || []).filter(id => !isMainRoom(rooms.find(room => String(room.id) === String(id))));
  const legacyTargets = (session.rooms || []).filter(room => !isMainRoom(room));
  const hasTargeting = targetedRoomIds.length > 0 || legacyTargets.length > 0 || Boolean(session.afaGroup);
  if (!hasTargeting) return true;
  const roomMatch = targetedRoomIds.some(id => {
    const room = rooms.find(candidate => String(candidate.id) === String(id));
    return room && (room.fellowIds || []).map(String).includes(String(fellow.id));
  });
  const groupMatch = Boolean(fellow.afaGroup && session.afaGroup && fellow.afaGroup === session.afaGroup);
  return roomMatch || groupMatch;
}

function cityItemVisible_(item, cohort, visibleMonths) {
  if (!item || item.visibleToFellows === false || !item.date) return false;
  const month = Number(String(item.date).slice(5, 7)) - 1;
  if (!visibleMonths.has(month)) return false;
  const targets = item.cohorts == null
    ? ['all']
    : (Array.isArray(item.cohorts) ? item.cohorts : [item.cohorts]).map(String);
  return targets.some(target => target === 'all' || target === String(cohort));
}

function cityEvent_(item) {
  const kind = item.kind === 'task' ? 'Task' : item.kind === 'deadline' ? 'Deadline' : 'Space';
  const description = [kind, item.type, item.mode, item.fellowNotes].filter(Boolean).join(' · ');
  if (!item.start) {
    return {
      summary: String(item.name || kind).trim() || kind,
      description,
      start: { date: item.date },
      end: { date: datePlusOne_(item.date) },
    };
  }
  const end = item.end || addMinutes_(item.start, 60);
  return {
    summary: String(item.name || kind).trim() || kind,
    description,
    start: { dateTime: bangladeshDateTime_(item.date, item.start), timeZone: CALENDAR_SYNC.timezone },
    end: { dateTime: bangladeshDateTime_(item.date, end, end <= item.start), timeZone: CALENDAR_SYNC.timezone },
  };
}

function addEvent_(calendar, sourceKey, event) {
  if (!sourceKey || /-(undefined|null)$/.test(sourceKey)) throw new Error('Calendar event source key is missing.');
  const id = 'wa14' + sha256_(sourceKey).slice(0, 48);
  calendar.events[id] = Object.assign({}, event, {
    id,
    extendedProperties: {
      private: {
        wa14ManagedBy: CALENDAR_SYNC.managedBy,
        wa14SourceKey: sourceKey,
      },
    },
  });
}

function ensurePlanCalendar_(calendars, key, summary, readers) {
  if (!calendars[key]) calendars[key] = { key, summary, readers: new Set(), events: {} };
  readers.forEach(email => {
    const normalized = String(email || '').trim().toLowerCase();
    if (validEmail_(normalized)) calendars[key].readers.add(normalized);
  });
  return calendars[key];
}

function applyCalendarPlan_(plan) {
  const desiredKeys = Object.keys(plan.calendars);
  const managed = listManagedCalendars_();
  const knownByKey = {};
  managed.forEach(calendar => { knownByKey[calendar.key] = calendar; });
  const allKeys = [...new Set(desiredKeys.concat(Object.keys(knownByKey)))];
  let eventCount = 0;
  allKeys.forEach(key => {
    const desired = plan.calendars[key] || {
      key,
      summary: knownByKey[key].summary || 'Inactive WA14 generated calendar',
      readers: new Set(),
      events: {},
    };
    const calendar = knownByKey[key] || createManagedCalendar_(key, desired.summary);
    syncCalendarReaders_(calendar.id, Array.from(desired.readers));
    syncCalendarEvents_(calendar.id, desired.events);
    eventCount += Object.keys(desired.events).length;
  });
  return { calendarCount: desiredKeys.length, eventCount };
}

function listManagedCalendars_() {
  const result = [];
  let pageToken = '';
  do {
    const response = Calendar.CalendarList.list({ maxResults: 250, pageToken: pageToken || undefined });
    (response.items || []).forEach(calendar => {
      const match = new RegExp(CALENDAR_SYNC.markerPrefix + '([a-z0-9-]+)').exec(String(calendar.description || ''));
      if (match) result.push({ id: calendar.id, key: match[1], summary: calendar.summary });
    });
    pageToken = response.nextPageToken || '';
  } while (pageToken);
  return result;
}

function createManagedCalendar_(key, summary) {
  const calendar = Calendar.Calendars.insert({
    summary,
    description: CALENDAR_SYNC.markerPrefix + key,
    timeZone: CALENDAR_SYNC.timezone,
  });
  return { id: calendar.id, key, summary };
}

function syncCalendarReaders_(calendarId, nextReaders) {
  const desired = new Set(nextReaders.map(email => email.toLowerCase()));
  const rules = listCalendarAcl_(calendarId);
  const currentByEmail = new Map(rules
    .filter(rule => rule.scope && rule.scope.type === 'user')
    .map(rule => [String(rule.scope.value || '').toLowerCase(), rule]));
  currentByEmail.forEach((rule, email) => {
    if (rule.role === 'owner') return;
    if (desired.has(email)) {
      if (rule.role !== 'reader') Calendar.Acl.patch({ role: 'reader' }, calendarId, rule.id);
      return;
    }
    try {
      Calendar.Acl.remove(calendarId, rule.id);
    } catch (error) {
      if (!isNotFound_(error)) throw error;
    }
  });
  desired.forEach(email => {
    if (currentByEmail.has(email)) return;
    Calendar.Acl.insert({ scope: { type: 'user', value: email }, role: 'reader' }, calendarId, { sendNotifications: true });
  });
}

function listCalendarAcl_(calendarId) {
  const result = [];
  let pageToken = '';
  do {
    const response = Calendar.Acl.list(calendarId, { maxResults: 250, pageToken: pageToken || undefined });
    result.push(...(response.items || []));
    pageToken = response.nextPageToken || '';
  } while (pageToken);
  return result;
}

function syncCalendarEvents_(calendarId, desiredEvents) {
  const desiredIds = new Set(Object.keys(desiredEvents));
  Object.keys(desiredEvents).forEach(id => {
    const event = desiredEvents[id];
    let existing = null;
    try {
      existing = Calendar.Events.get(calendarId, id);
    } catch (error) {
      if (!isNotFound_(error)) throw error;
    }
    if (existing) Calendar.Events.update(event, calendarId, id);
    else Calendar.Events.insert(event, calendarId);
  });
  listManagedEvents_(calendarId).forEach(event => {
    if (!desiredIds.has(event.id)) Calendar.Events.remove(calendarId, event.id);
  });
}

function listManagedEvents_(calendarId) {
  const result = [];
  let pageToken = '';
  do {
    const response = Calendar.Events.list(calendarId, {
      maxResults: 2500,
      pageToken: pageToken || undefined,
      privateExtendedProperty: 'wa14ManagedBy=' + CALENDAR_SYNC.managedBy,
      showDeleted: false,
    });
    result.push(...(response.items || []));
    pageToken = response.nextPageToken || '';
  } while (pageToken);
  return result;
}

function effectiveWeek_(session, startDate) {
  if (session.date && startDate) {
    const start = new Date(startDate + 'T00:00:00');
    start.setDate(start.getDate() - start.getDay() - 7);
    const date = new Date(session.date + 'T00:00:00');
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(date.getTime())) throw new Error('Invalid Winter Academy start or session date.');
    return Math.floor((date.getTime() - start.getTime()) / 604800000);
  }
  return session.week == null ? null : Number(session.week);
}

function mergeStaff_(planners) {
  const byEmail = {};
  planners.forEach(person => {
    const email = String(person.email || '').trim().toLowerCase();
    if (validStaffEmail_(email)) byEmail[email] = Object.assign({}, person, { email });
  });
  return Object.keys(byEmail).map(email => byEmail[email]);
}

function hasSystem_(person, system) {
  if (person.role === 'superadmin') return true;
  const explicit = Array.isArray(person.systems) ? person.systems.filter(Boolean) : [];
  if (explicit.length) return explicit.includes(system);
  return (STAFF_SYSTEMS[person.role] || ['winter_academy']).includes(system);
}

function validEmail_(email) {
  return /^[^@\s]+@teachforbangladesh\.org$/i.test(String(email || ''));
}

function validFellowEmail_(email) {
  return /^[a-z]+\.[a-z]+@teachforbangladesh\.org$/i.test(String(email || ''));
}

function validStaffEmail_(email) {
  return /^[a-z]+@teachforbangladesh\.org$/i.test(String(email || ''));
}

function bangladeshYear_() {
  return Number(Utilities.formatDate(new Date(), CALENDAR_SYNC.timezone, 'yyyy'));
}

function bangladeshDateTime_(date, time, nextDay) {
  if (!validIsoDate_(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(time))) {
    throw new Error('Invalid calendar date/time: ' + date + ' ' + time);
  }
  return (nextDay ? datePlusOne_(date) : date) + 'T' + time + ':00+06:00';
}

function datePlusOne_(date) {
  if (!validIsoDate_(date)) throw new Error('Invalid calendar date: ' + date);
  const parts = date.split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1)).toISOString().slice(0, 10);
}

function validIsoDate_(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return false;
  const parts = String(date).split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).toISOString().slice(0, 10) === date;
}

function addMinutes_(time, minutes) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(time));
  if (!match) throw new Error('Invalid calendar time: ' + time);
  const total = Number(match[1]) * 60 + Number(match[2]) + minutes;
  return String(Math.floor((total % 1440) / 60)).padStart(2, '0') + ':' +
    String(total % 60).padStart(2, '0');
}

function sha256_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes.map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
}

function isNotFound_(error) {
  return /(^|\D)404(\D|$)|not found/i.test(String(error && error.message || error));
}
