import React from 'react';
import { PencilSimple, TrashSimple, Eye, EyeSlash } from '@phosphor-icons/react';

export default function ResourceListPanel({
  filtered = [],
  filter = { search: '', kind: 'all', grade: 'all', visible: 'all' },
  setFilter,
  DEFAULT_RESOURCE_KINDS = [], taxonomies = {}, kindMeta = {}, isSpecific,
  form, editId, creating,
  onStartEdit, onCancelEdit, onFormChange, onSubmit, onDelete, onToggleVisibility,
}) {
  const filterSearch = filter.search || '';
  const filterKind = filter.kind || 'all';
  const filterGrade = filter.grade || 'all';
  const filterVisible = filter.visible || 'all';

  return (
    <div>
      <div className="bg-wa-container border border-wa-borderrounded-lg p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search…" value={filterSearch} onChange={e => setFilter('search', e.target.value)} className="field-select w-full pl-8" />
          <select value={filterKind} onChange={e => setFilter('kind', e.target.value)} className="field-select select-sm"><option value="all">All kinds</option>{DEFAULT_RESOURCE_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
          <select value={filterGrade} onChange={e => setFilter('grade', e.target.value)} className="field-select select-sm"><option value="all">All grades</option>{(taxonomies.grades || []).map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select>
          <select value={filterVisible} onChange={e => setFilter('visible', e.target.value)} className="field-select select-sm"><option value="all">All visibility</option><option value="true">Visible to Fellows</option><option value="false">Hidden from Fellows</option></select>
        </div>
      </div>
      <div className="bg-wa-container rounded-lg border border-wa-border">
        <div className="divide-y divide-wa-border">
          {filtered.map(r => (
            <div key={r.id} className="p-4 flex flex-wrap items-center gap-3 hover:bg-wa-container2/30 transition-colors">
              <div className="flex-1 min-w-[180px] flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-wa-text text-sm">{r.title}</span>
                  <span className="text-xs text-wa-muted">{kindMeta[r.kind] || r.kind}</span>
                  {isSpecific(r) ? <span className="text-xs text-wa-muted">Grade: {r.grade} · Subject: {r.subject}</span> : <span className="text-xs text-wa-muted">All Fellows</span>}
                </div>
                {r.description && <p className="text-xs text-wa-muted">{r.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${r.visibleToFellows === 'true' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{r.visibleToFellows === 'true' ? 'Visible' : 'Hidden'}</span>
                <button className="btn-ghost btn-sm p-2 text-wa-muted hover:text-wa-button" title="Edit" onClick={() => onStartEdit(r)}><PencilSimple size={14} /></button>
                <button className="btn-ghost btn-sm p-2 text-wa-muted hover:text-red-600" title="Delete" onClick={() => onDelete(r.id)}><TrashSimple size={14} /></button>
                <button className={`btn-ghost btn-sm p-2 rounded-md transition-colors ${r.visibleToFellows === 'true' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`} title={r.visibleToFellows === 'true' ? 'Hide from Fellows' : 'Show to Fellows'} onClick={() => onToggleVisibility(r.id)}>
                  {r.visibleToFellows === 'true' ? <EyeSlash size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-8 text-center text-wa-muted">No resources match your filters.</div>}
        </div>
      </div>
      {(creating || editId) ? (
        <div className="bg-wa-container rounded-lg border border-wa-border p-4 mt-4">
          <h2 className="text-sm font-semibold text-wa-text mb-3">{creating ? 'Add resource' : 'Edit resource'}</h2>
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4"><label className="text-xs text-wa-muted mb-1 block">Title *</label><input required value={form.title} onChange={e => onFormChange({ ...form, title: e.target.value })} className="field-select w-full" placeholder="Resource title" /></div>
            <div><label className="text-xs text-wa-muted mb-1 block">Kind</label><select value={form.kind} onChange={e => onFormChange({ ...form, kind: e.target.value })} className="field-select w-full">{DEFAULT_RESOURCE_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select></div>
            <div><label className="text-xs text-wa-muted mb-1 block">URL *</label><input required type="url" value={form.url} onChange={e => onFormChange({ ...form, url: e.target.value })} className="field-select w-full" placeholder="https://…" /></div>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><button type="submit" className="btn-primary btn-sm">{creating ? 'Save' : 'Update'}</button><button type="button" className="btn-secondary btn-sm" onClick={onCancelEdit}>Cancel</button></div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
