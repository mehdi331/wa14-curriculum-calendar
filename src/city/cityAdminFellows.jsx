// AdminPanel Fellows tab: add/edit/remove Fellows with cohort, grade,
// placement city and coach. Available to every role that can open the admin
// panel (AFA, Coach, full-access admin, superadmin). A Winter Academy AFA's
// new Fellows get the NEXT year pre-assigned as their cohort automatically.
// Bulk import (paste-a-list or Excel/CSV upload) lives in the same panel so
// an AFA can seed a roster in one go; per-row validation, duplicate skipping,
// coach auto-match by name and an inline result summary are included.
import React, { useState } from 'react';
import { Plus, Trash as Trash2, Upload, X } from '@phosphor-icons/react';
import { COHORT_ROLE_LABEL, cohortRole, defaultCohortForCreator } from './cohort';
import { FellowRow } from './cityAdminFellowRow.jsx';
import { inputStyle, btnPrimary, btnSecondary, btnGhost, coachOptions } from './cityForm.jsx';
import * as XLSX from 'xlsx';
const FELLOW_EMAIL_RE = /^[a-z]+\.[a-z]+@teachforbangladesh\.org$/i;
// Header aliases for Excel/CSV import — matched case-insensitively, trimmed.
const HEADER_ALIASES = {
  name: ['name', 'full name', 'fellow name', 'participant name', 'participant'],
  email: ['email', 'email address', 'fellow email'],
  track: ['track', 'track type'],
  grade: ['grade', 'class', 'current grade'],
  placementCity: ['placement city', 'placementcity', 'city', 'placement'],
  afaGroup: ['afa group', 'afagroup', 'afa', 'group'],
  coach: ['coach', 'coach name', 'coachname', 'mentor'],
};
// Pull a value from a parsed sheet row by trying each possible key (exact,
// then case-insensitive trimmed). Returns the trimmed string or ''.
function findValue(row, possibleKeys) {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== '' && row[key] !== null) {
      return String(row[key]).trim();
    }
  }
  const rowKeys = Object.keys(row);
  for (const key of possibleKeys) {
    const match = rowKeys.find(
      (k) => (k || '').trim().toLowerCase() === (key || '').toLowerCase()
    );
    if (match && row[match] !== undefined && row[match] !== '' && row[match] !== null) {
      return String(row[match]).trim();
    }
  }
  return '';
}
export function blankFellowForm(auth) {
  return {
    name: '',
    email: '',
    cohort: defaultCohortForCreator(auth),
    track: '',
    grade: '',
    placementCity: '',
    coachId: '',
    afaGroup: '',
  };
}
export function FellowsAdmin({ roster, setRoster, canManage, auth, planners, settings }) {
  const [form, setForm] = useState(() => blankFellowForm(auth));
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const autoCohort = defaultCohortForCreator(auth);
  const isAuto = Number(form.cohort) === autoCohort;
  // ---- Bulk import state ----
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState(null);
  const [fileError, setFileError] = useState('');
  // ---- Single add ----
  const add = (e) => {
    e.preventDefault();
    const em = form.email.trim().toLowerCase();
    if (!form.name.trim()) { setError('Enter a name.'); return; }
    if (!FELLOW_EMAIL_RE.test(em)) { setError('Email must look like firstname.lastname@teachforbangladesh.org'); return; }
    if ((roster || []).some((r) => String(r.email || '').toLowerCase() === em)) { setError('That email is already on the roster.'); return; }
    const coach = coachOptions(planners).find((p) => String(p.id) === String(form.coachId));
    setRoster([...(roster || []), {
      id: 'f' + Date.now(), name: form.name.trim(), email: em,
      cohort: Number(form.cohort) || autoCohort,
      track: form.track.trim().toLowerCase(), grade: form.grade.trim(),
      placementCity: form.placementCity.trim(), afaGroup: form.afaGroup.trim(),
      coachId: coach ? coach.id : '', coachName: coach ? coach.name : '', roomIds: [],
    }]);
    setForm(blankFellowForm(auth)); setError('');
  };
  // ---- Remove ----
  const remove = (id) => {
    if (window.confirm('Remove this Fellow?')) setRoster((roster || []).filter((r) => String(r.id) !== String(id)));
  };
  // ---- Bulk processing ----
  const processLines = (lines) => {
    let added = 0;
    const skipped = [];
    const next = [...(roster || [])];
    const seen = new Set();
    lines.forEach((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 2 || !parts[0]) {
        skipped.push({ row: idx + 1, reason: 'Need at least a name and email.' });
        return;
      }
      const [nm, em, track, grade, placementCity, afaGroup, coachName] = parts;
      if (!nm) {
        skipped.push({ row: idx + 1, reason: 'Name is empty.' });
        return;
      }
      const emLower = em.toLowerCase();
      if (!FELLOW_EMAIL_RE.test(emLower)) {
        skipped.push({ row: idx + 1, reason: 'Email not in firstname.lastname@teachforbangladesh.org format.' });
        return;
      }
      if (seen.has(emLower)) {
        skipped.push({ row: idx + 1, reason: 'Duplicate within this list.' });
        return;
      }
      if (next.some((r) => String(r.email || '').toLowerCase() === emLower)) {
        skipped.push({ row: idx + 1, reason: 'Already on the roster.' });
        return;
      }
      const coach = coachOptions(planners).find(
        (p) => (p.name || '').toLowerCase() === (coachName || '').toLowerCase()
      );
      const cohort = Number(parts[7] || '') || defaultCohortForCreator(auth);
      next.push({
        id: 'f' + Date.now() + added,
        name: nm,
        email: emLower,
        cohort,
        track: (track || '').toLowerCase(),
        grade: grade || '',
        placementCity: placementCity || '',
        afaGroup: afaGroup || '',
        coachId: coach ? coach.id : '',
        coachName: coach ? coach.name : '',
        roomIds: [],
      });
      seen.add(emLower);
      added++;
    });
    setRoster(next);
    return { added, skipped };
  };
  // ---- Paste import ----
  const importPaste = () => {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    setBulkResult(processLines(lines));
    setBulkText('');
    setFileError('');
  };
  // ---- File import (Excel / CSV) ----
  const importFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setFileError('Please choose an Excel (.xlsx/.xls) or CSV file.');
        return;
      }
      setFileError('');
      try {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows.length) {
          setFileError('No data found in file.');
          return;
        }
        const lines = rows.map((row) => {
          const nm = findValue(row, HEADER_ALIASES.name);
          const em = findValue(row, HEADER_ALIASES.email);
          const track = findValue(row, HEADER_ALIASES.track);
          const grade = findValue(row, HEADER_ALIASES.grade);
          const placementCity = findValue(row, HEADER_ALIASES.placementCity);
          const afaGroup = findValue(row, HEADER_ALIASES.afaGroup);
          const coach = findValue(row, HEADER_ALIASES.coach);
          return [nm, em, track, grade, placementCity, afaGroup, coach].join(',');
        });
        setBulkResult(processLines(lines));
      } catch (err) {
        setFileError('Could not read that file — make sure it is a valid Excel or CSV file.');
      }
    };
    input.click();
  };
  const clearBulkResult = () => {
    setBulkResult(null);
    setFileError('');
  };
  const toggleBulk = () => {
    setBulkOpen((prev) => {
      if (prev) { setBulkResult(null); setFileError(''); }
      return !prev;
    });
  };
  // Roster sorted by cohort desc, then name asc — mirrors the WA RosterPanel ordering.
  const sorted = (roster || [])
    .slice()
    .sort((a, b) =>
      Number(b.cohort || 0) - Number(a.cohort || 0) ||
      String(a.name || '').localeCompare(String(b.name || ''))
    );
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Fellows</div>
      <div style={{ fontSize: 12.5, color: '#9DB09D', marginBottom: 12 }}>
        Add every Fellow field here — the calendar each Fellow sees follows their cohort
        automatically.
        {auth?.role === 'afa' && (
          <>
            {' '}
            As a Winter Academy AFA, new Fellows start with{' '}
            <b>cohort {autoCohort}</b> (next year) pre-assigned; change it if needed.
          </>
        )}
      </div>
      {canManage && (
        <div
          style={{
            background: '#003223',
            border: '1px solid #2A5C4B',
            borderRadius: 8,
            padding: 16,
            marginBottom: 14,
            maxWidth: 640,
          }}
        >
          <form
            onSubmit={add}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}
          >
            <div style={{ flex: '1 1 170px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Name</div>
              <input
                className={inputStyle}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Fellow full name"
              />
            </div>
            <div style={{ flex: '1 1 230px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Email</div>
              <input
                className={inputStyle}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="firstname.lastname@teachforbangladesh.org"
              />
            </div>
            <div style={{ width: 92 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                Cohort {isAuto && <span style={{ color: '#D0A023' }}>· auto {autoCohort}</span>}
              </div>
              <input
                className={inputStyle}
                value={form.cohort}
                onChange={(e) => set('cohort', e.target.value)}
                placeholder={String(autoCohort)}
              />
            </div>
            <div style={{ width: 120 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Track</div>
              <select
                className={inputStyle}
                value={form.track}
                onChange={(e) => set('track', e.target.value)}
              >
                <option value="">—</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
            <div style={{ width: 74 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Grade</div>
              <input
                className={inputStyle}
                value={form.grade}
                onChange={(e) => set('grade', e.target.value)}
                placeholder="e.g. 4"
              />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Placement city</div>
              <input
                className={inputStyle}
                value={form.placementCity}
                onChange={(e) => set('placementCity', e.target.value)}
                placeholder="e.g. Dhaka"
              />
            </div>
            <div style={{ flex: '1 1 170px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Coach</div>
              <select
                className={inputStyle}
                value={form.coachId}
                onChange={(e) => set('coachId', e.target.value)}
              >
                <option value="">—</option>
                {coachOptions(planners).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.role === 'coach' ? '' : ' (staff)'}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>AFA group</div>
              <input
                className={inputStyle}
                value={form.afaGroup}
                onChange={(e) => set('afaGroup', e.target.value)}
                placeholder="e.g. AFA 1"
              />
            </div>
            <button type="submit" className={btnPrimary + ' h-[35px]'}>
              <Plus size={14} />
              {' '}Add
            </button>
          </form>
          {error && (
            <div style={{ color: '#D0A023', fontSize: 12, marginTop: 8 }}>{error}</div>
          )}
          {/* ---- Bulk import ---- */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2A5C4B' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#D5E0D5' }}>
              Bulk import
            </div>
            <button onClick={toggleBulk} className={btnGhost + ' text-[12.5px]'}>
              {bulkOpen
                ? 'Hide bulk import'
                : 'Bulk import (paste a list or upload Excel/CSV)'}
            </button>

            {bulkOpen && (
              <div style={{ marginTop: 10 }}>
                {/* Paste-a-list */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11.5, color: '#9DB09D', marginBottom: 4 }}>
                    Paste a list — one Fellow per line:
                    <br />
                    <span style={{ fontFamily: 'monospace', fontSize: 11 }}>
                      Name, Email, Track, Grade, Placement city, AFA group, Coach name
                    </span>
                  </div>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Rasheda Rahman,rasheda.rahman@teachforbangladesh.org,primary,4,Dhaka,AFA 1,Sadiq Mohammed
Mohammed Alam,mohammed.alam@teachforbangladesh.org,,5,Chittagong,,Karim Hasan"
                    rows={5}
                    className={inputStyle + ' resize-y font-mono text-xs'}
                  />
                </div>
                {/* File upload */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11.5, color: '#9DB09D', marginBottom: 4 }}>
                    Or upload an Excel (.xlsx/.xls) or CSV file — the first row is treated as
                    headers. Column names are matched loosely (e.g. "Full Name", "Email
                    Address", "Placement City").
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={importFile} className={btnSecondary + ''}>
                      <Upload size={13} />
                      {' '}Choose file
                    </button>
                    {fileError && (
                      <div style={{ color: '#D0A023', fontSize: 12 }}>{fileError}</div>
                    )}
                  </div>
                </div>
                <button onClick={importPaste} className={btnPrimary + ''}>
                  <Plus size={13} />
                  {' '}Import
                </button>
              </div>
            )}
            {/* Inline result summary */}
            {bulkResult && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  background: '#00281D',
                  border: '1px solid #2A5C4B',
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#D5E0D5',
                    marginBottom: 6,
                  }}
                >
                  Imported {bulkResult.added} Fellow{bulkResult.added !== 1 ? 's' : ''}
                  {bulkResult.skipped.length ? ` · ${bulkResult.skipped.length} skipped` : ''}
                </div>
                {bulkResult.skipped.length > 0 && (
                  <div style={{ fontSize: 12, color: '#D0A023' }}>
                    <div style={{ marginBottom: 4 }}>Skipped rows:</div>
                    {bulkResult.skipped.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '2px 0',
                          borderBottom: i < bulkResult.skipped.length - 1 ? '1px solid #2A5C4B' : 'none',
                        }}
                      >
                        <span style={{ color: '#9DB09D' }}>Row {s.row}:</span>{' '}
                        {s.reason}
                      </div>
                    ))}
                  </div>
                )}
                {bulkResult.added === 0 &&
                  bulkResult.skipped.length === 0 && (
                    <div style={{ fontSize: 12, color: '#9DB09D' }}>
                      Nothing to import — check the list above.
                    </div>
                  )}
                <button
                  onClick={clearBulkResult}
                  className={btnGhost + ' text-[12px] mt-2'}
                >
                  <X size={12} />
                  {' '}Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <FellowsTable
        roster={sorted}
        canManage={canManage}
        setRoster={setRoster}
        onRemove={remove}
        planners={planners}
      />
    </div>
  );
}
export function FellowsTable({ roster, canManage, setRoster, onRemove, planners }) {
  return (
    <div
      style={{
        background: '#003223',
        border: '1px solid #2A5C4B',
        borderRadius: 8,
        overflowX: 'auto',
        maxWidth: 860,
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: 720,
          borderCollapse: 'collapse',
          fontSize: 12.5,
        }}
      >
        <thead>
          <tr style={{ background: '#00402E', textAlign: 'left' }}>
            {['Name', 'Cohort / status', 'Grade / track', 'City', 'Coach', ''].map((h) => (
              <th
                key={h}
                style={{
                  padding: '9px 12px',
                  color: '#D5E0D5',
                  borderBottom: '1px solid #2A5C4B',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(roster || []).map((r) => (
            <FellowRow
              key={r.id}
              fellow={r}
              canManage={canManage}
              setRoster={setRoster}
              onRemove={onRemove}
              planners={planners}
            />
          ))}
          {(roster || []).length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{ padding: 18, textAlign: 'center', color: '#9DB09D' }}
              >
                No Fellows yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}