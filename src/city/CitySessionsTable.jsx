// City sessions table: filterable list of spaces/tasks/deadlines with cohort
// targeting visible per row.
import React, { useMemo, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { typeColor, modeColor, cohortLabel } from './cityCalHelpers';

const selectStyle = 'field-select';

export default function CitySessionsTable({ items, settings, types, modes, canEdit, onAdd, onEdit, onDelete }) {
  const [kind, setKind] = useState('all');
  const [type, setType] = useState('all');
  const [mode, setMode] = useState('all');
  const [cohort, setCohort] = useState('all');
  const [query, setQuery] = useState('');
  const year = Number(settings?.year) || 2026;
  const rows = useMemo(() => {
    let r = (items || []).slice();
    const q = query.trim().toLowerCase();
    if (q) r = r.filter(s => String(s.name || '').toLowerCase().includes(q));
    if (kind !== 'all') r = r.filter(s => (s.kind || 'space') === kind);
    if (type !== 'all') r = r.filter(s => (s.type || 'PD Session') === type);
    if (mode !== 'all') r = r.filter(s => (s.mode || 'Sync') === mode);
    if (cohort !== 'all') r = r.filter(s => {
      const t = Array.isArray(s.cohorts) ? s.cohorts.map(String) : [String(s.cohorts)];
      return t.includes('all') || t.includes(String(cohort));
    });
    r.sort((a, b) => (a.date || 'zzzz').localeCompare(b.date || 'zzzz'));
    return r;
  }, [items, kind, type, mode, cohort, query]);
  const dateLabel = d => d ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Spaces & tasks · {year}</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 14 }}>Year 1 and Year 2 share one list; the Cohorts column shows who sees each row. Shared rows appear on both calendars. Rows marked Hidden are kept off Fellow calendars.</div>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {canEdit && <button onClick={onAdd} className="btn-primary text-xs"><Plus size={14} /> Add item</button>}
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name" className="field-input !w-[220px] max-w-full" />
        <select value={kind} onChange={e => setKind(e.target.value)} className={selectStyle}><option value="all">All kinds</option><option value="space">Spaces</option><option value="task">Tasks</option><option value="deadline">Deadlines</option></select>
        <select value={type} onChange={e => setType(e.target.value)} className={selectStyle}><option value="all">All types</option>{(types || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select>
        <select value={mode} onChange={e => setMode(e.target.value)} className={selectStyle}><option value="all">All modes</option>{(modes || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select>
        <select value={cohort} onChange={e => setCohort(e.target.value)} className={selectStyle}><option value="all">All cohorts</option><option value={String(year)}>Year 1 ({year})</option><option value={String(year - 1)}>Year 2 ({year - 1})</option></select>
        <span style={{ fontSize: 12.5, color: '#9DB09D' }}>{rows.length} rows</span>
      </div>
      <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr style={{ background: '#00402E', textAlign: 'left' }}>{['Date', 'Item', 'Kind', 'Type', 'Mode', 'Cohorts', 'Fellows', ''].map(h => (<th key={h} style={{ padding: '9px 12px', fontWeight: 600, color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{h}</th>))}</tr></thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #1F4A3C', opacity: s.visibleToFellows === false ? 0.65 : 1 }}>
                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{dateLabel(s.date)}{s.start ? ` · ${s.start}` : ''}</td>
                <td style={{ padding: '8px 12px', fontWeight: 500 }}>{s.name || '(untitled)'}</td>
                <td style={{ padding: '8px 12px' }}>{(s.kind || 'space') === 'space' ? 'Space' : s.kind === 'task' ? 'Task' : 'Deadline'}</td>
                <td style={{ padding: '8px 12px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: typeColor(s.type, types) }} />{s.type || 'PD Session'}</span></td>
                <td style={{ padding: '8px 12px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: modeColor(s.mode, modes) }} />{s.mode || 'Sync'}</span></td>
                <td style={{ padding: '8px 12px' }}>{cohortLabel(s.cohorts)}</td>
                <td style={{ padding: '8px 12px' }}>{s.visibleToFellows === false ? <span style={{ color: '#D0A023', fontWeight: 600 }}>Hidden</span> : 'Visible'}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {canEdit && (<React.Fragment>
                    <button onClick={() => onEdit(s)} style={{ background: 'none', border: 'none', color: '#D65641', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => { if (window.confirm('Delete this item?')) onDelete(s.id); }} style={{ background: 'none', border: 'none', color: '#D0A023', fontSize: 12, cursor: 'pointer', marginLeft: 10 }}>Delete</button>
                  </React.Fragment>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
