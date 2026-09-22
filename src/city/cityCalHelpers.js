// CityCalendarView (part 1): helpers + year/month/week state. Colours come
// from the fixed City space modes; a Learning Circle renders as a ring.
import React, { useMemo, useState } from 'react';
import { colorFor } from './cohort';

const FONT = "-apple-system, 'Inter', 'Segoe UI', sans-serif";
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = n => String(n).padStart(2, '0');
export const toMin = t => { if (!t) return null; const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
export const toIsoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Calendar boxes are coloured by TYPE (like the WA app's session types); the
// mode is shown as text. Both lookups read the editable lists.
export const typeColor = (type, types) => colorFor(type, types);
export const modeColor = (mode, modes) => colorFor(mode, modes);
export const cohortLabel = cohorts => {
  if (!cohorts || cohorts === 'all' || (Array.isArray(cohorts) && cohorts.includes('all'))) return 'All cohorts';
  const list = (Array.isArray(cohorts) ? cohorts : [cohorts]).map(String);
  return list.map(c => `Cohort ${c}`).join(' + ');
};
export const monthOf = iso => Number(String(iso || '').slice(5, 7)) - 1;

export function weekStartOf(iso) {
  const d = new Date(iso + 'T00:00:00');
  const back = (d.getDay() + 6) % 7; // Monday-first weeks
  d.setDate(d.getDate() - back);
  return toIsoDate(d);
}
