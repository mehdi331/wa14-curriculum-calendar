// CityCalendarView, assembled: year header + strips + day grid + detail.
// Persistence + editor wiring comes from CityHome.
import React, { useMemo, useState } from 'react';
import { COHORT_ROLE_LABEL } from './cohort';
import { toMin, toIsoDate, weekStartOf, monthOf, MONTHS } from './cityCalHelpers';
import { MonthStrip, WeekStrip, CityLegend } from './cityCalParts.jsx';
import CityDayGrid from './CityDayGrid.jsx';
import CityDayDetail from './CityDayDetail.jsx';

const FONT = "-apple-system, 'Inter', 'Segoe UI', sans-serif";

export default function CityCalendarView({ items, settings, onSettingsChange, canEditSchedule, auth, cohort, onAdd, onEdit, onDelete, types, modes }) {
  const isFellow = auth.role === 'fellow';
  const year = Number(settings?.year) || new Date().getFullYear();
  const todayIso = toIsoDate(new Date());
  // Fellow-visible months (mirrors the WA app's fellowWeeks). Unset = all 12.
  const fellowMonths = Array.isArray(settings?.fellowMonths) && settings.fellowMonths.length ? settings.fellowMonths : MONTHS.map((_, i) => i);
  const todayMonth = Number(todayIso.slice(5, 7)) - 1;
  const startMonth = isFellow && !fellowMonths.includes(todayMonth) ? (fellowMonths.find(m => m >= todayMonth) ?? fellowMonths[0] ?? 0) : todayMonth;
  const [month, setMonth] = useState(() => (todayIso.startsWith(String(year)) ? startMonth : 0));
  const [weekIso, setWeekIso] = useState(() => (todayIso.startsWith(String(year)) ? weekStartOf(todayIso) : `${year}-01-05`));
  const [day, setDay] = useState(null);
  const toggleMonth = (m) => {
    const next = fellowMonths.includes(m)
      ? (fellowMonths.length > 1 ? fellowMonths.filter(x => x !== m) : fellowMonths)
      : [...fellowMonths, m].sort((a, b) => a - b);
    onSettingsChange({ ...settings, fellowMonths: next });
  };
  const yearItems = useMemo(() => (items || []).filter(s => s.date && String(s.date).startsWith(String(year))), [items, year]);
  const monthItems = useMemo(() => yearItems.filter(s => monthOf(s.date) === month), [yearItems, month]);
  const weeks = useMemo(() => {
    const map = {};
    monthItems.forEach(s => { const ws = weekStartOf(s.date); (map[ws] = map[ws] || []).push(s); });
    return Object.keys(map).sort().map(ws => ({ ws, count: map[ws].length }));
  }, [monthItems]);
  const activeWeek = weeks.some(w => w.ws === weekIso) ? weekIso : (weeks[0]?.ws || weekIso);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeWeek + 'T00:00:00'); d.setDate(d.getDate() + i);
    return toIsoDate(d);
  }), [activeWeek]);
  const weekItems = useMemo(() => yearItems.filter(s => days.includes(s.date)).sort((a, b) => (a.date || '').localeCompare(b.date || '') || (toMin(a.start) || 9999) - (toMin(b.start) || 9999)), [yearItems, days]);
  const shownDay = day && days.includes(day) ? day : null;
  const monthCounts = Array.from({ length: 12 }, (_, m) => yearItems.filter(s => monthOf(s.date) === m).length);
  const pickMonth = (m) => { setMonth(m); const first = yearItems.filter(s => monthOf(s.date) === m).sort((a, b) => a.date.localeCompare(b.date))[0]; if (first) setWeekIso(weekStartOf(first.date)); setDay(null); };
  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
        City calendar · {year}{isFellow ? ` · ${COHORT_ROLE_LABEL[auth.cohortRole]} (Cohort ${cohort})` : ''}
      </div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 14 }}>
        {isFellow ? 'Showing only your cohort’s spaces, tasks and deadlines.' : 'The full City year for every cohort. Staff set the year here; the calendar runs January to December.'}
      </div>
      {canEditSchedule && onAdd && (
        <div style={{ marginBottom: 14 }}><button onClick={() => onAdd(shownDay || days[0])} className="btn-primary text-xs">+ Add city item</button></div>
      )}
      {onSettingsChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14, fontSize: 12.5, background: '#fff', border: '1px solid #DDE2E6', borderRadius: 8, padding: '10px 14px', color: '#003223' }}>
          <b>City year</b>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Start <input type="date" className="field-select" value={settings?.startDate || ''} onChange={e => onSettingsChange({ ...settings, startDate: e.target.value, year: Number((e.target.value || '').slice(0, 4)) || settings?.year })} /></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>End <input type="date" className="field-select" value={settings?.endDate || ''} onChange={e => onSettingsChange({ ...settings, endDate: e.target.value })} /></label>
          <span>{yearItems.length} items in {year}</span>
        </div>
      )}
      {onSettingsChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14, fontSize: 12.5, background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: '10px 14px' }}>
          <b style={{ marginRight: 4 }}>Fellow-visible months</b>
          {MONTHS.map((name, m) => {
            const on = fellowMonths.includes(m);
            return <button key={m} type="button" onClick={() => toggleMonth(m)} style={{ padding: '4px 9px', borderRadius: 12, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', border: '1px solid ' + (on ? '#1F6F78' : '#4A6B5C'), background: on ? '#1F6F78' : 'transparent', color: on ? '#fff' : '#9DB09D' }}>{name.slice(0, 3)}</button>;
          })}
          <span style={{ fontSize: 11, color: '#9DB09D' }}>Hidden months disappear from Fellow calendars and agendas; staff always see them.</span>
        </div>
      )}
      <MonthStrip month={month} monthCounts={monthCounts} onPick={pickMonth} visibleMonths={isFellow ? fellowMonths : null} />
      <WeekStrip weeks={weeks} activeWeek={activeWeek} month={month} onPick={(ws) => { setWeekIso(ws); setDay(null); }} />
      <CityDayGrid days={days} weekItems={weekItems} shownDay={shownDay} todayIso={todayIso} onDay={(iso) => setDay(day === iso ? null : iso)} canEditSchedule={canEditSchedule} onAddDay={onAdd} types={types} />
      <CityDayDetail shownDay={shownDay} weekItems={weekItems} canEditSchedule={canEditSchedule} onEdit={onEdit} onDelete={onDelete} types={types} />
      <CityLegend types={types} modes={modes} />
    </div>
  );
}
