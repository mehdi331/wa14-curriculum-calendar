// City staff task cells (shared week strip pieces live in cityCalParts).
import React from 'react';

export function TaskCells({ list, canEdit, onEdit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {list.map(t => (
        <div key={t.id} onClick={() => canEdit && onEdit(t)} title={t.name} style={{ fontSize: 10.5, lineHeight: 1.3, color: '#1B2733', background: '#D0A02326', borderLeft: '3px solid #D0A023', borderRadius: 4, padding: '3px 6px', overflow: 'hidden', cursor: canEdit ? 'pointer' : 'default' }}>{t.start ? t.start + ' ' : ''}{t.name}{t.owner ? ' · ' + t.owner : ''}</div>
      ))}
      {list.length === 0 && <div style={{ fontSize: 11, color: '#9DB09D' }}>—</div>}
    </div>
  );
}

export function TaskList({ tasks, canEdit, onEdit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 18 }}>
      {tasks.map(t => (
        <div key={t.id} onClick={() => canEdit && onEdit(t)} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #EEF0F2', fontSize: 12.5, cursor: canEdit ? 'pointer' : 'default' }}>
          <span>{t.name || '(untitled)'}{t.owner ? ' · ' + t.owner : ''}{t.status ? ` · ${t.status}` : ''}</span>
          <span style={{ whiteSpace: 'nowrap' }}>{t.date ? new Date(t.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Unscheduled'}{t.start ? ` · ${t.start}–${t.end || ''}` : ''}</span>
        </div>
      ))}
    </div>
  );
}
