// Spaces report: PD space totals broken down by the editable TYPE list (rows)
// and MODE list (columns), per cohort, per month and over the year.
import React, { useMemo, useState } from 'react';
import { citySpaceCounts } from './cityMath';
import { SummaryCards, TypeModeTable, TypeMonthTable } from './cityReportParts.jsx';

const emptyCell = () => ({ pd: 0, byType: {}, byMode: {} });

export default function CitySpacesReport({ items, roster, settings, types, modes }) {
  const year = Number(settings?.year) || 2026;
  const [cohort, setCohort] = useState('all');
  const counts = useMemo(() => citySpaceCounts(items, { types, modes }), [items, types, modes]);
  const list = counts.cohorts.length ? counts.cohorts : [String(year), String(year - 1)];
  const fellows = (roster || []).filter(f => cohort === 'all' || String(f.cohort) === String(cohort));
  const shown = cohort === 'all' ? list : [String(cohort)];
  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Spaces report · {year}</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 16 }}>
        PD spaces counts every programming space. The cross-tab breaks them down by type (rows) and mode (columns); the month table shows the same by month. Rows follow the Types &amp; modes lists.
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="field-select" value={cohort} onChange={e => setCohort(e.target.value)}>
          <option value="all">All cohorts</option>
          {list.map(c => <option key={c} value={c}>Cohort {c} (Year {c === String(year) ? 1 : 2})</option>)}
        </select>
        <span style={{ fontSize: 12.5, color: '#9DB09D' }}>{fellows.length} Fellows in scope</span>
      </div>
      {shown.map(c => {
        const cell = counts.counts[c] || { months: Array.from({ length: 12 }, emptyCell), ytd: emptyCell(), matrix: {} };
        return (
          <div key={c}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Cohort {c} · Year {c === String(year) ? 1 : 2}</div>
            <SummaryCards cell={cell.ytd || emptyCell()} types={types || []} modes={modes || []} />
            <TypeModeTable cell={cell} types={(types || []).map(t => t.name)} modes={(modes || []).map(m => m.name)} />
            <TypeMonthTable cell={cell} types={(types || []).map(t => t.name)} />
          </div>
        );
      })}
    </div>
  );
}
