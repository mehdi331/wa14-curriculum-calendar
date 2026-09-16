const OVERVIEW_DEFAULTS = { academyName: 'Winter Academy 14', theme: '', vision: '', goals: [], outcomes: [], pillars: [] };

function AcademyOverviewPanel({ overview, onChange, canEdit }) {
  const data = { ...OVERVIEW_DEFAULTS, ...(overview || {}) };
  const [form, setForm] = useState(null);
  const startEdit = () => setForm({ academyName: data.academyName || '', theme: data.theme || '', vision: data.vision || '', goals: (data.goals || []).join('\n'), outcomes: (data.outcomes || []).join('\n'), pillars: (data.pillars || []).join('\n') });
  const save = () => {
    onChange({ ...data, academyName: form.academyName.trim() || data.academyName, theme: form.theme.trim(), vision: form.vision.trim(), goals: form.goals.split('\n').map(x => x.trim()).filter(Boolean), outcomes: form.outcomes.split('\n').map(x => x.trim()).filter(Boolean), pillars: form.pillars.split('\n').map(x => x.trim()).filter(Boolean) });
    setForm(null);
  };
  const numbered = list => (list || []).map((item, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}><span style={{ color: '#D65641', fontWeight: 700 }}>{i + 1}.</span><span>{item}</span></div>);
  const section = (title, body) => <><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{title}</div><div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, padding: 14, marginBottom: 16 }}>{body}</div></>;
  if (form) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Edit academy overview</div>
        <Field label="Academy name"><input className={inputStyle} value={form.academyName} onChange={e => setForm({ ...form, academyName: e.target.value })} /></Field>
        <Field label="Theme"><input className={inputStyle} value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} placeholder="e.g. Foundations of equitable teaching" /></Field>
        <Field label="Vision"><textarea rows={3} className={inputStyle + ' resize-y'} value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} /></Field>
        <Field label="Goals (one per line)"><textarea rows={4} className={inputStyle + ' resize-y'} value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} /></Field>
        <Field label="Academy outcomes (one per line - different from session outcomes)"><textarea rows={4} className={inputStyle + ' resize-y'} value={form.outcomes} onChange={e => setForm({ ...form, outcomes: e.target.value })} /></Field>
        <Field label="Pillars (one per line)"><textarea rows={3} className={inputStyle + ' resize-y'} value={form.pillars} onChange={e => setForm({ ...form, pillars: e.target.value })} /></Field>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} className={btnPrimary}>Save overview</button>
          <button onClick={() => setForm(null)} className={btnSecondary}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{data.academyName}</div>
        {data.theme ? <div style={{ fontSize: 14, color: '#D5E0D5', marginTop: 4, fontStyle: 'italic' }}>{data.theme}</div> : null}
        {canEdit && <button onClick={startEdit} className={btnSecondary + ' mt-3'}><Edit size={14} /> Edit overview</button>}
      </div>
      {data.vision ? section('Vision', <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{data.vision}</div>) : null}
      {(data.goals || []).length > 0 ? section('Goals', numbered(data.goals)) : null}
      {(data.outcomes || []).length > 0 ? section('Academy outcomes', numbered(data.outcomes)) : null}
      {(data.pillars || []).length > 0 ? <><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Pillars</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>{data.pillars.map((p, i) => <span key={i} style={{ fontSize: 12.5, padding: '5px 12px', borderRadius: 12, background: '#1F4A3C', border: '1px solid #2A5C4B', fontWeight: 600 }}>{p}</span>)}</div></> : null}
      {!data.vision && !(data.goals || []).length && !(data.pillars || []).length && <div style={{ fontSize: 12.5, color: '#9DB09D' }}>No academy overview yet{canEdit ? ' - click Edit overview to add the vision, goals, and pillars.' : '.'}</div>}
    </div>
  );
}

