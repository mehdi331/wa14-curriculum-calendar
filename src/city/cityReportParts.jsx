// Spaces report part 1: summary cards + type×mode cross-tab + type×month
// table for one cohort. Rows follow the editable TYPE list; mode columns
// follow the editable MODE list; anything outside the lists is appended so
// legacy data is never lost.
import React from 'react';
import { MONTHS, typeColor, modeColor } from './cityCalHelpers';

const card = { background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: '14px 16px' };
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SummaryCards({ cell, types, modes }) {
  const typeNames = types.map(t => t.name);
  const modeNames = modes.map(m => m.name);
  const cards = [['PD spaces (all)', cell.pd || 0, '#3E8FA0']];
  typeNames.forEach(t => cards.push([t, (cell.byType || {})[t] || 0, typeColor(t, types)]));
  Object.keys(cell.byType || {}).filter(t => !typeNames.includes(t)).forEach(t => cards.push([t + ' (deleted type)', cell.byType[t], '#9DB09D']));
  modeNames.forEach(m => cards.push([m, (cell.byMode || {})[m] || 0, modeColor(m, modes)]));
  Object.keys(cell.byMode || {}).filter(m => !modeNames.includes(m)).forEach(m => cards.push([m + ' (deleted mode)', cell.byMode[m], '#9DB09D']));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
      {cards.map(([label, value, color]) => (
        <div key={label} style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</span></div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// Rows = types, columns = modes + Total (year-to-date cross-tab).
export function TypeModeTable({ cell, types, modes }) {
  const typeNames = [...types, ...Object.keys(cell.byType || {}).filter(t => !types.includes(t))];
  const modeNames = [...modes, ...Object.keys(cell.byMode || {}).filter(m => !modes.includes(m))];
  const rowTotal = t => modeNames.reduce((s, m) => s + (((cell.matrix || {})[t] || {})[m] || 0), 0);
  const colTotal = m => typeNames.reduce((s, t) => s + (((cell.matrix || {})[t] || {})[m] || 0), 0);
  return (
    <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflowX: 'auto', marginBottom: 22 }}>
      <div style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, background: '#00402E' }}>Spaces by type × mode (year to date)</div>
      <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead><tr style={{ background: '#00402E' }}><th style={{ padding: '9px 12px', textAlign: 'left', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>Type</th>{modeNames.map(m => <th key={m} style={{ padding: '9px 10px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{m}</th>)}<th style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>Total</th></tr></thead>
        <tbody>
          {typeNames.map(t => (
            <tr key={t} style={{ borderBottom: '1px solid #1F4A3C' }}>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: typeColor(t, types) }} />{t}</span></td>
              {modeNames.map(m => <td key={m} style={{ padding: '8px 10px', textAlign: 'center' }}>{((cell.matrix || {})[t] || {})[m] || 0}</td>)}
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{rowTotal(t)}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '1px solid #2A5C4B' }}>
            <td style={{ padding: '8px 12px', fontWeight: 700 }}>All types</td>
            {modeNames.map(m => <td key={m} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{colTotal(m)}</td>)}
            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{cell.pd || 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Rows = types, columns = months + YTD.
export function TypeMonthTable({ cell, types }) {
  const typeNames = [...types, ...Object.keys(cell.byType || {}).filter(t => !types.includes(t))];
  return (
    <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflowX: 'auto', marginBottom: 26 }}>
      <div style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, background: '#00402E' }}>Spaces by type per month</div>
      <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead><tr style={{ background: '#00402E' }}><th style={{ padding: '9px 12px', textAlign: 'left', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>Type</th>{SHORT.map(m => <th key={m} style={{ padding: '9px 10px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{m}</th>)}<th style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>YTD</th></tr></thead>
        <tbody>
          {typeNames.map(t => {
            const months = cell.months || [];
            const ytd = (cell.byType || {})[t] || 0;
            return (
              <tr key={t} style={{ borderBottom: '1px solid #1F4A3C' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: typeColor(t, types) }} />{t}</span></td>
                {months.map((mc, m) => <td key={m} title={MONTHS[m]} style={{ padding: '8px 10px', textAlign: 'center' }}>{(mc.byType || {})[t] || 0}</td>)}
                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{ytd}</td>
              </tr>
            );
          })}
          <tr style={{ borderTop: '1px solid #2A5C4B' }}>
            <td style={{ padding: '8px 12px', fontWeight: 700 }}>All types</td>
            {(cell.months || []).map((mc, m) => <td key={m} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{mc.pd || 0}</td>)}
            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{cell.pd || 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
