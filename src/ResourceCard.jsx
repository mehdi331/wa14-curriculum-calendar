import React from 'react';
import { LinkIcon, ExternalLink, Eye, EyeSlash, FolderOpen, FileIcon as FileIconP } from '@phosphor-icons/react';
import { classifyTargeting, isGradeSpecific } from './waResources.js';

/**
 * Reusable resource card component used by both staff and Fellows views.
 * @param {Object} props
 * @param {Object} props.resource — full resource document
 * @param {boolean} props.showVisibilityToggle
 * @param {function} props.onToggleVisibility
 * @param {function} props.onOpen
 * @param {'staff'|'fellow'} props.mode — controls which affordances are shown
 */
export default function ResourceCard({ resource, showVisibilityToggle = false, onToggleVisibility = () => {}, onOpen = () => {}, mode = 'fellow' }) {
  const kindMeta = (typeof window !== 'undefined' && window.waResourceKindsMap) || {};
  const displayKind = kindMeta[resource.kind] ? kindMeta[resource.kind] : resource.kind;
  const isSpecific = isGradeSpecific(resource);
  const targetLabel = isSpecific
    ? (String(resource.grade || '').trim() ? `Grade ${String(resource.grade).trim()}` : '') + (String(resource.grade || '').trim() && String(resource.subject || '').trim() ? ', ' : '') + (String(resource.subject || '').trim() ? `Subject: ${String(resource.subject).trim()}` : '')
    : 'All Fellows';

  return (
    <div className="wa-resource-card card bg-wa-container border border-wa-borderrounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-wa-text truncate" title={resource.title}>{resource.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-wa-muted">
            <span className="inline-flex items-center gap-1 bg-wa-container2px-2 rounded-md">
              <FileIconP size={12} /> {displayKind}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${isSpecific ? 'bg-wa-container3text' : 'bg-wa-container2text'}`}>
              {isSpecific ? 'Grade-Specific' : 'Generic'}
            </span>
            {resource.grade && String(resource.grade).trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-wa-container3text">
                Grade: {String(resource.grade).trim()}
              </span>
            )}
            {resource.subject && String(resource.subject).trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-wa-container3text">
                Subject: {String(resource.subject).trim()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            onClick={() => onOpen(resource)}
            className="btn-ghost btn-sm p-2 rounded-md text-wa-text hover:bg-wa-container2 hover:text-wa-button transition-colors"
            title="Open resource"
            aria-label="Open resource"
          >
            <LinkIcon size={16} />
          </button>
          {showVisibilityToggle && mode === 'staff' && (
            <button
              onClick={() => onToggleVisibility(resource.id)}
              className={`btn-ghost btn-sm p-2 rounded-md transition-colors ${resource.visibleToFellows === 'true' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}
              title={resource.visibleToFellows === 'true' ? 'Hide from Fellows' : 'Show to Fellows'}
              aria-label={resource.visibleToFellows === 'true' ? 'Hide from Fellows' : 'Show to Fellows'}
            >
              {resource.visibleToFellows === 'true' ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
      {resource.description && (
        <p className="text-xs text-wa-muted mt-2 line-clamp-2">{resource.description}</p>
      )}
      {resource.grade || resource.subject ? (
        <div className="mt-3 pt-3 border-t border-wa-border/60 flex flex-wrap text-[11px] text-wa-muted">
          <span className="text-wa-text font-medium">Target: </span>
          <span className="ml-1">{targetLabel}</span>
        </div>
      ) : null}
      {resource.tags && resource.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {resource.tags.slice(0, 5).map(t => (
            <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] bg-wa-container2 text-wa-muted">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