function HistoricalAcademiesPanel({ current, onImportSessions, showToast }) {
  const [archives, setArchives] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState('sessions');
  const [reuseOpen, setReuseOpen] = useState(false);
  useEffect(() => {
    (async () => {
      try { const r = await storage.get(ACADEMY_KEYS.historicalAcademies); const list = r && r.value ? JSON.parse(r.value) : []; setArchives(list); if (list.length) setSelectedId(prev => prev || list[list.length - 1].id); }
      catch (e) { setArchives([]); }
    })();
  }, []);
  const archive = (archives || []).find(a => a.id === selectedId) || null;
  const archiveNow = async () => {
    if (!window.confirm('Archive "' + (current.academyName || 'this academy') + '" now? A read-only snapshot (sessions with facilitators and resources, calendar, attendance, assessments) will be kept under Historical Academies.')) return;
    const rec = { id: 'arch' + Date.now(), archivedAt: new Date().toISOString(), ...current };
    try {
      const r = await storage.get(ACADEMY_KEYS.historicalAcademies);
      const list = r && r.value ? JSON.parse(r.value) : [];
      const next = [...list, rec];
      await storage.set(ACADEMY_KEYS.historicalAcademies, JSON.stringify(next));
      setArchives(next); setSelectedId(rec.id); setView('sessions');
      showToast('Academy archived');
    } catch (e) { showToast('Archive failed: ' + (e.code || e.message)); }
  };
  const facLabel = s => {
    const label = fmtFacilitators(s.facilitators, (archive && archive.rooms) || [], (archive && archive.staff) || []);
    if (label) return label;
    return (s.facilitators || []).map(f => (typeof f === 'string' ? f : f.staffName)).filter(Boolean).join(', ') || '--';
  };
  const resLabel = s => ((s.resources || []).map(r => r.label || r.url).filter(Boolean).join(', ')) || '--';
  const sortedSessions = archive ? (archive.sessions || []).slice().sort((a, b) => (a.week == null ? 99 : a.week) - (b.week == null ? 99 : b.week) || String(a.date || 'zzzz').localeCompare(String(b.date || 'zzzz')) || (toMin(a.start) || 9999) - (toMin(b.start) || 9999)) : [];
  const views = [['sessions', 'Sessions'], ['calendar', 'Calendar'], ['attendance', 'Attendance'], ['assessments', 'Assessments'], ['resources', 'Resources']];
  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginRight: 'auto' }}>Historical academies</div>
        <button onClick={archiveNow} className={btnPrimary}><CopyIcon size={14} /> Archive current academy</button>
      </div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 14 }}>Snapshots of past Winter Academies: session lists with facilitators and resources, calendars, attendance, and assessment data.</div>
      {archives === null ? <div style={{ fontSize: 12.5, color: '#9DB09D' }}>Loading archives...</div>
        : archives.length === 0 ? <div style={{ fontSize: 12.5, color: '#9DB09D' }}>No archived academies yet. Use Archive current academy when an academy ends to keep its data for future reference.</div>
        : <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={selectStyle} style={{ minWidth: 260 }} aria-label="Choose archive">
              {archives.map(a => <option key={a.id} value={a.id}>{a.academyName || 'Unnamed academy'} - archived {a.archivedAt ? new Date(a.archivedAt).toLocaleDateString() : '--'}</option>)}
            </select>
            {views.map(([id, label]) => <button key={id} onClick={() => setView(id)} className={view === id ? btnPrimary : btnSecondary}>{label}</button>)}
          </div>
          {archive && view === 'sessions' && (
            <>
              <div style={{ marginBottom: 10 }}><button onClick={() => setReuseOpen(true)} className={btnPrimary}><CopyIcon size={14} /> Reuse sessions from this academy</button></div>
              <div className="wa14-table-scroll"><table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 12.5, background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr style={{ background: '#00402E', textAlign: 'left' }}>{['Week', 'Date', 'Time', 'Session', 'Facilitators', 'Resources'].map(h => <th key={h} style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {sortedSessions.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1F4A3C' }}>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontWeight: 600 }}>{s.week != null ? 'Week ' + String(s.week).padStart(2, '0') : '--'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{s.date ? dateLabel(s.date) : '--'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{s.start ? s.start + ' - ' + (s.end || '') : '--'}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{s.name || '(untitled)'}</td>
                      <td style={{ padding: '8px 12px' }}>{facLabel(s)}</td>
                      <td style={{ padding: '8px 12px' }}>{resLabel(s)}</td>
                    </tr>
                  ))}
                  {!sortedSessions.length && <tr><td colSpan={6} style={{ padding: 12, color: '#9DB09D' }}>No sessions in this archive.</td></tr>}
                </tbody>
              </table></div>
            </>
          )}
          {archive && view === 'calendar' && (() => {
            const weekMap = new Map();
            sortedSessions.filter(s => s.calendared !== false && s.date).forEach(s => { const w = s.week != null ? s.week : '?'; if (!weekMap.has(w)) weekMap.set(w, []); weekMap.get(w).push(s); });
            const weekKeys = [...weekMap.keys()].sort((a, b) => a - b);
            return weekKeys.length ? weekKeys.map(w => (
              <div key={w} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Week {String(w).padStart(2, '0')}</div>
                <div style={{ background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden' }}>
                  {weekMap.get(w).map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 14px', borderBottom: '1px solid #1F4A3C', flexWrap: 'wrap' }}>
                      <div><b style={{ fontSize: 12.5 }}>{s.name}</b><div style={{ fontSize: 11.5, color: '#9DB09D', marginTop: 2 }}>{s.date ? dateLabel(s.date) : ''}{s.weekday ? ' - ' + s.weekday : ''} - {s.start}-{s.end}</div></div>
                      <div style={{ fontSize: 11.5, color: '#9DB09D' }}>{facLabel(s)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <div style={{ fontSize: 12.5, color: '#9DB09D' }}>No calendared sessions in this archive.</div>;
          })()}
          {archive && view === 'attendance' && (() => {
            const att = archive.attendance || [];
            const bySession = new Map();
            att.forEach(e => { const k = String(e.sessionId); if (!bySession.has(k)) bySession.set(k, { onTime: 0, late: 0 }); const row = bySession.get(k); if (e.status === 'late') row.late++; else row.onTime++; });
            const byFellow = new Map();
            att.forEach(e => { const k = String(e.fellowId); if (!byFellow.has(k)) byFellow.set(k, { name: e.fellowName || friendlyFellowName({ fellowId: e.fellowId }, archive.roster || []), total: 0, onTime: 0, late: 0 }); const row = byFellow.get(k); row.total++; if (e.status === 'late') row.late++; else row.onTime++; });
            const exportAtt = () => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(att.map(e => { const s = (archive.sessions || []).find(x => String(x.id) === String(e.sessionId)); return { Session: s ? s.name : e.sessionId, Date: s ? s.date : '', Fellow: e.fellowName || e.fellowId, Status: e.status, RecordedAt: e.recordedAt || '' }; })), 'Attendance'); XLSX.writeFile(wb, ((archive.academyName || 'academy').replace(/\s+/g, '_')) + '_Attendance.xlsx'); };
            return <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
                <Metric label="Records" value={att.length} /><Metric label="On time" value={att.filter(e => e.status === 'on_time').length} /><Metric label="Late" value={att.filter(e => e.status === 'late').length} /><Metric label="Fellows recorded" value={byFellow.size} />
                <button onClick={exportAtt} className={btnSecondary}><Download size={14} /> Export attendance (XLSX)</button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>By session</div>
              <div className="wa14-table-scroll"><table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 12.5, background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <thead><tr style={{ background: '#00402E', textAlign: 'left' }}>{['Date', 'Session', 'On time', 'Late'].map(h => <th key={h} style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{h}</th>)}</tr></thead>
                <tbody>{sortedSessions.filter(s => bySession.has(String(s.id))).map(s => { const row = bySession.get(String(s.id)); return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1F4A3C' }}>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{s.date ? dateLabel(s.date) : '--'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '8px 12px', color: '#2D7A4F', fontWeight: 700 }}>{row.onTime}</td>
                    <td style={{ padding: '8px 12px', color: '#D0A023', fontWeight: 700 }}>{row.late}</td>
                  </tr>); })}{bySession.size === 0 && <tr><td colSpan={4} style={{ padding: 12, color: '#9DB09D' }}>No attendance records in this archive.</td></tr>}</tbody>
              </table></div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>By fellow</div>
              <div className="wa14-table-scroll"><table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 12.5, background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr style={{ background: '#00402E', textAlign: 'left' }}>{['Fellow', 'Records', 'On time', 'Late'].map(h => <th key={h} style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{h}</th>)}</tr></thead>
                <tbody>{[...byFellow.values()].sort((a, b) => String(a.name).localeCompare(String(b.name))).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1F4A3C' }}>
                    <td style={{ padding: '8px 12px' }}>{row.name}</td>
                    <td style={{ padding: '8px 12px' }}>{row.total}</td>
                    <td style={{ padding: '8px 12px', color: '#2D7A4F', fontWeight: 700 }}>{row.onTime}</td>
                    <td style={{ padding: '8px 12px', color: '#D0A023', fontWeight: 700 }}>{row.late}</td>
                  </tr>))}{byFellow.size === 0 && <tr><td colSpan={4} style={{ padding: 12, color: '#9DB09D' }}>No attendance records in this archive.</td></tr>}</tbody>
              </table></div>
            </>;
          })()}
          {archive && view === 'assessments' && (() => {
            const list = archive.assessments || [];
            const atts = archive.assessmentAttempts || [];
            return <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <Metric label="Assessments" value={list.length} /><Metric label="Questions" value={(archive.assessmentQuestions || []).length} /><Metric label="Attempts" value={atts.length} /><Metric label="Submitted" value={atts.filter(a => a.status === 'submitted').length} />
              </div>
              <div className="wa14-table-scroll"><table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 12.5, background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr style={{ background: '#00402E', textAlign: 'left' }}>{['Assessment', 'Questions', 'Attempts', 'Submitted', 'Avg score'].map(h => <th key={h} style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{h}</th>)}</tr></thead>
                <tbody>{list.map(a => {
                  const rel = isGradeReleased(a);
                  const mine = atts.filter(x => String(x.assessmentId) === String(a.id));
                  const graded = mine.filter(x => x.status === 'submitted' && rel);
                  const pcts = graded.map(x => { const s = computeAttemptScore(x, a); return s.total ? s.earned / s.total * 100 : null; }).filter(v => v != null);
                  const avg = pcts.length ? Math.round(pcts.reduce((sum, v) => sum + v, 0) / pcts.length) : null;
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #1F4A3C' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{a.title || a.id}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{(a.questions || []).length || (a.questionIds || []).length}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{mine.length}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{mine.filter(x => x.status === 'submitted').length}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700 }}>{avg != null ? avg + '%' : '--'}</td>
                    </tr>);
                })}{!list.length && <tr><td colSpan={5} style={{ padding: 12, color: '#9DB09D' }}>No assessments in this archive.</td></tr>}</tbody>
              </table></div>
            </>;
          })()}
          {archive && view === 'resources' && (() => {
            const rows = [];
            (archive.sessions || []).forEach(s => (s.resources || []).forEach(r => rows.push({ session: s.name, label: r.label || '', url: r.url || '' })));
            const withRes = (archive.sessions || []).filter(s => (s.resources || []).length).length;
            return <>
              <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 10 }}>{rows.length} resource{rows.length === 1 ? '' : 's'} across {withRes} session{withRes === 1 ? '' : 's'}.</div>
              <div className="wa14-table-scroll"><table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 12.5, background: '#003223', border: '1px solid #2A5C4B', borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr style={{ background: '#00402E', textAlign: 'left' }}>{['Session', 'Resource', 'Link'].map(h => <th key={h} style={{ padding: '9px 12px', color: '#D5E0D5', borderBottom: '1px solid #2A5C4B' }}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1F4A3C' }}>
                    <td style={{ padding: '8px 12px' }}>{r.session}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{r.label || '--'}</td>
                    <td style={{ padding: '8px 12px' }}>{r.url ? <a href={r.url} target="_blank" rel="noreferrer" style={{ color: '#5FA97E' }}>{r.url.length > 48 ? r.url.slice(0, 48) + '...' : r.url}</a> : '--'}</td>
                  </tr>))}{!rows.length && <tr><td colSpan={3} style={{ padding: 12, color: '#9DB09D' }}>No resources in this archive.</td></tr>}</tbody>
              </table></div>
            </>;
          })()}
          {reuseOpen && archive && <ReuseSessionsModal archive={archive} onClose={() => setReuseOpen(false)} onImport={onImportSessions} />}
        </>}
    </div>
  );
}

