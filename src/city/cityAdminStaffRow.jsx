// Staff row editor: role + access + system scope + per-system Winter Academy
// access (see comment on WA_ACCESS below).
import React, { useState } from 'react';
import { Trash as Trash2 } from '@phosphor-icons/react';
import { inputStyle, btnSecondary, btnGhost } from './cityForm.jsx';
import { CITY_ACCESS } from './cohort';

export const CITY_ROLES = [
  { id: 'city_lead', label: 'City Lead' },
  { id: 'afa', label: 'AFA' },
  { id: 'coach', label: 'Coach' },
  { id: 'academy_lead', label: 'Academy Lead' },
  { id: 'curriculum_specialist', label: 'Curriculum Specialist' },
];
const ACCESS = CITY_ACCESS;
// WA access options on the City side mirror the WA Staff tab so a City staffer
// granted WA always starts at resources-only and can be raised in WA.
const WA_ACCESS = [
  { id: 'full', label: 'WA: Full control' },
  { id: 'resources_assessments', label: 'WA: Resources + assessments' },
  { id: 'resources', label: 'WA: Resources only' },
];
export const roleLabel = id => (CITY_ROLES.find(r => r.id === id) || {}).label || id || 'Staff';
export const accessLabel = id => (CITY_ACCESS.find(a => a.id === id) || {}).label || id;
export const waAccessLabel = id => (WA_ACCESS.find(a => a.id === id) || {}).label || 'WA: Resources only';

export function StaffRow({ person, canManageStaff, setPlanners, onRemove }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(null);
  const start = () => {
    const systems = person.systems || ['city'];
    setForm({
      name: person.name, email: person.email, role: person.role, access: person.access,
      wa: systems.includes('winter_academy'), city: systems.includes('city'),
      waAccess: person.waAccess || 'resources',
    });
    setOpen(true);
  };
  const save = () => {
    if (!String(form.name || '').trim()) return;
    const systems = [form.wa && 'winter_academy', form.city && 'city'].filter(Boolean);
    const finalSystems = systems.length ? systems : ['city'];
    // A City staffer newly granted WA defaults to resources-only on the WA
    // side; superadmin / WA full-control raises it from the WA Staff tab.
    const waAccess = finalSystems.includes('winter_academy') ? (form.waAccess || 'resources') : person.waAccess;
    setPlanners(prev => (prev || []).map(p => String(p.id) === String(person.id) ? { ...p, name: String(form.name).trim(), email: String(form.email).trim().toLowerCase(), role: form.role, access: form.access, waAccess, systems: finalSystems, adminPanel: form.access === 'full' || form.access === 'fellows' || ['afa', 'coach'].includes(form.role) } : p));
    setOpen(false);
  };
  const systemsLabel = (person.systems || ['city']).map(s => (s === 'winter_academy' ? 'WA' : s)).join(' + ');
  if (!open) {
    return (
      <tr style={{ borderBottom: '1px solid #1F4A3C' }}>
        <td style={{ padding: '8px 12px' }}>{person.name}<div style={{ fontSize: 11, color: '#9DB09D' }}>{person.email}</div></td>
        <td style={{ padding: '8px 12px' }}>{roleLabel(person.role)} · {systemsLabel}{(person.systems || []).includes('winter_academy') && <div style={{ fontSize: 11, color: '#9DB09D' }}>{waAccessLabel(person.waAccess)}</div>}</td>
        <td style={{ padding: '8px 12px' }}>{accessLabel(person.access)}{person.adminPanel ? ' · Admin' : ''}</td>
        <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {canManageStaff && (<React.Fragment>
            <button onClick={start} style={{ background: 'none', border: 'none', color: '#D65641', fontSize: 12, cursor: 'pointer' }}>Edit</button>
            <button onClick={() => onRemove(person.id)} style={{ background: 'none', border: 'none', color: '#D0A023', cursor: 'pointer', marginLeft: 10 }}><Trash2 size={14} /></button>
          </React.Fragment>)}
        </td>
      </tr>
    );
  }
  return (
    <tr style={{ borderBottom: '1px solid #1F4A3C' }}>
      <td colSpan={4} style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <input className={inputStyle} style={{ width: 150 }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <select className={inputStyle} style={{ width: 170 }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{CITY_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select>
          <select className={inputStyle} style={{ width: 170 }} value={form.access} onChange={e => setForm({ ...form, access: e.target.value })}>{ACCESS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select>
          {form.wa && (
            <select className={inputStyle} style={{ width: 200 }} value={form.waAccess} onChange={e => setForm({ ...form, waAccess: e.target.value })}>{WA_ACCESS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select>
          )}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>Training Systems</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}><input type="checkbox" checked={form.wa} onChange={e => setForm({ ...form, wa: e.target.checked })} /> Winter Academy</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}><input type="checkbox" checked={form.city} onChange={e => setForm({ ...form, city: e.target.checked })} /> City</label>
            </div>
          </div>
          <button onClick={save} className={btnSecondary} style={{ fontSize: 12 }}>Save</button>
          <button onClick={() => setOpen(false)} className={btnGhost} style={{ fontSize: 12 }}>Cancel</button>
        </div>
      </td>
    </tr>
  );
}
