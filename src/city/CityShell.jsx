// City shell: the system-scoped City nav from the plan. Fellows see only
// home + calendar; the Admin panel appears only for AFA / Coach / full-access
// staff (auth.adminPanel). Everything else is behind the staff roles.
import React, { useState } from 'react';
import CityHome from './CityHome.jsx';

const FONT = "-apple-system, 'Inter', 'Segoe UI', sans-serif";

import { canOpenAdminPanel } from './cohort';

const CITY_TABS = [
  { id: 'home', label: 'City home' },
  { id: 'calendar', label: 'City calendar' },
  { id: 'sessions', label: 'Spaces & tasks' },
  { id: 'types', label: 'Types & modes' },
  { id: 'staff', label: 'Staff calendar & tasks' },
  { id: 'report', label: 'Spaces report' },
  { id: 'admin', label: 'Admin panel' },
];

export default function CityShell({ auth, system, setSystem, onLeave, store }) {
  const isFellow = auth.role === 'fellow';
  const [view, setView] = useState('home');
  const visible = CITY_TABS.filter(t => {
    if (isFellow) return ['home', 'calendar'].includes(t.id);
    // Types & modes stay behind full control (or the superadmin); the admin
    // panel opens per access level (full / fellows / flagged AFA-Coach).
    if (t.id === 'types') return auth.role === 'superadmin' || auth.access === 'full';
    if (t.id === 'admin') return canOpenAdminPanel(auth);
    return true;
  });
  const active = visible.some(t => t.id === view) ? view : 'home';
  return (
    <div className="wa14-app min-h-screen flex flex-col" style={{ fontFamily: FONT, background: '#252625', color: '#D5E0D5' }}>
      <div className="bg-wa-container/95 border-b border-wa-border px-4 sm:px-6 flex items-center justify-between flex-wrap gap-3">
        <div className="py-2.5">
          <div className="font-extrabold text-lg leading-tight text-white">Fellow Training System · City</div>
          <div className="text-[11.5px] text-wa-muted mt-[2px] font-medium">{auth.name} · {auth.roleLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {visible.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} className={active === t.id ? 'btn-primary text-xs' : 'btn-ghost text-xs'}>{t.label}</button>
          ))}
          {auth.role !== 'fellow' && system && <button onClick={() => setSystem(null)} className="btn-ghost text-xs">Switch system</button>}
          <button onClick={onLeave} className="btn-ghost text-xs">Sign out</button>
        </div>
      </div>
      <div className="wa14-content-inner pt-5 px-6 pb-10">
        <CityHome
          tab={active} setTab={setView} auth={auth}
          roster={store.roster} setRoster={store.setRoster}
          planners={store.planners} setPlanners={store.setPlanners}
          items={store.cityItems} setItems={store.setCityItems}
          staffTasks={store.cityTasks} setStaffTasks={store.setCityTasks}
          settings={store.citySettings} setSettings={store.setCitySettings}
          types={store.cityTypes} setTypes={store.setCityTypes}
          modes={store.cityModes} setModes={store.setCityModes}
        />
      </div>
    </div>
  );
}
