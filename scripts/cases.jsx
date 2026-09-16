// Panel render test cases (loaded through Vite so JSX is transformed).
import React from 'react';
import { __panels as P } from '../src/App.jsx';

const auth = { email: 'test@user.dev', role: 'superadmin', access: 'full' };
const rooms = [
  { id: 'r1', name: 'Room A', facilitator: 'Nusrat', locationType: 'physical' },
  { id: 'r2', name: 'Online 1', facilitator: 'Asif', locationType: 'online', meetingUrl: 'https://meet.example/x' },
];
const roster = [
  { id: 'fe1', name: 'Fellow One', email: 'f1@x.dev', track: 'Secondary', afaGroup: 'AFA 1', placementCity: 'Dhaka', roomIds: ['r1'] },
  { id: 'fe2', name: 'Fellow Two', email: 'f2@x.dev', track: 'Primary', afaGroup: '', placementCity: '', roomIds: [] },
];
const planners = [
  { id: 'p1', name: 'Nusrat Jahan', email: 'n@x.dev', role: 'afa', group: 'AFA 1', access: 'full' },
  { id: 'p2', name: 'Mehdi Hasan', email: 'm@x.dev', role: 'academy_lead', group: '', access: 'full' },
];
const legacyFacs = [
  'Old String Facilitator',
  { id: 'lf1', kind: 'room', roomId: 'r1' },
  { id: 'lf2', kind: 'afa_group', group: 'Legacy AFA 9' },
  { id: 'lf3', staffName: 'Nusrat Jahan', roomId: 'r2' },
];
const wrapSession = (facilitators) => ({
  id: 1, week: 1, date: '2026-10-25', weekday: 'Sunday', start: '23:00', end: '01:00',
  name: 'Cross-midnight session', type: 'Team Culture', pillarIds: ['ptag0'], mode: 'Sync',
  facilitators, roomIds: ['r1'], rooms: [], resources: [{ id: 'res1', label: 'Deck', url: 'https://x.dev' }],
  outcomes: ['Outcome A'], notes: 'n', fellowNotes: 'fn', afaGroup: 'AFA 1', calendared: true,
});
const sessions = [
  wrapSession(legacyFacs),
  { id: 2, week: 1, date: '2026-10-25', weekday: 'Sunday', start: '09:00', end: '10:30', name: 'Normal session', type: 'Team Culture', pillarIds: [], mode: 'Async', facilitators: [{ id: 'f9', staffName: '', roomId: '' }], roomIds: [], rooms: [], resources: [], outcomes: [], notes: '', fellowNotes: '', afaGroup: '', calendared: true },
  { id: 3, week: 2, date: '', weekday: '', start: '', end: '', name: 'Unscheduled', type: 'Coaching', pillarIds: [], mode: 'Sync', facilitators: [], roomIds: [], rooms: [], resources: [], outcomes: [], notes: '', fellowNotes: '', afaGroup: '', calendared: false },
];
const afaGroups = ['AFA 1', 'Legacy AFA 9'];
const attendanceRecs = [
  { sessionId: 1, fellowId: 'fe1', fellowName: 'Fellow One', status: 'on_time', recordedAt: '2026-10-25T09:02:00Z', method: 'button' },
  { sessionId: 1, fellowId: 'fe2', fellowName: 'Fellow Two', status: 'late', recordedAt: '2026-10-25T09:08:00Z', method: 'button' },
];
const fellowAuth = { email: 'f1@x.dev', role: 'fellow', fellowId: 'fe1', afaGroup: 'AFA 1' };

