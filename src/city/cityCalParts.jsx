// City month + week strips (shared by the calendar view). MonthStrip marks the
// months hidden from Fellows (staff view); Fellow views simply don't get data
// for those months.
import React from 'react';
import { MONTHS } from './cityCalHelpers';

export function MonthStrip({ month, monthCounts, onPick, visibleMonths }) {
  const allowed = m => !visibleMonths || visibleMonths.includes(m);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 16 }}>
      {MONTHS.map((name, m) => allowed(m) && (
        <button key={name} onClick={() => onPick(m)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', border: m === month ? '1px solid #1F6F78' : '1px solid #2A5C4B', background: m === month ? '#1F6F78' : '#003223', color: '#D5E0D5' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 11.5, color: '#9DB09D' }}>{monthCounts[m]} item{monthCounts[m] === 1 ? '' : 's'}</div>
        </button>
      ))}
    </div>
  );
}

export function WeekStrip({ weeks, activeWeek, month, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
      {weeks.length === 0 && <div style={{ fontSize: 12.5, color: '#9DB09D' }}>No items scheduled in {MONTHS[month]} yet.</div>}
      {weeks.map(w => (
        <button key={w.ws} onClick={() => onPick(w.ws)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: activeWeek === w.ws ? '1px solid #1F6F78' : '1px solid #C9CDD2', background: activeWeek === w.ws ? '#1F6F78' : '#fff', color: activeWeek === w.ws ? '#fff' : '#003223' }}>
          Week of {new Date(w.ws + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {w.count}
        </button>
      ))}
    </div>
  );
}

// Legend is built from the editable type + mode lists (staff may rename or
// recolour them in the Types & modes tab).
export function CityLegend({ types, modes }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#D5E0D5' }}>
      <span style={{ fontWeight: 700 }}>Types:</span>
      {(types || []).map(t => (
        <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color }} />{t.name}</span>
      ))}
      <span style={{ fontWeight: 700, marginLeft: 8 }}>Modes:</span>
      {(modes || []).map(m => (
        <span key={m.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: m.color }} />{m.name}</span>
      ))}
      <span style={{ fontSize: 11, color: '#9DB09D' }}>· dimmed rows are hidden from Fellows</span>
    </div>
  );
}
