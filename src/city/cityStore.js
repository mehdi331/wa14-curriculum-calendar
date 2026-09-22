// [CITY] City data store for the real app: loads + persists the City
// collections through the repo's Firestore-backed storage adapter. The sandbox
// passes its own store object instead (same shape), so CityShell is identical
// in both environments.
import { useEffect, useState } from 'react';
import { storage, CITY_KEYS } from '../storage';
import { DEFAULT_CITY_TYPES, DEFAULT_CITY_MODES } from './cohort';

export const DEFAULT_CITY_SETTINGS = {
  year: new Date().getFullYear(),
  startDate: new Date().getFullYear() + '-01-01',
  endDate: new Date().getFullYear() + '-12-31',
  fellowMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  note: 'City fellowship year',
};

async function getJson(key, fallback) {
  try {
    const r = await storage.get(key);
    return r && r.value ? JSON.parse(r.value) : fallback;
  } catch (e) { return fallback; }
}

export function useCityStore() {
  const [state, setState] = useState({ ready: false, roster: [], planners: [], cityItems: [], cityTasks: [], citySettings: DEFAULT_CITY_SETTINGS, cityTypes: DEFAULT_CITY_TYPES, cityModes: DEFAULT_CITY_MODES });
  useEffect(() => {
    let live = true;
    (async () => {
      const [roster, planners, items, tasks, settings, types, modes] = await Promise.all([
        getJson('wa14-roster', []), getJson('wa14-planners', []),
        getJson(CITY_KEYS.citySessions, []), getJson(CITY_KEYS.cityStaffTasks, []),
        getJson(CITY_KEYS.citySettings, DEFAULT_CITY_SETTINGS),
        getJson(CITY_KEYS.cityTypes, DEFAULT_CITY_TYPES), getJson(CITY_KEYS.cityModes, DEFAULT_CITY_MODES),
      ]);
      if (!live) return;
      setState({
        ready: true, roster, planners, cityItems: items, cityTasks: tasks,
        citySettings: { ...DEFAULT_CITY_SETTINGS, ...(settings || {}) },
        cityTypes: Array.isArray(types) && types.length ? types : DEFAULT_CITY_TYPES,
        cityModes: Array.isArray(modes) && modes.length ? modes : DEFAULT_CITY_MODES,
      });
    })();
    return () => { live = false; };
  }, []);
  const persist = (key, value) => { storage.set(key, JSON.stringify(value)).catch(() => { }); };
  const makeSetter = (field, key) => (update) => setState(s => {
    const next = typeof update === 'function' ? update(s[field]) : update;
    persist(key, next);
    return { ...s, [field]: next };
  });
  return {
    ...state,
    setRoster: makeSetter('roster', 'wa14-roster'),
    setPlanners: makeSetter('planners', 'wa14-planners'),
    setCityItems: makeSetter('cityItems', CITY_KEYS.citySessions),
    setCityTasks: makeSetter('cityTasks', CITY_KEYS.cityStaffTasks),
    setCitySettings: makeSetter('citySettings', CITY_KEYS.citySettings),
    setCityTypes: makeSetter('cityTypes', CITY_KEYS.cityTypes),
    setCityModes: makeSetter('cityModes', CITY_KEYS.cityModes),
  };
}