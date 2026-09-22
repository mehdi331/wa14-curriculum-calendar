// Types & modes creators for the City system -- the editable taxonomies used
// by spaces, tasks and deadlines. Mirrors the WA SessionTypes/WorkModes panels.
import React, { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { inputStyle, btnPrimary } from './cityForm.jsx';

const linkBtn = { background: 'none', border: 'none', color: '#D0A023', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 };

function ListEditor({ title, hint, list, onChange, emptyLabel, prefix }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3E8FA0');
  const [error, setError] = useState('');
  const add = e => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (list.some(x => x.name.toLowerCase() === n.toLowerCase())) { setError(`A ${title.toLowerCase()} named "${n}" already exists.`); return; }
    onChange([...list, { id: prefix + Date.now(), name: n, color }]);
    setName(''); setError('');
  };
  const update = (id, key, value) => onChange(list.map(x => x.id === id ? { ...x, [key]: value } : x));
  const canDelete = list.length > 1;
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{title}s</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 12 }}>{hint}</div>
      <form onSubmit={add} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 14, maxWidth: 560 }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>New {title.toLowerCase()} name</div><input className={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder={title === 'Type' ? 'e.g. Observation visit' : 'e.g. In person'} /></div>
        <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Colour</div><input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 42, height: 35 }} /></div>
        <button type="submit" className={btnPrimary + ' h-[35px]'}><Plus size={14} /> Add</button>
      </form>
      {error && <div style={{ color: '#D0A023', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
        {list.length === 0 && <div style={{ fontSize: 12.5, color: '#9DB09D' }}>{emptyLabel}</div>}
        {list.map(x => (
          <div key={x.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: x.color, flexShrink: 0 }} />
            <input className={inputStyle} value={x.name} onChange={e => update(x.id, 'name', e.target.value)} />
            <input type="color" value={x.color} onChange={e => update(x.id, 'color', e.target.value)} style={{ width: 42, height: 35 }} />
            <button type="button" onClick={() => canDelete && onChange(list.filter(item => item.id !== x.id))} disabled={!canDelete} style={{ ...linkBtn, opacity: canDelete ? 1 : 0.4, cursor: canDelete ? 'pointer' : 'not-allowed' }} title={canDelete ? 'Delete' : 'Keep at least one'}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CityTypesModes({ types, setTypes, modes, setModes }) {
  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Types & modes</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 18 }}>
        Types are the colour-coded categories on the calendar and the rows of the Spaces report. Modes are the delivery format and the report's breakdown columns. Both lists apply to spaces, tasks and deadlines.
      </div>
      <ListEditor
        title="Type" prefix="ct" list={types || []} onChange={setTypes}
        hint="Space and task categories, e.g. PD Session, Learning Circle, Workshop, Clinic. Calendar boxes are coloured by type."
        emptyLabel="No types yet — add at least one so items have a category."
      />
      <ListEditor
        title="Mode" prefix="cm" list={modes || []} onChange={setModes}
        hint="Delivery format, e.g. Sync, Async, Coaching. Used as the Spaces report's breakdown columns."
        emptyLabel="No modes yet — add at least one so items have a mode."
      />
    </div>
  );
}