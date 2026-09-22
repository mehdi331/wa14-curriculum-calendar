// CityHome: routes the seven City tabs. Owns city-item persistence + the item
// editor so the calendar and the sessions table edit the same data.
import React, { useState } from 'react';
import { cityItemsForFellow, canEditCityCalendar, canOpenAdminPanel } from './cohort';
import CityFellowHome from './CityFellowHome.jsx';
import CityCalendarView from './CityCalendarView.jsx';
import CitySessionsTable from './CitySessionsTable.jsx';
import CityStaffCalendar from './CityStaffCalendar.jsx';
import CityTypesModes from './CityTypesModes.jsx';
import CitySpacesReport from './CitySpacesReport.jsx';
import AdminPanel from './AdminPanel.jsx';
import CityItemEditorFull from './CityItemEditorFull.jsx';
import { blankCityItem } from './cityForm.jsx';

export default function CityHome(props) {
  const { tab, setTab, auth, roster, setRoster, planners, setPlanners } = props;
  const { items, setItems, staffTasks, setStaffTasks, settings, setSettings } = props;
  const { types, setTypes, modes, setModes } = props;
  const isFellow = auth.role === 'fellow';
  // City edit rights: full control or the dedicated calendar-editing access.
  // Resources-only and fellows-only staff see a read-only calendar.
  const canEdit = !isFellow && canEditCityCalendar(auth);
  const canChangeSettings = !isFellow && (auth.role === 'superadmin' || auth.access === 'full');
  const cohort = isFellow ? auth.cohort : null;
  const scopedItems = isFellow ? cityItemsForFellow(items, { cohort, fellowMonths: settings?.fellowMonths }) : (items || []);
  const [editing, setEditing] = useState(null);
  const saveItem = (next) => {
    setItems(prev => {
      const list = prev || [];
      return list.some(s => String(s.id) === String(next.id)) ? list.map(s => String(s.id) === String(next.id) ? next : s) : [...list, next];
    });
    setEditing(null);
  };
  const deleteItem = (id) => { setItems(prev => (prev || []).filter(s => String(s.id) !== String(id))); setEditing(null); };
  const startNew = (date) => setEditing({ ...blankCityItem(date, settings, types, modes) });
  const editor = editing && canEdit && (
    <CityItemEditorFull item={editing} settings={settings} planners={planners} types={types} modes={modes} onSave={saveItem} onDelete={editing.id && (items || []).some(s => String(s.id) === String(editing.id)) ? deleteItem : null} onClose={() => setEditing(null)} />
  );
  if (tab === 'calendar') {
    return (<React.Fragment>
      <CityCalendarView items={scopedItems} settings={settings} onSettingsChange={canChangeSettings ? setSettings : null} canEditSchedule={canEdit} auth={auth} cohort={cohort} onAdd={canEdit ? startNew : null} onEdit={canEdit ? setEditing : null} onDelete={canEdit ? deleteItem : null} types={types} modes={modes} />
      {editor}
    </React.Fragment>);
  }
  if (tab === 'types' && !isFellow && canEdit) {
    return <CityTypesModes types={types} setTypes={setTypes} modes={modes} setModes={setModes} />;
  }
  if (tab === 'sessions' && !isFellow) {
    return (<React.Fragment>
      <CitySessionsTable items={items} settings={settings} types={types} modes={modes} canEdit={canEdit} onAdd={() => startNew(null)} onEdit={setEditing} onDelete={deleteItem} />
      {editor}
    </React.Fragment>);
  }
  if (tab === 'staff' && !isFellow) {
    return <CityStaffCalendar items={items} staffTasks={staffTasks} setStaffTasks={setStaffTasks} settings={settings} canEdit={canEdit} types={types} modes={modes} />;
  }
  if (tab === 'report' && !isFellow) {
    return <CitySpacesReport items={items} roster={roster} settings={settings} types={types} modes={modes} />;
  }
  if (tab === 'admin' && !isFellow && canOpenAdminPanel(auth)) {
    return <AdminPanel auth={auth} roster={roster} setRoster={setRoster} planners={planners} setPlanners={setPlanners} settings={settings} />;
  }
  return <CityFellowHome auth={auth} items={scopedItems} fullItems={items} roster={roster} settings={settings} types={types} goCalendar={() => setTab('calendar')} />;
}
