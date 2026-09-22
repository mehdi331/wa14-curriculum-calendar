// Fellow row: display + expandable editor with every profile field
// (cohort, grade, track, placement city, coach, AFA group) -- available to
// every role that can manage Fellows.
import React, { useState } from 'react';
import { Trash as Trash2 } from '@phosphor-icons/react';
import { COHORT_ROLE_LABEL, cohortRole } from './cohort';
import { inputStyle, btnSecondary, btnGhost, coachOptions } from './cityForm.jsx';

export function FellowRow({ fellow, canManage, setRoster, onRemove, planners }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const start = () => {
    setForm({ name: fellow.name || '', email: fellow.email || '', cohort: String(fellow.cohort || ''), track: fellow.track || '', grade: fellow.grade || '', placementCity: fellow.placementCity || '', coachId: fellow.coachId || '', afaGroup: fellow.afaGroup || '' });
    setOpen(true);
  };
  const save = () => {
    if (!String(form.name || '').trim() || !String(form.email || '').trim()) return;
    const coach = coachOptions(planners).find(p => String(p.id) === String(form.coachId));
    setRoster(prev => (prev || []).map(r => String(r.id) === String(fellow.id) ? {
      ...r,
      name: String(form.name).trim(),
      email: String(form.email).trim().toLowerCase(),
      cohort: Number(form.cohort) || r.cohort,
      track: String(form.track || '').trim().toLowerCase(),
      grade: String(form.grade || '').trim(),
      placementCity: String(form.placementCity || '').trim(),
      afaGroup: String(form.afaGroup || '').trim(),
      coachId: coach ? coach.id : '',
      coachName: coach ? coach.name : '',
    } : r));
    setOpen(false);
  };
  const field = (label, key, width) => (
    <div style={{ width }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <input className={inputStyle} value={form[key]} onChange={e => set(key, e.target.value)} />
    </div>
  );
  if (canManage && open) {
    return (
      <tr style={{ borderBottom: '1px solid #1F4A3C', background: '#00281D' }}>
        <td colSpan={6} style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {field('Name', 'name', 150)}
            {field('Email', 'email', 180)}
            {field('Cohort', 'cohort', 70)}
            <div style={{ width: 110 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>Track</div>
              <select className={inputStyle} value={form.track} onChange={e => set('track', e.target.value)}>
                <option value="">—</option><option value="primary">Primary</option><option value="secondary">Secondary</option>
              </select>
            </div>
            {field('Grade', 'grade', 64)}
            {field('Placement city', 'placementCity', 110)}
            {field('AFA group', 'afaGroup', 100)}
            <div style={{ width: 150 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>Coach</div>
              <select className={inputStyle} value={form.coachId} onChange={e => set('coachId', e.target.value)}>
                <option value="">—</option>
                {coachOptions(planners).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={save} className={btnSecondary} style={{ fontSize: 12 }}>Save</button>
            <button onClick={() => setOpen(false)} className={btnGhost} style={{ fontSize: 12 }}>Cancel</button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr style={{ borderBottom: '1px solid #1F4A3C' }}>
      <td style={{ padding: '8px 12px' }}>{fellow.name}<div style={{ fontSize: 11, color: '#9DB09D' }}>{fellow.email}</div></td>
      <td style={{ padding: '8px 12px' }}>{fellow.cohort || '—'} · {COHORT_ROLE_LABEL[cohortRole(fellow.cohort)]}</td>
      <td style={{ padding: '8px 12px' }}>{fellow.grade || '—'}{fellow.track ? ` · ${fellow.track}` : ''}</td>
      <td style={{ padding: '8px 12px' }}>{fellow.placementCity || '—'}{fellow.afaGroup ? ' · ' + fellow.afaGroup : ''}</td>
      <td style={{ padding: '8px 12px' }}>{fellow.coachName || '—'}</td>
      <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {canManage && (<React.Fragment>
          <button onClick={start} style={{ background: 'none', border: 'none', color: '#D65641', fontSize: 12, cursor: 'pointer' }}>Edit</button>
          <button onClick={() => onRemove(fellow.id)} style={{ background: 'none', border: 'none', color: '#D0A023', cursor: 'pointer', marginLeft: 10 }}><Trash2 size={14} /></button>
        </React.Fragment>)}
      </td>
    </tr>
  );
}
