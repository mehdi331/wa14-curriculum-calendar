// [CITY] Training System picker: shown automatically after sign-in to staff
// whose Training Systems include both Winter Academy and City. Fellows never
// see it -- their system derives from their cohort.
import React from 'react';
import { SYSTEMS, systemsForStaff } from './cohort';

const FONT = "-apple-system, 'Inter', 'Segoe UI', sans-serif";

export default function SystemGate({ auth, onPick, onLogout }) {
  const systems = systemsForStaff(auth);
  return (
    <div className="wa14-app min-h-[480px] flex items-center justify-center bg-wa-bg" style={{ fontFamily: FONT }}>
      <div className="wa-card p-8 w-[460px] max-w-[92vw]">
        <div className="text-[11px] font-bold tracking-wider uppercase text-wa-button mb-1">Training System</div>
        <div className="font-extrabold text-xl mb-1">Which system do you want to enter?</div>
        <div className="text-xs text-wa-muted mb-5">{auth.name} · {systems.map(s => SYSTEMS[s]?.label).join(' + ')}</div>
        {systems.map(s => (
          <button key={s} type="button" onClick={() => onPick(s)} className="btn-primary w-full justify-center py-2.5 mb-2">{SYSTEMS[s].label}</button>
        ))}
        <div className="text-[11.5px] text-wa-muted mb-4">{systems.map(s => SYSTEMS[s]?.blurb).join(' ')}</div>
        <button type="button" onClick={onLogout} className="btn-ghost w-full justify-center">Sign out</button>
      </div>
    </div>
  );
}