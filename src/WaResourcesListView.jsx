import React from 'react';
import { Plus, Funnel, Grid, ListDashes } from '@phosphor-icons/react';
import ResourceCard from './ResourceCard';
import { DEFAULT_RESOURCE_KINDS } from './waResources.js';

/**
 * Fellows-facing resource list: browse, filter by grade/subject/tag, view cards.
 */
export default function WaResourcesListView({
  resources = [],
  taxonomies = null,
  loading = false,
  emptyMessage = 'No resources yet.',
}) {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [gradeFilter, setGradeFilter] = React.useState('all');
  const [subjectFilter, setSubjectFilter] = React.useState('all');
  const [tagFilter, setTagFilter] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('grid');

  const tags = (taxonomies && taxonomies.tags) || [];
  const grades = (taxonomies && taxonomies.grades) || [];
  const subjects = (taxonomies && taxonomies.subjects) || [];

  const filtered = resources.filter(r => {
    if (loading) return false;
    if (search && !String(r.title || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && r.kind !== typeFilter) return false;
    if (gradeFilter !== 'all' && r.grade !== gradeFilter) return false;
    if (subjectFilter !== 'all' && r.subject !== subjectFilter) return false;
    if (tagFilter !== 'all' && !r.tags.includes(tagFilter)) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-wa-text">Resources</h1>
          <p className="text-xs text-wa-muted mt-0.5">{resources.length} resource{resources.length !== 1 ? 's' : ''} — view all materials Fellows can access</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost btn-sm" onClick={() => setViewMode('grid')} title="Grid view"><Grid size={14} /></button>
          <button className="btn-ghost btn-sm" onClick={() => setViewMode('list')} title="List view"><ListDashes size={14} /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-wa-container border border-wa-borderrounded-lg p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search resources…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="field-select w-full pl-8"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="field-select select-sm">
              <option value="all">All kinds</option>
              {DEFAULT_RESOURCE_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
            <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className="field-select select-sm">
              <option value="all">All grades</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="field-select select-sm">
              <option value="all">All subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="field-select select-sm">
              <option value="all">All tags</option>
              {tags.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>
        {search || typeFilter !== 'all' || gradeFilter !== 'all' || subjectFilter !== 'all' || tagFilter !== 'all' ? (
          <div className="flex items-center gap-3 mt-2 text-[11px] text-wa-muted">
            <span className="font-medium">{filtered.length}</span>
            <span>results</span>
            {search && <span className="ml-auto">&quot;{search}&quot;</span>}
          </div>
        ) : null}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-wa-muted">
          <p className="text-sm">{emptyMessage}</p>
          <p className="text-xs mt-1">Staff can add resources from their Resources panel.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              mode="fellow"
              showVisibilityToggle={false}
              onOpen={(res) => { if (res.url && typeof window !== 'undefined') window.open(res.url, '_blank', 'noopener,noreferrer'); }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              mode="fellow"
              showVisibilityToggle={false}
              onOpen={(res) => { if (res.url && typeof window !== 'undefined') window.open(res.url, '_blank', 'noopener,noreferrer'); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
