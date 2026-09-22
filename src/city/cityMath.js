// Shared report/timing math for the City system (pure functions, testable).
// [CITY] foundation helper -- no existing behaviour is changed.
import { DEFAULT_CITY_TYPES, DEFAULT_CITY_MODES, monthsInclude } from './cohort';

// Report math: counts of PD spaces (all items of kind 'space') broken down by
// the editable TYPE list (report rows) and MODE list (report columns), per
// cohort, per month (0-11) and year-to-date. Types/modes fall back to the
// built-in lists when the caller does not pass them. Items hidden from
// Fellows still count here -- the report is a staff view.
export function citySpaceCounts(items, opts = {}) {
  const types = opts.types && opts.types.length ? opts.types : DEFAULT_CITY_TYPES;
  const modes = opts.modes && opts.modes.length ? opts.modes : DEFAULT_CITY_MODES;
  const typeNames = types.map(t => t.name);
  const modeNames = modes.map(m => m.name);
  const spaces = (items || []).filter(s => (s.kind || 'space') === 'space' && s.date);
  let cohorts = opts.cohorts && opts.cohorts.length ? opts.cohorts.map(String) : null;
  if (!cohorts) {
    cohorts = [...new Set(spaces.flatMap(s => (Array.isArray(s.cohorts) ? s.cohorts : [s.cohorts]).map(String).filter(v => v && v !== 'all')))].sort();
  }
  const emptyCell = () => ({ pd: 0, byType: {}, byMode: {} });
  const out = {};
  cohorts.forEach(c => {
    out[c] = {
      months: Array.from({ length: 12 }, emptyCell),
      ytd: emptyCell(),
      matrix: {}, // { [type]: { [mode]: count } } -- year-to-date cross-tab
    };
  });
  const bump = (obj, key) => { obj[key] = (obj[key] || 0) + 1; };
  spaces.forEach(s => {
    const month = Number(String(s.date).slice(5, 7)) - 1;
    if (!(month >= 0 && month < 12)) return;
    // Keep legacy/deleted names as-is so data is never silently renamed.
    const type = typeNames.includes(s.type) ? s.type : (s.type || typeNames[0] || 'PD Session');
    const mode = modeNames.includes(s.mode) ? s.mode : (s.mode || modeNames[0] || 'Sync');
    const targets = Array.isArray(s.cohorts) ? s.cohorts.map(String) : [String(s.cohorts)];
    const hit = targets.includes('all') ? Object.keys(out) : targets.filter(t => out[t]);
    hit.forEach(c => {
      const cell = out[c];
      cell.months[month].pd += 1;
      cell.ytd.pd += 1;
      bump(cell.months[month].byType, type);
      bump(cell.ytd.byType, type);
      bump(cell.months[month].byMode, mode);
      bump(cell.ytd.byMode, mode);
      cell.matrix[type] = cell.matrix[type] || {};
      cell.matrix[type][mode] = (cell.matrix[type][mode] || 0) + 1;
    });
  });
  return { cohorts, types: typeNames, modes: modeNames, counts: out };
}

// Buckets of upcoming city items for the Fellow home view. `opts.fellowMonths`
// hides items that fall in months hidden from Fellows.
export function cityUpcomingBuckets(items, now = new Date(), opts = {}) {
  const t = (now instanceof Date ? now : new Date(now)).getTime();
  const in24h = t + 24 * 60 * 60 * 1000;
  const inWeek = t + 7 * 24 * 60 * 60 * 1000;
  const startOf = (item, field) => {
    if (!item.date) return null;
    const d = new Date(`${item.date}T${item[field] || '00:00'}:00+06:00`);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  };
  const future = (items || [])
    .filter(item => monthsInclude(opts.fellowMonths, item.date))
    .map(item => ({ item, at: startOf(item, 'start') })).filter(x => x.at != null && x.at >= t)
    .sort((a, b) => a.at - b.at).map(x => x.item);
  return {
    next24h: future.filter(item => startOf(item, 'start') <= in24h),
    nextWeek: future.filter(item => { const at = startOf(item, 'start'); return at > in24h && at <= inWeek; }),
    nextMonth: future.filter(item => { const at = startOf(item, 'start'); return at > inWeek; }),
  };
}
