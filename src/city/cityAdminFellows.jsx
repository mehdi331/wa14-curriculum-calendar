// AdminPanel Fellows tab: add/edit/remove Fellows with cohort, grade,
// placement city and coach. Available to every role that can open the admin
// panel (AFA, Coach, full-access admin, superadmin). A Winter Academy AFA's
// new Fellows get the NEXT year pre-assigned as their cohort automatically.
import React, { useState } from 'react';
import { Plus, Trash as Trash2 } from '@phosphor-icons/react';
import { COHORT_ROLE_LABEL, cohortRole, defaultCohortForCreator } from './cohort';
import { FellowRow } from './cityAdminFellowRow.jsx';
import { inputStyle, btnPrimary, coachOptions } from './cityForm.jsx';

const FELLOW_EMAIL_RE = /^[a-z]+\.[a-z]+@teachforbangladesh\.org$/i;

export function blankFellowForm(auth) {
  return { name: '', email: '', cohort: defaultCohortForCreator(auth), track: '', grade: '', placementCity: '', coachId: '', afaGroup: '' };
}

export function FellowsAdmin({ roster, setRoster, canManage, auth, planners, settings }) {
  const [form, setForm] = useState(() => blankFellowForm(auth));
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const autoCohort = defaultCohortForCreator(auth);
  const isAuto = Number(form.cohort) === autoCohort;
  const add = (e) => {
    e.preventDefault();
    const em = form.email.trim().toLowerCase();
    if (!form.name.trim()) { setError('Enter a name.'); return; }
    if (!FELLOW_EMAIL_RE.test(em)) { setError('Email must look like firstname.lastname@teachforbangladesh.org'); return; }
    if ((roster || []).some(r => String(r.email || '').toLowerCase() === em)) { setError('That email is already on the roster.'); return; }
    const coach = coachOptions(planners).find(p => String(p.id) === String(form.coachId));
    setRoster([...(roster || []), {
      id: 'f' + Date.now(), name: form.name.trim(), email: em,
      cohort: Number(form.cohort) || autoCohort,
      track: form.track.trim().toLowerCase(), grade: form.grade.trim(),
      placementCity: form.placementCity.trim(), afaGroup: form.afaGroup.trim(),
      coachId: coach ? coach.id : '', coachName: coach ? coach.name : '', roomIds: [],
    }]);
    setForm(blankFellowForm(auth)); setError('');
  };
  const remove = (id) => { if (window.confirm('Remove this Fellow?')) setRoster((roster || []).filter(r => String(r.id) !== String(id))); };
  const sorted = (roster || []).slice().sort((a, b) => Number(b.cohort || 0) - Number(a.cohort || 0) || String(a.name || '').localeCompare(String(b.name || '')));
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Fellows</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 12 }}>
        Add every Fellow field here — the calendar each Fellow sees follows their cohort automatically.
        {auth?.role === 'afa' && <> As a Winter Academy AFA, new Fellows start with <b>cohort {autoCohort}</b> (next year) pre-assigned; change it if needed.</>}
      </div>
      {canManage && (
        <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: 16, marginBottom: 14, maxWidth: 640 }}>
          <form onSubmit={add} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 170px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Name</div><input className={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Fellow full name" /></div>
            <div style={{ flex: '1 1 230px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Email</div><input className={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="firstname.lastname@teachforbangladesh.org" /></div>
            <div style={{ width: 92 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Cohort {isAuto && <span style={{ color: '#D0A023' }}>· auto {autoCohort}</span>}</div>
              <input className={inputStyle} value={form.cohort} onChange={e => set('cohort', e.target.value)} placeholder={String(autoCohort)} />
            </div>
            <div style={{ width: 120 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Track</div>
              <select className={inputStyle} value={form.track} onChange={e => set('track', e.target.value)}>
                <option value="">—</option><option value="primary">Primary</option><option value="secondary">Secondary</option>
              </select>
            </div>
            <div style={{ width: 74 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Grade</div><input className={inputStyle} value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="e.g. 4" /></div>
            <div style={{ flex: '1 1 120px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Placement city</div><input className={inputStyle} value={form.placementCity} onChange={e => set('placementCity', e.target.value)} placeholder="e.g. Dhaka" /></div>
            <div style={{ flex: '1 1 170px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Coach</div>
              <select className={inputStyle} value={form.coachId} onChange={e => set('coachId', e.target.value)}>
                <option value="">—</option>
                {coachOptions(planners).map(p => <option key={p.id} value={p.id}>{p.name}{p.role === 'coach' ? '' : ' (staff)'}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 150px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>AFA group</div><input className={inputStyle} value={form.afaGroup} onChange={e => set('afaGroup', e.target.value)} placeholder="e.g. AFA 1" /></div>
            <button type="submit" className={btnPrimary + ' h-[35px]'}><Plus size={14} /> Add</button>
          </form>
          {error && <div style={{ color: '#D0A023', fontSize: 12, marginTop: 8 }}>{error}</div>}
        </div>
      )}
      <FellowsTable roster={sorted} canManage={canManage} setRoster={setRoster} onRemove={remove} planners={planners} />
    </div>
  );
}

export function FellowsTable({ roster, canManage, setRoster, onRemove, planners }) {
  return (
    <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflowX: 'auto', maxWidth: 860 }}>
      <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead><tr style={{ background: '#00402E', textAlign: 'left' }}>{['Name', 'Cohort / status', 'Grade / track', 'City', 'Coach', ''].map(h => (<th key={h} style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{h}</th>))}</tr></thead>
        <tbody>
          {(roster || []).map(r => (
            <FellowRow key={r.id} fellow={r} canManage={canManage} setRoster={setRoster} onRemove={onRemove} planners={planners} />
          ))}
          {(roster || []).length === 0 && <tr><td colSpan={6} style={{ padding: 18, textAlign: 'center', color: '#9DB09D' }}>No Fellows yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
