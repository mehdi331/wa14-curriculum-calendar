// CityFellowHome: the cohort-focused agenda. No current/upcoming-session
// cards, no attendance, no assessments -- just the Fellow's own calendar and
// the spaces/tasks/deadlines in the next 24 hours, week and month, plus the
// weekly planning nudge.
import React, { useMemo } from 'react';
import { COHORT_ROLE_LABEL } from './cohort';
import { cityUpcomingBuckets } from './cityMath';
import { typeColor } from './cityCalHelpers';

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
function kindChip(kind) {
  const map = { space: ['#3E8FA0', 'Space'], task: ['#D0A023', 'Task'], deadline: ['#D65641', 'Deadline'] };
  const [bg, label] = map[kind] || map.space;
  return <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 10, background: bg + '26', color: '#fff', fontWeight: 700 }}>{label}</span>;
}

function ItemRow({ item, types }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderBottom: '1px solid #1F4A3C', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {kindChip(item.kind || 'space')}<span>{item.name}</span>
          {item.type && <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 10, background: typeColor(item.type, types) + '26', color: '#fff', fontWeight: 700 }}>{item.type}</span>}
        </div>
        <div style={{ fontSize: 11.5, color: '#9DB09D', marginTop: 3 }}>{fmtDate(item.date)}{item.start ? ` · ${item.start}–${item.end || ''}` : ''} · {item.mode || 'Sync'}{item.fellowNotes ? ` · ${item.fellowNotes}` : ''}</div>
      </div>
    </div>
  );
}

function Bucket({ title, items, empty, types }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{title} <span style={{ fontWeight: 400, color: '#9DB09D' }}>({items.length})</span></div>
      <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden' }}>
        {items.length === 0 ? <div style={{ padding: 14, fontSize: 12.5, color: '#9DB09D' }}>{empty}</div> : items.map(item => <ItemRow key={item.id} item={item} types={types} />)}
      </div>
    </div>
  );
}

export default function CityFellowHome({ auth, items, fullItems, roster, settings, types, goCalendar }) {
  const isFellow = auth.role === 'fellow';
  const buckets = useMemo(() => cityUpcomingBuckets(items), [items]);
  const mine = isFellow ? (roster || []).find(f => String(f.id) === String(auth.fellowId) || f.email === auth.email) : null;
  return (
    <div style={{ maxWidth: 980 }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
        {isFellow ? `${COHORT_ROLE_LABEL[auth.cohortRole]} calendar · Cohort ${auth.cohort}` : `City home · ${settings?.year || new Date().getFullYear()}`}
      </div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 18 }}>
        {isFellow
          ? `Cohort ${auth.cohort} · ${mine?.afaGroup ? 'AFA group: ' + mine.afaGroup : 'AFA group not assigned'} · Calendar year ${settings?.year || ''}. Plan your week around what is coming up below.`
          : `${(fullItems || []).length} city items this year across all cohorts. Use the calendar to set the year, then check each cohort's week.`}
      </div>
      <Bucket title="Coming up in the next 24 hours" items={buckets.next24h} empty="Nothing in the next 24 hours." types={types} />
      <Bucket title="Coming up this week" items={buckets.nextWeek} empty="Nothing else this week." types={types} />
      <Bucket title="Coming up this month" items={buckets.nextMonth} empty="Nothing else on the horizon." types={types} />
      <div style={{ background: '#005B3F', borderRadius: 8, padding: '16px 18px', color: '#fff', marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Plan your calendar accordingly</div>
        <div style={{ fontSize: 12.5 }}>Look at this week's spaces, tasks and deadlines and block your time now — travel, prep and submissions included. If a clash is unavoidable, tell your AFA or Coach early.</div>
      </div>
      {isFellow && <button onClick={goCalendar} className="btn-secondary text-xs">Open my full calendar</button>}
    </div>
  );
}
