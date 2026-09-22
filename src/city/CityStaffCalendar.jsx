// City staff calendar: staff-only tasks on the same year/month/week
// structure as the Fellow calendar, plus the plain task list.
import React, { useMemo, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { toMin, toIsoDate, monthOf, weekStartOf } from './cityCalHelpers';
import { MonthStrip, WeekStrip } from './cityCalParts.jsx';
import { blankStaffTask, StaffTaskEditor } from './CityStaffTaskEditor.jsx';
import { TaskCells, TaskList } from './cityTaskParts.jsx';

export default function CityStaffCalendar({ items, staffTasks, setStaffTasks, settings, canEdit, types, modes }) {
  const year = Number(settings?.year) || new Date().getFullYear();
  const todayIso = toIsoDate(new Date());
  const [showMain, setShowMain] = useState(true);
  const [month, setMonth] = useState(() => (todayIso.startsWith(String(year)) ? Number(todayIso.slice(5, 7)) - 1 : 0));
  const [weekIso, setWeekIso] = useState(() => (todayIso.startsWith(String(year)) ? weekStartOf(todayIso) : `${year}-01-05`));
  const [editing, setEditing] = useState(null);
  const yearTasks = useMemo(() => (staffTasks || []).filter(t => !t.date || String(t.date).startsWith(String(year))), [staffTasks, year]);
  const monthTasks = useMemo(() => yearTasks.filter(t => t.date && monthOf(t.date) === month), [yearTasks, month]);
  const weeks = useMemo(() => {
    const keys = {};
    monthTasks.forEach(t => { keys[weekStartOf(t.date)] = true; });
    if (showMain) (items || []).filter(s => s.date && String(s.date).startsWith(String(year)) && monthOf(s.date) === month).forEach(s => { keys[weekStartOf(s.date)] = true; });
    return Object.keys(keys).sort().map(ws => ({ ws, count: monthTasks.filter(t => weekStartOf(t.date) === ws).length }));
  }, [monthTasks, items, showMain, year, month]);
  const activeWeek = weeks.some(w => w.ws === weekIso) ? weekIso : (weeks[0]?.ws || weekIso);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeWeek + 'T00:00:00'); d.setDate(d.getDate() + i);
    return toIsoDate(d);
  }), [activeWeek]);
  const weekTasks = useMemo(() => monthTasks.filter(t => days.includes(t.date)).sort((a, b) => (a.date || '').localeCompare(b.date || '') || (toMin(a.start) || 9999) - (toMin(b.start) || 9999)), [monthTasks, days]);
  const monthCounts = Array.from({ length: 12 }, (_, m) => yearTasks.filter(t => t.date && monthOf(t.date) === m).length);
  const save = (next) => {
    setStaffTasks(prev => {
      const list = prev || [];
      return list.some(t => String(t.id) === String(next.id)) ? list.map(t => String(t.id) === String(next.id) ? next : t) : [...list, next];
    });
    setEditing(null);
  };
  const remove = (id) => { setStaffTasks(prev => (prev || []).filter(t => String(t.id) !== String(id))); setEditing(null); };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Staff planning calendar · {year}</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}><input type="checkbox" checked={showMain} onChange={() => setShowMain(v => !v)} /> Main city items</label>
        {canEdit && <button onClick={() => setEditing({ ...blankStaffTask(null, types, modes) })} className="btn-primary text-xs"><Plus size={14} /> Add staff task</button>}
      </div>
      <MonthStrip month={month} monthCounts={monthCounts} onPick={(m) => setMonth(m)} />
      <WeekStrip weeks={weeks} activeWeek={activeWeek} month={month} onPick={(ws) => setWeekIso(ws)} />
      <div style={{ background: '#fff', border: '1px solid #DDE2E6', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'flex', minWidth: 700 }}>
          {days.map(iso => (
            <div key={iso} style={{ flex: 1, borderRight: '1px solid #EEF0F2', padding: 10, minHeight: 110 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#003223', marginBottom: 8 }}>{new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <TaskCells list={weekTasks.filter(t => t.date === iso)} canEdit={canEdit} onEdit={setEditing} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #DDE2E6', borderRadius: 8, padding: 16, color: '#003223' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Staff task list</div>
        <TaskList tasks={yearTasks.filter(t => t.date).sort((a, b) => (a.date || '').localeCompare(b.date || ''))} canEdit={canEdit} onEdit={setEditing} />
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Unscheduled staff tasks</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {yearTasks.filter(t => !t.date).map(t => (
            <div key={t.id} onClick={() => canEdit && setEditing(t)} style={{ padding: '8px 10px', border: '1px solid #DDE2E6', borderLeft: '3px solid #D0A023', borderRadius: 5, cursor: canEdit ? 'pointer' : 'default', fontSize: 12.5 }}>{t.name || '(untitled)'}{t.owner ? ' · ' + t.owner : ''}</div>
          ))}
        </div>
      </div>
      {editing && <StaffTaskEditor task={editing} onSave={save} onDelete={editing.id && (staffTasks || []).some(t => String(t.id) === String(editing.id)) ? remove : null} onClose={() => setEditing(null)} types={types} modes={modes} />}
    </div>
  );
}
