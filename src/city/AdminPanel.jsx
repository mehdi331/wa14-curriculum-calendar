// AdminPanel: the separate access point. Fellows never route here.
// AFA + Coach + full-access staff manage Fellows; staff management needs
// full access (or the superadmin identity). Fellows and City staff live on
// separate tabs.
import React, { useState } from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
import { FellowsAdmin } from './cityAdminFellows.jsx';
import { StaffAdmin } from './cityAdminStaff.jsx';
import { canManageCityFellows, canOpenAdminPanel } from './cohort';

const tabBtn = on => ({ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid ' + (on ? '#1F6F78' : '#2A5C4B'), background: on ? '#1F6F78' : 'transparent', color: on ? '#fff' : '#9DB09D' });

export default function AdminPanel({ auth, roster, setRoster, planners, setPlanners, settings }) {
  // Tab rights from the staffer's City access: 'full' sees everything,
  // 'fellows' manages the Fellow roster, and only full control (or the
  // superadmin) touches City staff. Read-only staff never reach this panel.
  const full = auth.role === 'superadmin' || auth.access === 'full';
  const canManageFellows = canManageCityFellows(auth);
  const [tab, setTab] = useState('fellows');
  const active = tab === 'staff' && !full ? 'fellows' : tab;
  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Admin panel · City</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 16 }}>Signed in as {auth.name} · {auth.roleLabel}. This access point is hidden from Fellows.</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('fellows')} style={tabBtn(active === 'fellows')}>Fellows</button>
        {full && <button onClick={() => setTab('staff')} style={tabBtn(active === 'staff')}>City staff</button>}
      </div>
      <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldCheck size={16} color="#D65641" />
        <div style={{ fontSize: 12.5 }}>{active === 'staff' ? 'Full control: add, edit and remove City staff and set their Training Systems.' : 'Staff with Fellows access can add, edit and remove Fellows here. Staff changes need full control.'}</div>
      </div>
      {active === 'fellows'
        ? <FellowsAdmin roster={roster} setRoster={setRoster} canManage={canManageFellows} auth={auth} planners={planners} settings={settings} />
        : <StaffAdmin planners={planners} setPlanners={setPlanners} canManageStaff={full} />}
    </div>
  );
}