function ReuseSessionsModal({ archive, onClose, onImport }) {
  const [selected, setSelected] = useState([]);
  const [keepFacilitators, setKeepFacilitators] = useState(true);
  const [keepResources, setKeepResources] = useState(true);
  const [keepDates, setKeepDates] = useState(false);
  const toggle = id => setSelected(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const doImport = () => {
    const stamp = Date.now();
    const imported = (archive.sessions || []).filter(s => selected.includes(String(s.id))).map((s, i) => ({
      ...s,
      id: 'reuse' + stamp + i,
      date: keepDates ? (s.date || '') : '',
      weekday: keepDates ? (s.weekday || '') : '',
      calendared: keepDates ? Boolean(s.date) : false,
      facilitators: keepFacilitators ? (s.facilitators || []) : [],
      resources: keepResources ? (s.resources || []) : [],
    }));
    onImport(imported);
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,39,51,.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: '94vw', background: '#003223', height: '100%', overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}><div style={{ fontWeight: 700 }}>Reuse sessions</div><button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button></div>
        <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 12 }}>Select sessions from {archive.academyName || 'this archive'} to copy into the current academy.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, fontSize: 12.5 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={keepFacilitators} onChange={e => setKeepFacilitators(e.target.checked)} /> Preserve facilitators</label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={keepResources} onChange={e => setKeepResources(e.target.checked)} /> Preserve resources</label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={keepDates} onChange={e => setKeepDates(e.target.checked)} /> Keep original dates (otherwise imported unscheduled)</label>
        </div>
        {(archive.sessions || []).map(s => (
          <label key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #1F4A3C', fontSize: 12.5 }}>
            <input type="checkbox" checked={selected.includes(String(s.id))} onChange={() => toggle(String(s.id))} style={{ marginTop: 2 }} />
            <span><b>{s.name || '(untitled)'}</b><br /><span style={{ fontSize: 11.5, color: '#9DB09D' }}>Week {s.week != null ? String(s.week).padStart(2, '0') : '--'}{s.date ? ' - ' + dateLabel(s.date) : ''} - {(s.facilitators || []).length} facilitator{(s.facilitators || []).length === 1 ? '' : 's'} - {(s.resources || []).length} resource{(s.resources || []).length === 1 ? '' : 's'}</span></span>
          </label>
        ))}
        {!(archive.sessions || []).length && <div style={{ fontSize: 12.5, color: '#9DB09D' }}>No sessions in this archive.</div>}
        <button disabled={!selected.length} onClick={doImport} className={btnPrimary + ' w-full justify-center mt-5'} style={{ opacity: selected.length ? 1 : 0.5 }}>Import {selected.length || ''} session{selected.length === 1 ? '' : 's'}</button>
        <div style={{ fontSize: 11.5, color: '#9DB09D', marginTop: 8 }}>Imported sessions appear in the Sessions tab. Without dates, place them on the calendar by dragging.</div>
      </div>
    </div>
  );
}
