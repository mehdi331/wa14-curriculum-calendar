// City editor (facilitators + notes), same drawer pattern as part 1.
import React from 'react';
import { X, Plus } from '@phosphor-icons/react';
import { Field, inputStyle, btnGhost } from './cityForm.jsx';

export function CityFacilitators({ form, set, planners }) {
  const staffOptions = (planners || []).filter(p => (p.systems || ['city']).includes('city'));
  return (
    <Field label="Facilitators">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(form.facilitators || []).map(f => (
          <div key={f.id} style={{ display: 'flex', gap: 6 }}>
            <select className={inputStyle} value={f.staffName || ''} onChange={e => set('facilitators', form.facilitators.map(x => x.id === f.id ? { ...x, staffName: e.target.value } : x))}>
              <option value="">Facilitator…</option>
              {staffOptions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <button onClick={() => set('facilitators', form.facilitators.filter(x => x.id !== f.id))} style={{ background: 'none', border: 'none', color: '#D0A023', cursor: 'pointer' }}><X size={15} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => set('facilitators', [...(form.facilitators || []), { id: 'cf' + Date.now(), staffName: '' }])} className={btnGhost + ' mt-2 px-1 py-1.5'}><Plus size={13} /> Add facilitator</button>
    </Field>
  );
}

export function CityNotes({ form, set }) {
  return (
    <React.Fragment>
      <Field label="Fellow-visible notes"><textarea className={inputStyle + ' resize-y'} rows={3} value={form.fellowNotes} onChange={e => set('fellowNotes', e.target.value)} placeholder="What Fellows need to plan around" /></Field>
      <Field label="Internal notes"><textarea className={inputStyle + ' resize-y'} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Staff-only" /></Field>
    </React.Fragment>
  );
}
