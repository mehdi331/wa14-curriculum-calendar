const CALENDAR_SYNC = {
  projectId: 'wa-14-calendar',
  firestoreCollection: 'wa14',
  stateCollection: 'wa14_calendar_sync_calendars',
  statusKey: 'wa14-calendar-sync-status',
  requestKey: 'wa14-calendar-sync-request',
  timezone: 'Asia/Dhaka',
  managedBy: 'wa14-curriculum-calendar',
  triggerMinutes: 5,
  superadminEmail: 'mehdi@teachforbangladesh.org',
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

function installCalendarSync() {
  getProjectId_();
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'syncCalendarSchedules')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('syncCalendarSchedules')
    .timeBased()
    .everyMinutes(CALENDAR_SYNC.triggerMinutes)
    .create();
  syncCalendarSchedules();
}

function syncCalendarSchedules() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Another calendar sync is already running.');
  try {
    const sources = loadSources_();
    const fingerprint = sha256_(stableStringify_(sources));
    const requestAt = Number(sources.request && sources.request.updatedAt) || 0;
    const properties = PropertiesService.getScriptProperties();
    const lastFingerprint = properties.getProperty('lastSourceFingerprint') || '';
    const lastRequestAt = Number(properties.getProperty('lastRequestAt')) || 0;
    const forced = requestAt > lastRequestAt;
    if (!forced && fingerprint === lastFingerprint) return;

    const startedAt = new Date().toISOString();
    const plan = buildCalendarPlan(sources, bangladeshYear_());
    const registry = loadCalendarRegistry_();
    const result = applyCalendarPlan_(plan, registry);
    const status = {
      status: 'ok',
      startedAt,
      completedAt: new Date().toISOString(),
      calendarCount: Object.keys(plan.calendars).length,
      eventCount: result.eventCount,
      error: '',
    };
    writeWa14Value_(CALENDAR_SYNC.statusKey, status);
    properties.setProperties({
      lastSourceFingerprint: fingerprint,
      lastRequestAt: String(Math.max(lastRequestAt, requestAt)),
    });
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    try {
      writeWa14Value_(CALENDAR_SYNC.statusKey, {
        status: 'error',
        completedAt: new Date().toISOString(),
        error: message.slice(0, 1000),
      });
    } catch (statusError) {
      console.error('Could not write calendar sync failure status: ' + statusError.message);
    }
    console.error('Google Calendar reconciliation failed: ' + message);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function buildCalendarPlan(sources, currentYear) {
  const year = Number(currentYear) || new Date().getFullYear();
  const planners = Array.isArray(sources.planners) ? sources.planners : [];
  const accounts = Array.isArray(sources.accounts) ? sources.accounts : [];
  const staff = mergeStaff_(planners, accounts);
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
  const targetedRoomIds = (session.roomIds || []).filter(id => !isMainRoom(rooms.find(room => room.id === id)));
  const legacyTargets = (session.rooms || []).filter(room => !isMainRoom(room));
  const hasTargeting = targetedRoomIds.length > 0 || legacyTargets.length > 0 || Boolean(session.afaGroup);
  if (!hasTargeting) return true;
  const roomMatch = targetedRoomIds.some(id => {
    const room = rooms.find(candidate => candidate.id === id);
    return room && (room.fellowIds || []).includes(fellow.id);
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

function mergeStaff_(planners, accounts) {
  const byEmail = {};
  accounts.forEach(person => {
    const email = String(person.email || '').trim().toLowerCase();
    if (validStaffEmail_(email)) byEmail[email] = Object.assign({}, person, { email });
  });
  planners.forEach(person => {
    const email = String(person.email || '').trim().toLowerCase();
    if (validStaffEmail_(email)) byEmail[email] = Object.assign({}, byEmail[email] || {}, person, { email });
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

function loadSources_() {
  return {
    sessions: readArray_(readWa14Value_('wa14-sessions')),
    rooms: readArray_(readWa14Value_('wa14-rooms')),
    roster: readArray_(readWa14Value_('wa14-roster')),
    planners: readArray_(readWa14Value_('wa14-planners')),
    accounts: readArray_(readWa14Value_('wa14-accounts')),
    waSettings: readObject_(readWa14Value_('wa14-settings')),
    cityItems: readArray_(readWa14Value_('wa14-city-sessions')),
    citySettings: readObject_(readWa14Value_('wa14-city-settings')),
    request: readWa14Value_(CALENDAR_SYNC.requestKey),
  };
}

function readArray_(record) {
  if (!record || !record.value) return [];
  const value = JSON.parse(record.value);
  if (!Array.isArray(value)) throw new Error('Expected an array in a calendar source document.');
  return value;
}

function readObject_(record) {
  if (!record || !record.value) return {};
  const value = JSON.parse(record.value);
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Expected an object in a calendar settings document.');
  return value;
}

function loadCalendarRegistry_() {
  const projectId = getProjectId_();
  const registry = {};
  let pageToken = '';
  do {
    const query = pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '';
    const response = firestoreFetch_(
      'https://firestore.googleapis.com/v1/projects/' + projectId +
      '/databases/(default)/documents/' + CALENDAR_SYNC.stateCollection + '?pageSize=500' + query
    );
    const body = JSON.parse(response.getContentText() || '{}');
    (body.documents || []).forEach(document => {
      const id = document.name.split('/').pop();
      const raw = document.fields && document.fields.value && document.fields.value.stringValue;
      if (raw) registry[id] = JSON.parse(raw);
    });
    pageToken = body.nextPageToken || '';
  } while (pageToken);
  return registry;
}

function applyCalendarPlan_(plan, registry) {
  const desiredKeys = Object.keys(plan.calendars);
  const allKeys = [...new Set(desiredKeys.concat(Object.keys(registry)))];
  let eventCount = 0;
  allKeys.forEach(key => {
    const desired = plan.calendars[key] || {
      key,
      summary: registry[key].summary || 'Inactive WA14 generated calendar',
      readers: new Set(),
      events: {},
    };
    const prior = registry[key] || {};
    const calendarId = prior.calendarId && calendarExists_(prior.calendarId)
      ? prior.calendarId
      : findOrCreateCalendar_(key, desired.summary);
    syncCalendarReaders_(calendarId, Array.from(desired.readers));
    syncCalendarEvents_(calendarId, desired.events);
    const count = Object.keys(desired.events).length;
    eventCount += count;
    writeRegistry_(key, {
      calendarId,
      summary: desired.summary,
      readers: Array.from(desired.readers),
      active: desiredKeys.includes(key),
    });
  });
  return { eventCount };
}

function findOrCreateCalendar_(key, summary) {
  const marker = 'WA14_SYNC_KEY=' + key;
  let pageToken = '';
  do {
    const response = Calendar.CalendarList.list({ maxResults: 250, pageToken: pageToken || undefined });
    const match = (response.items || []).find(item => String(item.description || '').includes(marker));
    if (match) return match.id;
    pageToken = response.nextPageToken || '';
  } while (pageToken);
  const calendar = Calendar.Calendars.insert({
    summary,
    description: marker,
    timeZone: CALENDAR_SYNC.timezone,
  });
  return calendar.id;
}

function calendarExists_(calendarId) {
  try {
    Calendar.CalendarList.get(calendarId);
    return true;
  } catch (error) {
    if (isNotFound_(error)) return false;
    throw error;
  }
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
    const current = currentByEmail.get(email);
    if (current) return;
    Calendar.Acl.insert({
      scope: { type: 'user', value: email },
      role: 'reader',
    }, calendarId, { sendNotifications: true });
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

function writeRegistry_(key, value) {
  writeJsonDocument_(CALENDAR_SYNC.stateCollection, key, value);
}

function readWa14Value_(key) {
  const projectId = getProjectId_();
  const url = 'https://firestore.googleapis.com/v1/projects/' + projectId +
    '/databases/(default)/documents/' + CALENDAR_SYNC.firestoreCollection + '/' + encodeURIComponent(key);
  const response = firestoreFetch_(url, true);
  if (response.getResponseCode() === 404) return null;
  const document = JSON.parse(response.getContentText());
  const value = document.fields && document.fields.value && document.fields.value.stringValue;
  const updatedAt = document.fields && document.fields.updatedAt && document.fields.updatedAt.integerValue;
  return { value: value || '', updatedAt: Number(updatedAt) || 0 };
}

function writeWa14Value_(key, value) {
  writeJsonDocument_(CALENDAR_SYNC.firestoreCollection, key, value);
}

function writeJsonDocument_(collection, id, value) {
  const projectId = getProjectId_();
  const url = 'https://firestore.googleapis.com/v1/projects/' + projectId +
    '/databases/(default)/documents/' + collection + '/' + encodeURIComponent(id) +
    '?updateMask.fieldPaths=value&updateMask.fieldPaths=updatedAt';
  const fields = {
    value: { stringValue: JSON.stringify(value) },
    updatedAt: { integerValue: String(Date.now()) },
  };
  firestoreFetch_(url, false, {
    method: 'patch',
    contentType: 'application/json',
    payload: JSON.stringify({ fields }),
  });
}

function firestoreFetch_(url, allowNotFound, options) {
  const response = UrlFetchApp.fetch(url, Object.assign({
    method: 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  }, options || {}));
  const code = response.getResponseCode();
  if (code >= 200 && code < 300) return response;
  if (allowNotFound && code === 404) return response;
  throw new Error('Firestore API request failed (' + code + '): ' + response.getContentText().slice(0, 500));
}

function getProjectId_() {
  const value = PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID') || CALENDAR_SYNC.projectId;
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value)) throw new Error('Invalid FIREBASE_PROJECT_ID script property.');
  return value;
}

function bangladeshYear_() {
  return Number(Utilities.formatDate(new Date(), CALENDAR_SYNC.timezone, 'yyyy'));
}

function bangladeshDateTime_(date, time, nextDay) {
  if (!validIsoDate_(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(time))) {
    throw new Error('Invalid calendar date/time: ' + date + ' ' + time);
  }
  const d = nextDay ? datePlusOne_(date) : date;
  return d + 'T' + time + ':00+06:00';
}

function datePlusOne_(date) {
  if (!validIsoDate_(date)) throw new Error('Invalid calendar date: ' + date);
  const parts = date.split('-').map(Number);
  const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
  return next.toISOString().slice(0, 10);
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
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  );
  return bytes.map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
}

function stableStringify_(value) {
  if (Array.isArray(value)) return '[' + value.map(stableStringify_).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key =>
      JSON.stringify(key) + ':' + stableStringify_(value[key])
    ).join(',') + '}';
  }
  return JSON.stringify(value);
}

function isNotFound_(error) {
  return /(^|\D)404(\D|$)|not found/i.test(String(error && error.message || error));
}
