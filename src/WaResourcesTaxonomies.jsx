import React from 'react';
import { ListDashes } from '@phosphor-icons/react';

/**
 * Taxonomy management sub-component used by the staff Resources panel.
 * Provides editable grade/subject/tag/resource-kind lists with CRUD.
 */
export default function TaxonomiesEditor({ taxonomies = {}, onSaveBucket = async () => {} }) {
  const [editingBucket, setEditingBucket] = React.useState(null);
  const [draft, setDraft] = React.useState([]);
  const [newLabel, setNewLabel] = React.useState('');
  const buckets = [
    ['grades', 'Grades'],
    ['subjects', 'Subjects'],
    ['tags', 'Tags'],
    ['resourceKinds', 'Resource Kinds'],
  ];

  const startEditing = bucket => {
    setEditingBucket(bucket);
    setDraft([...(taxonomies[bucket] || [])]);
    setNewLabel('');
  };

  const addTerm = () => {
    const label = newLabel.trim();
    if (!label || draft.some(term => term.label.toLowerCase() === label.toLowerCase())) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setDraft(items => [...items, { id: id || label, label }]);
    setNewLabel('');
  };

  const saveBucket = async () => {
    await onSaveBucket(editingBucket, draft);
    setEditingBucket(null);
  };

  return (
    <div className="bg-wa-container rounded-lg border border-wa-border p-4">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-wa-text">
        <ListDashes size={16} /> Manage Taxonomies
      </div>
      {buckets.map(([bucket, label]) => (
        <div key={bucket} className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-wa-text">{label}</span>
            <button className="text-xs text-wa-button hover:underline" onClick={() => startEditing(bucket)}>Edit</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(editingBucket === bucket ? draft : taxonomies[bucket] || []).map(term => (
              <span key={term.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-wa-container2 text-wa-text text-xs">
                {term.label}
                {editingBucket === bucket && (
                  <button
                    className="text-xs text-wa-muted hover:text-red-600"
                    aria-label={`Remove ${term.label}`}
                    onClick={() => setDraft(items => items.filter(item => item.id !== term.id))}
                  >×</button>
                )}
              </span>
            ))}
          </div>
          {editingBucket === bucket && (
            <>
              <form
                className="flex gap-2 mt-2"
                onSubmit={event => { event.preventDefault(); addTerm(); }}
              >
                <input
                  value={newLabel}
                  onChange={event => setNewLabel(event.target.value)}
                  placeholder={`New ${label.toLowerCase().replace(/s$/, '')} label`}
                  className="field-select text-sm w-48"
                />
                <button className="btn-secondary btn-sm" type="submit">Add</button>
              </form>
              <div className="flex justify-end gap-2 mt-3">
                <button className="btn-secondary btn-sm" onClick={() => setEditingBucket(null)}>Cancel</button>
                <button className="btn-primary btn-sm" onClick={saveBucket}>Save</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