const hidden = {};
const noop = () => {};
export const cases = [
  ['CalendarView', () => <P.CalendarView sessions={sessions} activeWeek={1} setActiveWeek={noop} hiddenDays={hidden} setHiddenDays={noop} fellowWeeks={[1,2]} onFellowWeeksChange={null} onSelect={noop} onDrop={noop} onPlace={noop} auth={auth} roster={roster} rooms={rooms} sessionTypes={null} pillarTags={null} />],
  ['CalendarView-fellow', () => <P.CalendarView sessions={sessions} activeWeek={1} setActiveWeek={noop} hiddenDays={hidden} setHiddenDays={noop} fellowWeeks={[1]} onFellowWeeksChange={null} onSelect={noop} onDrop={null} onPlace={null} auth={{ ...auth, role: 'fellow' }} roster={roster} rooms={rooms} sessionTypes={null} pillarTags={null} />],
  ['CalendarView-overlap', () => <P.CalendarView sessions={[...sessions, { id: 4, week: 1, date: '2026-10-25', weekday: 'Sunday', start: '09:00', end: '10:00', name: 'Overlapping session', type: 'Team Support', pillarIds: [], mode: 'Sync', facilitators: [], roomIds: [], rooms: [], resources: [], outcomes: [], notes: '', fellowNotes: '', afaGroup: '', calendared: true }]} activeWeek={1} setActiveWeek={noop} hiddenDays={hidden} setHiddenDays={noop} fellowWeeks={[1,2]} onFellowWeeksChange={null} onSelect={noop} onDrop={noop} onPlace={noop} auth={auth} roster={roster} rooms={rooms} sessionTypes={null} pillarTags={null} />],
  ['PlacementPanel', () => <P.PlacementPanel sessions={sessions} initial={{ session: sessions[2], date: '2026-10-26', start: '09:00' }} onSave={noop} onClose={noop} />],
  ['SessionsTable', () => <P.SessionsTable sessions={sessions} search="" setSearch={noop} weekFilter="all" setWeekFilter={noop} onEdit={noop} onDelete={noop} onDuplicate={noop} rooms={rooms} onAssignRoom={noop} sessionTypes={null} pillarTags={null} />],
  ['SessionsTable-search', () => <P.SessionsTable sessions={sessions} search="nusrat" setSearch={noop} weekFilter="all" setWeekFilter={noop} onEdit={noop} onDelete={noop} onDuplicate={noop} rooms={rooms} onAssignRoom={noop} sessionTypes={null} pillarTags={null} />],
  ['AssignmentPanel', () => <P.AssignmentPanel session={sessions[0]} rooms={rooms} onSave={noop} onClose={noop} />],
  ['RoomsPanel', () => <P.RoomsPanel rooms={rooms} roster={roster} onChange={noop} showToast={noop} />],
  ['PillarsPanel', () => <P.PillarsPanel pillarTags={null} onChange={noop} showToast={noop} />],
  ['SessionTypesPanel', () => <P.SessionTypesPanel sessionTypes={null} onChange={noop} showToast={noop} />],
  ['WorkModesPanel', () => <P.WorkModesPanel modes={null} onChange={noop} showToast={noop} />],
  ['TimeSummary', () => <P.TimeSummary sessions={sessions} modes={null} />],
  ['ExpandedAnalyticsPanel', () => <P.ExpandedAnalyticsPanel sessions={sessions} attendance={[]} attempts={[]} assessments={[]} roster={roster} afaGroups={afaGroups} onSeedDemo={noop} onDeleteDemo={noop} />],
  ['FellowAttendanceBreakdown', () => <P.FellowAttendanceBreakdown sessions={sessions} attendance={[{ id: 'a1', sessionId: 1, fellowId: 'fe1', status: 'on_time', recordedAt: '2026-10-25T09:05:00.000Z' }, { id: 'a2', sessionId: 1, fellowId: 'fe2', status: 'late', recordedAt: '2026-10-25T09:20:00.000Z' }]} fellows={roster} roster={roster} />],
  ['ExpandedAnalyticsPanel-attendance', () => <P.ExpandedAnalyticsPanel sessions={sessions} attendance={[{ id: 'a1', sessionId: 1, fellowId: 'fe1', status: 'on_time', recordedAt: '2026-10-25T09:05:00.000Z' }, { id: 'a2', sessionId: 1, fellowId: 'fe2', status: 'late', recordedAt: '2026-10-25T09:20:00.000Z' }, { id: 'a3', sessionId: 2, fellowId: 'fe1', status: 'on_time', recordedAt: '2026-10-25T10:05:00.000Z' }]} attempts={[]} assessments={[]} roster={roster} afaGroups={afaGroups} onSeedDemo={noop} onDeleteDemo={noop} />],
  ['ParagraphReviewPanel', () => <P.ParagraphReviewPanel attempts={[]} assessments={[]} roster={roster} sessions={sessions} auth={auth} onAttemptsChange={noop} />],
  ['ViewPanel', () => <P.ViewPanel session={sessions[0]} auth={auth} rooms={rooms} sessionTypes={null} pillarTags={null} modes={null} onAssign={noop} onRequestUpdate={noop} onClose={noop} />],
  ['RosterPanel', () => <P.RosterPanel roster={roster} staff={planners} cityCodes={[{ id:'c1', city:'Dhaka', code:'DH' }]} onChange={noop} onAccount={noop} showToast={noop} />],
  ['PlannerPanel', () => <P.PlannerPanel planners={planners} roles={null} onChange={noop} onAccount={noop} showToast={noop} />],
  ['RolesPanel', () => <P.RolesPanel roles={null} cityCodes={[{ id:'c1', city:'Dhaka', code:'DH' }]} onRolesChange={noop} onCityCodesChange={noop} showToast={noop} />],
  ['RequestsPanel', () => <P.RequestsPanel requests={[{ id: 1, resolved: false, text: 'Move session' }]} roles={null} onResolve={noop} onDelete={noop} />],
  ['LocalAssessmentsPanel', () => <P.LocalAssessmentsPanel assessments={[]} sessions={sessions} roster={roster} rooms={rooms} onAssessmentsChange={noop} showToast={noop} />],
  ['EditPanel-new', () => <P.EditPanel session={{ id: '', week: 1, date: '2026-10-25', start: '23:00', end: '01:00', name: '', type: 'Team Culture', pillarIds: [], mode: 'Sync', facilitators: [], roomIds: [], resources: [], outcomes: [], notes: '', fellowNotes: '', afaGroup: '', attendanceCode: '', calendared: false }} onSave={noop} onDelete={null} onClose={noop} canEditSchedule sessionTypes={null} pillarTags={null} modes={null} rooms={rooms} staff={planners} />],
  ['EditPanel-legacy', () => <P.EditPanel session={sessions[0]} onSave={noop} onDelete={noop} onClose={noop} canEditSchedule sessionTypes={null} pillarTags={null} modes={null} rooms={rooms} staff={planners} />],
  ['EditPanel-nostaff', () => <P.EditPanel session={sessions[0]} onSave={noop} onDelete={null} onClose={noop} canEditSchedule sessionTypes={null} pillarTags={null} modes={null} rooms={rooms} staff={[]} />],
  ['EditPanel-readonly', () => <P.EditPanel session={sessions[0]} onSave={noop} onDelete={null} onClose={noop} canEditSchedule={false} sessionTypes={null} pillarTags={null} modes={null} rooms={rooms} staff={planners} />],
  ['Sidebar', () => <P.Sidebar tab="calendar" setTab={noop} isAdmin isFullAdmin isSuperadmin openRequests={2} />],
  ['StaffCalendar', () => <P.StaffCalendar staffTasks={[{ id: 'st1', kind: 'staff-task', name: 'Prep slides', date: '2026-10-25', weekday: 'Sunday', start: '09:00', end: '10:00', week: 1, notes: '', owner: 'Mehdi', status: 'todo' }]} sessions={sessions} weeks={[0,1,2]} startDate="2026-10-25" activeWeek={1} setActiveWeek={noop} hiddenDays={hidden} setHiddenDays={noop} isFullAdmin onSelect={noop} onEditStaff={noop} onAddStaff={noop} />],
  ['StaffTaskEditor-new', () => <P.StaffTaskEditor task={null} isFullAdmin onSave={noop} onDelete={null} onClose={noop} />],
  ['StaffTaskEditor-edit', () => <P.StaffTaskEditor task={{ id: 'st1', kind: 'staff-task', name: 'Prep slides', date: '2026-10-25', weekday: 'Sunday', start: '09:00', end: '10:00', week: 1, notes: 'some notes', owner: 'Mehdi', status: 'todo' }} isFullAdmin onSave={noop} onDelete={noop} onClose={noop} />],
  ['TopBar', () => <P.TopBar tab="calendar" isFullAdmin auth={auth} onLogout={noop} onExport={noop} onImport={noop} onReset={noop} onAdd={noop} />],
  ['FilterBar', () => <P.FilterBar typeFilter="all" setTypeFilter={noop} pillarTagFilter="all" setPillarTagFilter={noop} modeFilter="all" setModeFilter={noop} sessionTypes={null} pillarTags={null} modes={null} />],
  ['MyAttendancePanel', () => <P.MyAttendancePanel sessions={sessions} attendance={attendanceRecs} auth={fellowAuth} />],
  ['AttendanceRecordsPanel', () => <P.AttendanceRecordsPanel sessions={sessions} attendance={attendanceRecs} roster={roster} onExport={noop} />],
  ['FellowOverview', () => <P.FellowOverview sessions={sessions} auth={fellowAuth} rooms={rooms} attendance={attendanceRecs} onCheckIn={noop} />],
  ['FellowAnalyticsPanel', () => <P.FellowAnalyticsPanel sessions={sessions} attendance={attendanceRecs} auth={fellowAuth} assessments={assessments} attempts={attempts} roster={roster} />],
  ['AcademyOverviewPanel', () => <P.AcademyOverviewPanel overview={{ academyName: 'Winter Academy 14', theme: 'Foundations', vision: 'Every child receives an excellent education.', goals: ['Goal one', 'Goal two'], outcomes: ['Outcome one'], pillars: ['Pillar A', 'Pillar B'] }} onChange={noop} canEdit={false} />],
  ['AcademyOverviewPanel-edit', () => <P.AcademyOverviewPanel overview={null} onChange={noop} canEdit />],
  ['HistoricalAcademiesPanel-empty', () => <P.HistoricalAcademiesPanel current={{ academyName: 'Winter Academy 14', sessions: [], attendance: [], assessments: [], questions: [], attempts: [], rooms: [], staff: [], roster: [] }} onImportSessions={noop} showToast={noop} />],
  ['ReuseSessionsModal', () => <P.ReuseSessionsModal archive={{ academyName: 'Winter Academy 13', sessions: [{ id: 1, name: 'Old session', week: 1, date: '2025-11-02', start: '09:00', end: '10:30', facilitators: [{ staffName: 'Nusrat' }], resources: [{ id: 'r1', label: 'Deck', url: 'https://x.dev' }] }] }} onClose={noop} onImport={noop} />],
  ['IncidentLogPanel', () => <P.IncidentLogPanel incidents={[{ id:'i1', createdAt:new Date().toISOString(), fellowId:'fe1', assessmentId:'a1', type:'tab_hidden', deviceId:'dev-abc', details:'Tab hidden' }]} attempts={attempts} assessments={assessments} roster={roster} sessions={sessions} />],
  ['DeviceRequestPanel', () => <P.DeviceRequestPanel requests={[{ id:'dev1', attemptId:'at1', assessmentId:'a1', fellowId:'fe1', oldDeviceId:'dev-old', newDeviceId:'dev-new', status:'pending', requestedAt:new Date().toISOString() }]} attempts={attempts} assessments={assessments} roster={roster} onResolve={noop} />],
  ['SessionAssessmentBreakdown', () => <P.SessionAssessmentBreakdown sessions={sessions} assessments={assessments} attempts={attempts} roster={roster} fellows={roster} />],
  ['ParagraphReviewPanel-pending', () => <P.ParagraphReviewPanel attempts={attempts} assessments={assessments} roster={roster} sessions={sessions} auth={auth} onAttemptsChange={noop} showToast={noop} />],
  ['ParagraphReviewPanel-reviewed-hidden', () => <P.ParagraphReviewPanel attempts={reviewedAttempts} assessments={assessments} roster={roster} sessions={sessions} auth={auth} onAttemptsChange={noop} showToast={noop} />],
  ['ParagraphReviewPanel-reviewed-all', () => <P.ParagraphReviewPanel attempts={reviewedAttempts} assessments={assessments} roster={roster} sessions={sessions} auth={auth} onAttemptsChange={noop} showToast={noop} />],
];

const reviewAssessment = { id: 'a1', title: 'Exit Ticket', sessionId: 1, status: 'published', assignmentGroups: [{ id: 'g1', fellowIds: ['fe1'] }], questions: [
  { id: 'q1', type: 'paragraph', text: 'Explain your approach', points: 4 },
  { id: 'q2', type: 'single', text: 'Pick one', points: 2, options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correct: ['a'] },
] };
const assessments = [reviewAssessment];
const attempts = [
  { id: 'at1', assessmentId: 'a1', fellowId: 'fe1', sessionId: 1, questionOrder: ['q1', 'q2'], answers: { q1: 'My paragraph answer', q2: 'a' }, status: 'submitted', submittedAt: '2026-10-25T10:00:00Z', reviews: {} },
];
const reviewedAttempts = [
  { ...attempts[0], reviews: { q1: { status: 'reviewed', score: 3, answer: 'My paragraph answer', questionId: 'q1' } } },
];


