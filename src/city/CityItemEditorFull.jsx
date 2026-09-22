// City editor (full): kind, type + mode (from the editable lists), cohort
// targeting, Fellow visibility, facilitators, notes -- one drawer used by the
// calendar and the sessions table.
import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { CITY_KINDS } from './cohort';
import { Field, inputStyle, btnPrimary, btnSecondary, blankCityItem } from './cityForm.jsx';
import { CityFacilitators, CityNotes } from './CityItemEditorB.jsx';

export default function CityItemEditorFull({ item, settings, planners, types, modes, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...blankCityItem(null, settings, types, modes), ...item });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const year = Number(settings?.year) || 2026;
  const cohortValue = form.cohorts === 'all' ? 'all' : (Array.isArray(form.cohorts) ? (form.cohorts.length > 1 ? 'both' : String(form.cohorts[0])) : String(form.cohorts || 'both'));
  const typeNames = (types || []).map(t => t.name);
  const modeNames = (modes || []).map(m => m.name);
  const typeValue = typeNames.includes(form.type) ? form.type : (form.type || typeNames[0] || 'PD Session');
  const modeValue = modeNames.includes(form.mode) ? form.mode : (form.mode || modeNames[0] || 'Sync');
  const save = () => {
    if (!String(form.name || '').trim()) return;
    const cohorts = form.cohorts === 'all' ? 'all' : (cohortValue === 'both' ? [String(year), String(year - 1)] : [cohortValue]);
    const { learningCircle, ...rest } = form; // legacy field, dropped on save
    onSave({
      ...rest, name: String(form.name).trim(), date: form.date || null, start: form.start || null, end: form.end || null,
      type: typeValue, mode: modeValue, visibleToFellows: form.visibleToFellows !== false, cohorts,
      facilitators: (form.facilitators || []).filter(f => (f.staffName || '').trim()).map(f => ({ id: f.id || 'cf' + Date.now(), staffName: f.staffName.trim() })),
      fellowNotes: (form.fellowNotes || '').trim(), notes: (form.notes || '').trim(), calendared: !!(form.date && form.start),
    });
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,39,51,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '92vw', background: '#003223', height: '100%', overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{item?.id ? 'Edit city item' : 'New city item'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9DB09D' }}><X size={18} /></button>
        </div>
        <Field label="Name"><input className={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Year 1 Workshop — March" /></Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Kind" style={{ flex: 1 }}><select className={inputStyle} value={form.kind} onChange={e => set('kind', e.target.value)}>{CITY_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select></Field>
          <Field label="Type" style={{ flex: 1 }}><select className={inputStyle} value={typeValue} onChange={e => set('type', e.target.value)}>
            {!typeNames.includes(typeValue) && <option value={typeValue}>{typeValue}</option>}
            {(types || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select></Field>
          <Field label="Work mode" style={{ flex: 1 }}><select className={inputStyle} value={modeValue} onChange={e => set('mode', e.target.value)}>
            {!modeNames.includes(modeValue) && <option value={modeValue}>{modeValue}</option>}
            {(modes || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select></Field>
        </div>
        <Field label="Fellow visibility"><label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}><input type="checkbox" checked={form.visibleToFellows !== false} onChange={e => set('visibleToFellows', e.target.checked)} /> Visible to Fellows (uncheck to hide this item from Fellow calendars and agendas)</label></Field>
        <EditorDates form={form} set={set} year={year} cohortValue={cohortValue} />
        <CityFacilitators form={form} set={set} planners={planners} />
        <CityNotes form={form} set={set} />
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={save} className={btnPrimary + ' flex-1 justify-center py-2.5'}>Save item</button>
          {onDelete && item?.id && <button onClick={() => { if (window.confirm('Delete this item?')) onDelete(item.id); }} className={btnSecondary + ' text-wa-warn border-wa-dangerline'}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

function EditorDates({ form, set, year, cohortValue }) {
  return (
    <React.Fragment>
      <div style={{ display: 'flex', gap: 10 }}>
        <Field label="Date" style={{ flex: 1 }}><input type="date" className={inputStyle} value={form.date || ''} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Cohorts" style={{ flex: 1 }}><select className={inputStyle} value={cohortValue} onChange={e => set('cohorts', e.target.value)}>
          <option value="both">Year 1 + Year 2 (shared)</option>
          <option value={String(year)}>Year 1 only ({year})</option>
          <option value={String(year - 1)}>Year 2 only ({year - 1})</option>
          <option value="all">All cohorts</option>
        </select></Field>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Field label="Start" style={{ flex: 1 }}><input type="time" className={inputStyle} value={form.start || ''} onChange={e => set('start', e.target.value)} /></Field>
        <Field label="End" style={{ flex: 1 }}><input type="time" className={inputStyle} value={form.end || ''} onChange={e => set('end', e.target.value)} /></Field>
      </div>
    </React.Fragment>
  );
}
