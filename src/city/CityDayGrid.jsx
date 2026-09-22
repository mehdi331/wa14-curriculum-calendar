// City day-grid: the 7-day strip. Fellows and staff share it; staff cells get
// an "add" affordance via onAddDay, everyone else gets day detail via onDay.
import React from 'react';
import { typeColor } from './cityCalHelpers';

export default function CityDayGrid({ days, weekItems, shownDay, todayIso, onDay, canEditSchedule, onAddDay, types }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #DDE2E6', borderRadius: 8, overflow: 'hidden', marginBottom: shownDay ? 16 : 0 }}>
      <div style={{ display: 'flex', minWidth: 700 }}>
        {days.map(iso => {
          const list = weekItems.filter(s => s.date === iso);
          const label = new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
          return (
            <button key={iso} onClick={() => onDay(iso)} style={{ flex: 1, textAlign: 'left', background: shownDay === iso ? '#EEF4F2' : iso === todayIso ? '#FFF8E8' : '#fff', border: 'none', borderRight: '1px solid #EEF0F2', padding: 10, cursor: 'pointer', minHeight: 130 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#003223', marginBottom: 8 }}>{label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {list.slice(0, 5).map(s => (
                  <div key={s.id} title={s.name + (s.visibleToFellows === false ? ' (hidden from Fellows)' : '')} style={{ fontSize: 10.5, lineHeight: 1.3, color: '#1B2733', background: typeColor(s.type, types) + '26', borderLeft: '3px solid ' + typeColor(s.type, types), borderRadius: 4, padding: '3px 6px', overflow: 'hidden', opacity: s.visibleToFellows === false ? 0.55 : 1 }}>{s.start ? s.start + ' ' : ''}{s.name}</div>
                ))}
                {list.length > 5 && <div style={{ fontSize: 10.5, color: '#003223' }}>+{list.length - 5} more</div>}
                {list.length === 0 && <div style={{ fontSize: 11, color: '#9DB09D' }}>—</div>}
              </div>
              {canEditSchedule && <div style={{ marginTop: 6 }}><span onClick={(e) => { e.stopPropagation(); onAddDay(iso); }} style={{ fontSize: 11, color: '#1F6F78', fontWeight: 700, cursor: 'pointer' }}>+ Add here</span></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
