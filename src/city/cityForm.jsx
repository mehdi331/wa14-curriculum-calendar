// City form chrome shared by the staff-side City panels, plus the blank item
// shape and coach-options helper used by the calendar, sessions table and
// Admin panel's Fellow forms.
import React from 'react';

export const inputStyle = 'field-input';
export const btnPrimary = 'btn-primary';
export const btnSecondary = 'btn-secondary';
export const btnGhost = 'btn-ghost';
export const Field = ({ label, children, style }) => (
  <div style={{ marginBottom: 14, ...style }}><div style={{ fontSize: 12, color: '#D5E0D5', fontWeight: 600, marginBottom: 5 }}>{label}</div>{children}</div>
);

export function blankCityItem(date, settings, types, modes) {
  const year = Number(settings?.year) || new Date().getFullYear();
  const typeName = (types && types[0] && types[0].name) || 'PD Session';
  const modeName = (modes && modes[0] && modes[0].name) || 'Sync';
  return {
    id: 'c' + Date.now(), kind: 'space', name: '', date: date || `${year}-01-05`, start: '10:00', end: '11:00',
    type: typeName, mode: modeName, cohorts: 'both', visibleToFellows: true, facilitators: [], fellowNotes: '', notes: '', calendared: true,
  };
}

// Coach picker options: coaches first, then other City staff (so any staff
// member can be assigned while coaches sort first).
export function coachOptions(planners) {
  const list = planners || [];
  const coaches = list.filter(p => p.role === 'coach' && p.name);
  const others = list.filter(p => p.role !== 'coach' && p.name && (p.systems || ['city']).includes('city'));
  return [...coaches, ...others];
}
