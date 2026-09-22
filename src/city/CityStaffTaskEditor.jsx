// City staff-task drawer (part 1 of the staff calendar).
import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { Field, inputStyle, btnPrimary, btnSecondary } from './cityForm.jsx';

export function blankStaffTask(date, types, modes) {
  const typeName = (types && types[0] && types[0].name) || 'PD Session';
  const modeName = (modes && modes[0] && modes[0].name) || 'Sync';
  return { id: 'sbt' + Date.now(), kind: 'task', name: '', date: date || '', start: '10:00', end: '11:00', type: typeName, mode: modeName, cohorts: 'internal', owner: '', status: 'todo', notes: '', calendared: true, visibleToFellows: false };
}

export function StaffTaskEditor({ task, onSave, onDelete, onClose, types, modes }) {
  const [form, setForm] = useState({ ...blankStaffTask(null, types, modes), ...task });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = () => {
    if (!String(form.name || '').trim()) return;
    onSave({ ...form, name: String(form.name).trim(), date: form.date || null, start: form.start || null, end: form.end || null, owner: (form.owner || '').trim(), notes: (form.notes || '').trim(), calendared: !!(form.date && form.start) });
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,39,51,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '92vw', background: '#003223', height: '100%', overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{task?.id ? 'Edit staff task' : 'New staff task'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9DB09D' }}><X size={18} /></button>
        </div>
        <Field label="Task"><input className={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Prep City PD deck" /></Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Type" style={{ flex: 1 }}><select className={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>{(types || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></Field>
          <Field label="Work mode" style={{ flex: 1 }}><select className={inputStyle} value={form.mode} onChange={e => set('mode', e.target.value)}>{(modes || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select></Field>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Date" style={{ flex: 1 }}><input type="date" className={inputStyle} value={form.date || ''} onChange={e => set('date', e.target.value)} /></Field>
          <Field label="Owner" style={{ flex: 1 }}><input className={inputStyle} value={form.owner} onChange={e => set('owner', e.target.value)} placeholder="Staff name" /></Field>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Start" style={{ flex: 1 }}><input type="time" className={inputStyle} value={form.start || ''} onChange={e => set('start', e.target.value)} /></Field>
          <Field label="End" style={{ flex: 1 }}><input type="time" className={inputStyle} value={form.end || ''} onChange={e => set('end', e.target.value)} /></Field>
        </div>
        <Field label="Status"><select className={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>{['todo', 'in_progress', 'blocked', 'done'].map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
        <Field label="Notes"><textarea className={inputStyle + ' resize-y'} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={save} className={btnPrimary + ' flex-1 justify-center py-2.5'}>Save task</button>
          {onDelete && task?.id && <button onClick={() => { if (window.confirm('Delete this task?')) onDelete(task.id); }} className={btnSecondary + ' text-wa-warn border-wa-dangerline'}>Delete</button>}
        </div>
      </div>
    </div>
  );
}
