import React from 'react';
import { Plus, X } from '@phosphor-icons/react';
import WaResourcesListPanel from './WaResourcesListPanel.jsx';
import TaxonomiesEditor from './WaResourcesTaxonomies.jsx';
import { WaResourcesStore } from './waResourcesStore.js';

function Toast({ message, type = 'info', onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2600); return () => clearTimeout(t); }, [onClose]);
  if (!message) return null;
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-wa-button';
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${bg} transition-all duration-300`} role="alert">
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="btn-ghost btn-sm p-1" aria-label="Dismiss"><X size={12} /></button>
    </div>
  );
}

export default function WaResourcesPanel({ store = null, role = 'staff' }) {
  const [activeTab, setActiveTab] = React.useState('resources');
  const [toast, setToast] = React.useState(null);
  const sharedStore = React.useMemo(() => store || new WaResourcesStore(), [store]);
  const [storeState, setStoreState] = React.useState(sharedStore.state);
  React.useEffect(() => {
    setStoreState(sharedStore.state);
    return sharedStore.subscribe(setStoreState);
  }, [sharedStore]);
  const resources = storeState.resources || [];
  const taxonomies = storeState.taxonomies || { grades: [], subjects: [], tags: [], resourceKinds: [] };
  const [filter, setFilter] = React.useState({ search: '', kind: 'all', grade: 'all', visible: 'all' });
  const updatedFilter = (k, v) => setFilter(f => ({ ...f, [k]: v }));
  const filtered = resources.filter(r => {
    if (filter.search && !String(r.title || '').toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.kind !== 'all' && r.kind !== filter.kind) return false;
    if (filter.grade !== 'all' && r.grade !== filter.grade) return false;
    if (filter.visible !== 'all' && r.visibleToFellows !== filter.visible) return false;
    return true;
  });
  const isSpecific = r => r.grade || r.subject;
  const kindMeta = { handout: 'Handout', reading: 'Reading', video: 'Video', template: 'Template', slides: 'Slides', assignment: 'Assignment', lessonPlan: 'Lesson Plan' };
  const [form, setForm] = React.useState({ id: null, title: '', kind: 'handout', url: '', description: '', grade: '', subject: '', tags: [], visibleToFellows: 'true', createdBy: '', createdAt: '', updatedAt: '' });
  const [creating, setCreating] = React.useState(false);
  const openAdd = () => { setForm({ id: null, title: '', kind: 'handout', url: '', description: '', grade: '', subject: '', tags: [], visibleToFellows: 'true', createdBy: '', createdAt: '', updatedAt: '' }); setCreating(true); };
  const cancelAdd = () => { setCreating(false); };
  const startEdit = r => { setForm(r); setCreating(true); };
  const cancelEdit = () => { setCreating(false); };
  const save = async (e) => {
    e?.preventDefault();
    try { await sharedStore.saveResource(form); setToast({ message: 'Resource saved.', type: 'success', onClose: () => setToast(null) }); cancelAdd(); } catch (err) { setToast({ message: `Error: ${err.message}`, type: 'error', onClose: () => setToast(null) }); }
  };
  const del = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try { await sharedStore.deleteResource(id); setToast({ message: 'Deleted.', type: 'success', onClose: () => setToast(null) }); } catch (err) { setToast({ message: `Error: ${err.message}`, type: 'error', onClose: () => setToast(null) }); }
  };
  const toggleVis = async (id) => {
    const r = resources.find(x => x.id === id);
    if (!r) return;
    try { await sharedStore.setVisibility(id, r.visibleToFellows === 'true' ? false : true); setToast({ message: r.visibleToFellows === 'true' ? 'Hidden from Fellows.' : 'Shown to Fellows.', type: 'info', onClose: () => setToast(null) }); } catch (err) { setToast({ message: `Error: ${err.message}`, type: 'error', onClose: () => setToast(null) }); }
  };
  return (
    <div className="max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={toast.onClose} />}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-wa-text">Resources</h1>
          <p className="text-xs text-wa-muted mt-0.5">
            Staff-managed library for Fellows.
            {sharedStore.localOnly && ' Local development data is saved in this browser.'}
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={14} weight="bold" /> Add resource</button>
      </div>
      <div className="flex gap-6 border-b border-wa-border mb-5">
        <button className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'resources' ? 'text-wa-button border-b-2 border-wa-button' : 'text-wa-muted'}`} onClick={() => setActiveTab('resources')}>Resources <span className="text-xs font-normal normal-case text-wa-muted ml-1">({resources.length})</span></button>
        <button className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'taxonomies' ? 'text-wa-button border-b-2 border-wa-button' : 'text-wa-muted'}`} onClick={() => setActiveTab('taxonomies')}>Manage Taxonomies</button>
      </div>
      {storeState.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          Could not load resources: {storeState.error}
        </div>
      )}
      {storeState.loading && <p className="mb-4 text-sm text-wa-muted" role="status">Loading resources…</p>}
      {activeTab === 'resources' ? (
        <WaResourcesListPanel
          resources={resources} filtered={filtered}
          filter={filter} setFilter={updatedFilter}
          DEFAULT_RESOURCE_KINDS={taxonomies.resourceKinds || []}
          taxonomies={taxonomies}
          kindMeta={kindMeta}
          isSpecific={isSpecific}
          form={form} creating={creating}
          onStartEdit={startEdit} onCancelEdit={cancelEdit} onFormChange={setForm}
          onSubmit={save} onDelete={del} onToggleVisibility={toggleVis}
        />
      ) : (
        <TaxonomiesEditor
          taxonomies={taxonomies}
          onSaveBucket={async (bucket, items) => {
            try {
              await sharedStore.saveTaxonomy(bucket, items);
              setToast({ message: 'Taxonomy saved.', type: 'success', onClose: () => setToast(null) });
            } catch (err) {
              setToast({ message: `Error: ${err.message}`, type: 'error', onClose: () => setToast(null) });
            }
          }}
        />
      )}
    </div>
  );
}
