// City day detail drawer: full item list for one day, with staff edit/delete.
import React from 'react';
import { typeColor, cohortLabel } from './cityCalHelpers';

export default function CityDayDetail({ shownDay, weekItems, canEditSchedule, onEdit, onDelete, types }) {
  if (!shownDay) return null;
  const list = weekItems.filter(s => s.date === shownDay);
  return (
    <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, background: '#00402E' }}>{new Date(shownDay + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      {list.map(s => (
        <div key={s.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid #1F4A3C', alignItems: 'flex-start' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: typeColor(s.type, types), marginTop: 4, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {s.name}
              {s.type && <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 10, background: typeColor(s.type, types) + '26', fontWeight: 700 }}>{s.type}</span>}
              {s.visibleToFellows === false && <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 10, background: '#D0A02326', fontWeight: 700 }}>Hidden from Fellows</span>}
            </div>
            <div style={{ fontSize: 11.5, color: '#9DB09D', marginTop: 2 }}>{(s.kind || 'space') === 'space' ? 'Space' : s.kind === 'task' ? 'Task' : 'Deadline'} · {s.start ? `${s.start}–${s.end || ''}` : 'No time set'} · {s.mode || 'Sync'} · {cohortLabel(s.cohorts)}{s.fellowNotes ? ` · ${s.fellowNotes}` : ''}</div>
          </div>
          {canEditSchedule && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => onEdit(s)} style={{ background: 'none', border: 'none', color: '#D65641', fontSize: 12, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => { if (window.confirm('Delete this item?')) onDelete(s.id); }} style={{ background: 'none', border: 'none', color: '#D0A023', fontSize: 12, cursor: 'pointer' }}>Delete</button>
            </div>
          )}
        </div>
      ))}
      {list.length === 0 && <div style={{ padding: 14, fontSize: 12.5, color: '#9DB09D' }}>Nothing scheduled this day.</div>}
    </div>
  );
}
