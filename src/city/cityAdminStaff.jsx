// AdminPanel staff section, part 1: list + add form. Full-access only.
import React, { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { inputStyle, btnPrimary } from './cityForm.jsx';
import { StaffRow, CITY_ROLES } from './cityAdminStaffRow.jsx';
import { CITY_ACCESS } from './cohort';

export function StaffAdmin({ planners, setPlanners, canManageStaff }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [role, setRole] = useState('afa'); const [access, setAccess] = useState('resources'); const [error, setError] = useState('');
  const [sysWa, setSysWa] = useState(false); const [sysCity, setSysCity] = useState(true);
  const STAFF_EMAIL_RE = /^[a-z]+@teachforbangladesh\.org$/i;
  const sorted = (planners || []).slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  const add = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!STAFF_EMAIL_RE.test(em)) { setError('Email must look like name@teachforbangladesh.org'); return; }
    if (sorted.some(p => String(p.email || '').toLowerCase() === em)) { setError('That email is already on the staff list.'); return; }
    const systems = [sysWa && 'winter_academy', sysCity && 'city'].filter(Boolean);
    const finalSystems = systems.length ? systems : ['city'];
    // New City staff start at the chosen City access; a staffer added with WA
    // defaults to resources-only on the WA side (raised later in the WA Staff
    // tab by superadmin / WA full-control).
    setPlanners([...(planners || []), {
      id: 'p' + Date.now(), name: name.trim(), email: em, role, access,
      waAccess: finalSystems.includes('winter_academy') ? 'resources' : undefined,
      systems: finalSystems,
      adminPanel: access === 'full' || access === 'fellows' || ['afa', 'coach'].includes(role), group: ''
    }]);
    setName(''); setEmail(''); setRole('afa'); setAccess('resources'); setSysWa(false); setSysCity(true); setError('');
  };
  const remove = (id) => { if (window.confirm('Remove this staff member?')) setPlanners((planners || []).filter(p => String(p.id) !== String(id))); };
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>City staff</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 12 }}>
        {canManageStaff ? 'Full-access staff manage this list: role, City access level and Training Systems (City, Winter Academy, or both). Anyone added with WA starts at Resources only there.' : 'Staff management needs full access. Your Fellows rights cover the Fellows list above.'}
      </div>
      {canManageStaff && (
        <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: 16, marginBottom: 14, maxWidth: 640 }}>
          <form onSubmit={add} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Name</div><input className={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Staff full name" /></div>
            <div style={{ flex: '1 1 200px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Email</div><input className={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="name@teachforbangladesh.org" /></div>
            <div style={{ flex: '1 1 130px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Role</div><select className={inputStyle} value={role} onChange={e => setRole(e.target.value)}>{CITY_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
            <div style={{ flex: '1 1 150px' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>City access</div><select className={inputStyle} value={access} onChange={e => setAccess(e.target.value)}>{CITY_ACCESS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Training Systems</div>
              <div style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}><input type="checkbox" checked={sysWa} onChange={e => setSysWa(e.target.checked)} /> Winter Academy</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}><input type="checkbox" checked={sysCity} onChange={e => setSysCity(e.target.checked)} /> City</label>
              </div>
              <div style={{ fontSize: 11, color: '#9DB09D', marginTop: 4 }}>Both ticked → the staff member gets the system picker automatically.</div>
            </div>
            <button type="submit" className={btnPrimary + ' h-[35px]'}><Plus size={14} /> Add</button>
          </form>
          {error && <div style={{ color: '#D0A023', fontSize: 12, marginTop: 8 }}>{error}</div>}
        </div>
      )}
      <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflowX: 'auto', maxWidth: 760 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr style={{ background: '#00402E', textAlign: 'left' }}><th style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>Name</th><th style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>Role / system</th><th style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>Access</th><th style={{ padding: '9px 12px', borderBottom: '1px solid #2A5C4B' }}></th></tr></thead>
          <tbody>
            {sorted.map(p => (
              <StaffRow key={p.id} person={p} canManageStaff={canManageStaff} setPlanners={setPlanners} onRemove={remove} />
            ))}
            {sorted.length === 0 && <tr><td colSpan={4} style={{ padding: 18, textAlign: 'center', color: '#9DB09D' }}>No City staff yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
