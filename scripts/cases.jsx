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
  name: 'Cross-midnight session', pillar: 'Vision', mode: 'Sync',
  facilitators, roomIds: ['r1'], rooms: [], resources: [{ id: 'res1', label: 'Deck', url: 'https://x.dev' }],
  outcomes: ['Outcome A'], notes: 'n', fellowNotes: 'fn', afaGroup: 'AFA 1', calendared: true,
});
const sessions = [
  wrapSession(legacyFacs),
  { id: 2, week: 1, date: '2026-10-25', weekday: 'Sunday', start: '09:00', end: '10:30', name: 'Normal session', pillar: 'Vision', mode: 'Async', facilitators: [{ id: 'f9', staffName: '', roomId: '' }], roomIds: [], rooms: [], resources: [], outcomes: [], notes: '', fellowNotes: '', afaGroup: '', calendared: true },
  { id: 3, week: 2, date: '', weekday: '', start: '', end: '', name: 'Unscheduled', pillar: 'Coaching', mode: 'Sync', facilitators: [], roomIds: [], rooms: [], resources: [], outcomes: [], notes: '', fellowNotes: '', afaGroup: '', calendared: false },
];
const afaGroups = ['AFA 1', 'Legacy AFA 9'];

const hidden = {};
const noop = () => {};
export const cases = [
  ['CalendarView', () => <P.CalendarView sessions={sessions} activeWeek={1} setActiveWeek={noop} hiddenDays={hidden} setHiddenDays={noop} fellowWeeks={[1,2]} onFellowWeeksChange={null} onSelect={noop} onDrop={noop} onPlace={noop} auth={auth} roster={roster} rooms={rooms} pillars={null} />],
  ['CalendarView-fellow', () => <P.CalendarView sessions={sessions} activeWeek={1} setActiveWeek={noop} hiddenDays={hidden} setHiddenDays={noop} fellowWeeks={[1]} onFellowWeeksChange={null} onSelect={noop} onDrop={null} onPlace={null} auth={{ ...auth, role: 'fellow' }} roster={roster} rooms={rooms} pillars={null} />],
  ['PlacementPanel', () => <P.PlacementPanel sessions={sessions} initial={{ session: sessions[2], date: '2026-10-26', start: '09:00' }} onSave={noop} onClose={noop} />],
  ['SessionsTable', () => <P.SessionsTable sessions={sessions} search="" setSearch={noop} weekFilter="all" setWeekFilter={noop} onEdit={noop} onDelete={noop} rooms={rooms} onAssignRoom={noop} />],
  ['SessionsTable-search', () => <P.SessionsTable sessions={sessions} search="nusrat" setSearch={noop} weekFilter="all" setWeekFilter={noop} onEdit={noop} onDelete={noop} rooms={rooms} onAssignRoom={noop} />],
  ['AssignmentPanel', () => <P.AssignmentPanel session={sessions[0]} rooms={rooms} onSave={noop} onClose={noop} />],
  ['RoomsPanel', () => <P.RoomsPanel rooms={rooms} roster={roster} onChange={noop} showToast={noop} />],
  ['PillarsPanel', () => <P.PillarsPanel pillars={null} onChange={noop} showToast={noop} />],
  ['TimeSummary', () => <P.TimeSummary sessions={sessions} />],
  ['ExpandedAnalyticsPanel', () => <P.ExpandedAnalyticsPanel sessions={sessions} attendance={[]} attempts={[]} assessments={[]} roster={roster} afaGroups={afaGroups} onSeedDemo={noop} onDeleteDemo={noop} />],
  ['ParagraphReviewPanel', () => <P.ParagraphReviewPanel attempts={[]} assessments={[]} roster={roster} sessions={sessions} auth={auth} onAttemptsChange={noop} />],
  ['ViewPanel', () => <P.ViewPanel session={sessions[0]} auth={auth} rooms={rooms} onAssign={noop} onRequestUpdate={noop} onClose={noop} />],
  ['RosterPanel', () => <P.RosterPanel roster={roster} staff={planners} onChange={noop} onAccount={noop} showToast={noop} />],
  ['PlannerPanel', () => <P.PlannerPanel planners={planners} onChange={noop} onAccount={noop} showToast={noop} />],
  ['RequestsPanel', () => <P.RequestsPanel requests={[{ id: 1, resolved: false, text: 'Move session' }]} onResolve={noop} onDelete={noop} />],
  ['LocalAssessmentsPanel', () => <P.LocalAssessmentsPanel assessments={[]} sessions={sessions} roster={roster} rooms={rooms} onAssessmentsChange={noop} showToast={noop} />],
  ['EditPanel-new', () => <P.EditPanel session={{ id: '', week: 1, date: '2026-10-25', start: '23:00', end: '01:00', name: '', pillar: 'Vision', mode: 'Sync', facilitators: [], roomIds: [], resources: [], outcomes: [], notes: '', fellowNotes: '', afaGroup: '', attendanceCode: '', calendared: false }} onSave={noop} onDelete={null} onClose={noop} canEditSchedule pillars={null} rooms={rooms} staff={planners} />],
  ['EditPanel-legacy', () => <P.EditPanel session={sessions[0]} onSave={noop} onDelete={noop} onClose={noop} canEditSchedule pillars={null} rooms={rooms} staff={planners} />],
  ['EditPanel-nostaff', () => <P.EditPanel session={sessions[0]} onSave={noop} onDelete={null} onClose={noop} canEditSchedule pillars={null} rooms={rooms} staff={[]} />],
  ['EditPanel-readonly', () => <P.EditPanel session={sessions[0]} onSave={noop} onDelete={null} onClose={noop} canEditSchedule={false} pillars={null} rooms={rooms} staff={planners} />],
  ['Sidebar', () => <P.Sidebar tab="calendar" setTab={noop} isAdmin isFullAdmin isSuperadmin openRequests={2} />],
  ['TopBar', () => <P.TopBar tab="calendar" isFullAdmin auth={auth} onLogout={noop} onExport={noop} onReset={noop} onAdd={noop} />],
  ['FilterBar', () => <P.FilterBar pillarFilter="all" setPillarFilter={noop} modeFilter="all" setModeFilter={noop} pillars={null} />],
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


