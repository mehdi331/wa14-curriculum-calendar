// Winter Academy Resources — data model constants and validation helpers.
// Controls: grades, subjects, generic tags, and per-resource visibility to Fellows.

export const DEFAULT_RESOURCE_KINDS = [
  { id: 'handout',    label: 'Handout' },
  { id: 'reading',    label: 'Reading' },
  { id: 'video',      label: 'Video' },
  { id: 'template',   label: 'Template' },
  { id: 'slides',     label: 'Slides' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'lessonPlan', label: 'Lesson Plan' },
];

/** Full set of fields that make up a resource document. */
export const RESOURCE_FIELDS = [
  'id', 'title', 'kind', 'url', 'description',
  'grade', 'subject', 'tags', 'visibleToFellows',
  'createdBy', 'createdAt', 'updatedAt',
];

/** Firestore document id used as single-storage point for the resources system. */
export const RESOURCES_CONFIG_DOC = 'wa14-wa-resources-config';

/** The single Firestore collection/domain global key for all resources data. */
export const RESOURCES_CONFIG_DOC_ID = 'wa14-wa-resources-config';

// --- Validation helpers ---------------------------------------------------------

/**
 * Validate a resource payload. Returns { ok: boolean, errors: string[] }.
 */
export function validateResource(resource) {
  const errors = [];
  const required = ['title', 'kind', 'url'];
  for (const f of required) {
    if (!resource || resource[f] === undefined || resource[f] === null || String(resource[f]).trim() === '') {
      errors.push(`Missing required field: ${f}`);
    }
  }
  if (resource && resource.url && !String(resource.url).startsWith('http')) {
    errors.push('URL must start with http:// or https://');
  }
  if (resource && !['handout', 'reading', 'video', 'template', 'slides', 'assignment', 'lessonPlan'].includes(String(resource.kind))) {
    errors.push(`Invalid kind: ${resource.kind}. Must be one of the known resource kinds.`);
  }
  if (resource && !['true', 'false'].includes(String(resource.visibleToFellows))) {
    errors.push('visibleToFellows must be a boolean string ("true" or "false").');
  }
  return { ok: errors.length === 0, errors };
}

// --- Targeting helpers ----------------------------------------------------------

/**
 * Determine whether a resource is "Grade-specific" (targets one or more grades and/or subjects)
 * versus "Generic" (targets neither).
 */
export function isGradeSpecific(resource) {
  if (!resource) return false;
  const grade = String(resource.grade || '').trim();
  const subject = String(resource.subject || '').trim();
  return grade !== '' || subject !== '';
}

/**
 * Classify a resource into one of: "Grade-specific", "Generic".
 */
export function classifyTargeting(resource) {
  return isGradeSpecific(resource) ? 'Grade-specific' : 'Generic';
}
