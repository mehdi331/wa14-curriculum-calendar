import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import {
  RESOURCES_CONFIG_DOC_ID,
  validateResource,
} from './waResources.js';

const LOCAL_STORAGE_KEY = 'wa14-local-resources';
const configDocRef = () => doc(db, 'wa14', RESOURCES_CONFIG_DOC_ID);

/** Default taxonomy buckets when the config doc doesn't exist yet. */
export const DEFAULT_TAXONOMIES = {
  grades: [{ id: 'Grade-1', label: 'Grade 1' }, { id: 'Grade-2', label: 'Grade 2' }, { id: 'Grade-3', label: 'Grade 3' }, { id: 'Grade-4', label: 'Grade 4' }, { id: 'Grade-5', label: 'Grade 5' }, { id: 'Grade-6', label: 'Grade 6' }, { id: 'Grade-7', label: 'Grade 7' }, { id: 'Grade-8', label: 'Grade 8' }, { id: 'Grade-9', label: 'Grade 9' }, { id: 'Grade-10', label: 'Grade 10' }],
  subjects: [{ id: 'Math', label: 'Mathematics' }, { id: 'English', label: 'English' }, { id: 'Science', label: 'Science' }, { id: 'Social Studies', label: 'Social Studies' }, { id: 'ICT', label: 'ICT' }, { id: 'Bangla', label: 'Bangla' }],
  tags: [{ id: 'Grade-Specific', label: 'Grade-Specific' }, { id: 'Group-Work', label: 'Group Work' }, { id: 'Assessment', label: 'Assessment' }, { id: 'Differentiation', label: 'Differentiation' }, { id: 'Engaging', label: 'Engaging' }, { id: 'Project-Based', label: 'Project-Based' }],
  resourceKinds: [
    { id: 'handout', label: 'Handout' },
    { id: 'reading', label: 'Reading' },
    { id: 'video', label: 'Video' },
    { id: 'template', label: 'Template' },
    { id: 'slides', label: 'Slides' },
    { id: 'assignment', label: 'Assignment' },
    { id: 'lessonPlan', label: 'Lesson Plan' },
  ],
};

// --- In-memory collection (sync over Firebase) -----------------------------------

/**
 * @typedef {Object} WaResourcesStore
 * @property {function} load — start listening to the config doc
 * @property {function} saveResource — upsert a single resource
 * @property {function} deleteResource — remove a resource by id
 * @property {function} saveTaxonomy — replace a taxonomy bucket
 * @property {function} setVisibility — toggle a resource's visibleToFellows
 */
export class WaResourcesStore {
  constructor({ localOnly = false } = {}) {
    this.localOnly = localOnly;
    this.state = {
      config: null,
      resources: [],
      taxonomies: null,
      loading: true,
      error: null,
    };
    this._unsubscribe = null;
    this._listeners = new Set();
  }

  /** Start a real-time listener. Call once during component mount. */
  load() {
    if (this.localOnly) {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        this.applyConfig({
          ...DEFAULT_TAXONOMIES,
          ...data,
          grades: Array.isArray(data.grades) ? data.grades : DEFAULT_TAXONOMIES.grades,
          subjects: Array.isArray(data.subjects) ? data.subjects : DEFAULT_TAXONOMIES.subjects,
          tags: Array.isArray(data.tags) ? data.tags : DEFAULT_TAXONOMIES.tags,
          resourceKinds: Array.isArray(data.resourceKinds) ? data.resourceKinds : DEFAULT_TAXONOMIES.resourceKinds,
          resources: Array.isArray(data.resources) ? data.resources : [],
        });
      } catch (error) {
        this.setState({ loading: false, error: `Could not load local resources: ${error.message}` });
      }
      return;
    }
    if (this._unsubscribe) this._unsubscribe();
    const docRef = configDocRef();
    this._unsubscribe = onSnapshot(docRef, async (snap) => {
      try {
        const data = snap.data();
        if (!data) {
          const defaults = { ...DEFAULT_TAXONOMIES, resources: [], updatedAt: serverTimestamp() };
          await setDoc(docRef, defaults, { merge: true });
          this.setState({ config: defaults, resources: [], taxonomies: { ...DEFAULT_TAXONOMIES }, loading: false, error: null });
          return;
        }
        const safe = {
          ...data,
          grades: Array.isArray(data.grades) ? data.grades : DEFAULT_TAXONOMIES.grades,
          subjects: Array.isArray(data.subjects) ? data.subjects : DEFAULT_TAXONOMIES.subjects,
          tags: Array.isArray(data.tags) ? data.tags : DEFAULT_TAXONOMIES.tags,
          resourceKinds: Array.isArray(data.resourceKinds) ? data.resourceKinds : DEFAULT_TAXONOMIES.resourceKinds,
          resources: Array.isArray(data.resources) ? data.resources : [],
          updatedAt: data.updatedAt,
        };
        this.applyConfig(safe);
      } catch (e) {
        this.setState({ loading: false, error: e.message });
      }
    }, (err) => {
      this.setState({ loading: false, error: err.message });
    });
  }

  /** Stop listening. */
  dispose() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  applyConfig(config) {
    this.setState({
      config,
      resources: config.resources,
      taxonomies: {
        grades: config.grades,
        subjects: config.subjects,
        tags: config.tags,
        resourceKinds: config.resourceKinds,
      },
      loading: false,
      error: null,
    });
  }

  async saveConfig(config) {
    if (this.localOnly) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
      return;
    }
    await setDoc(configDocRef(), config, { merge: true });
  }

  timestamp() {
    return this.localOnly ? new Date().toISOString() : serverTimestamp();
  }

  // --- Actions ------------------------------------------------------------------

  /**
   * Create or update a resource.
   * Validates then upserts into the resources array of the config doc.
   */
  async saveResource(resource) {
    if (!this.state.config) throw new Error('Store is not loaded yet.');
    const { ok, errors } = validateResource(resource);
    if (!ok) throw new Error(errors.join('; '));
    const now = this.timestamp();
    const baseId = resource.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
    const clean = {
      ...this.state.config,
      resources: (this.state.config.resources || []).filter(r => r.id !== resource.id),
      updatedAt: now,
    };
    const toSave = {
      ...clean,
      resources: [...(clean.resources || []), { id: resource.id || baseId, title: resource.title, kind: resource.kind, url: resource.url, description: resource.description, grade: resource.grade || '', subject: resource.subject || '', tags: resource.tags || [], visibleToFellows: resource.visibleToFellows, createdBy: resource.createdBy || '', createdAt: resource.createdAt || now, updatedAt: now }],
    };
    await this.saveConfig(toSave);
    this.setState({ config: toSave, resources: toSave.resources });
  }

  async deleteResource(id) {
    if (!this.state.config) throw new Error('Store is not loaded yet.');
    const toSave = {
      ...this.state.config,
      resources: (this.state.config.resources || []).filter(r => r.id !== id),
      updatedAt: serverTimestamp(),
    };
    await this.saveConfig(toSave);
    this.setState({ config: toSave, resources: toSave.resources });
  }

  /**
   * Save a taxonomy bucket (used by "Manage Taxonomies").
   * @param {'grades'|'subjects'|'tags'|'resourceKinds'} bucket
   * @param {Array} items
   */
  async saveTaxonomy(bucket, items) {
    if (!this.state.config) throw new Error('Store is not loaded yet.');
    const toSave = {
      ...this.state.config,
      [bucket]: items,
      updatedAt: this.timestamp(),
    };
    await this.saveConfig(toSave);
    this.setState({ config: toSave, taxonomies: { ...this.state.taxonomies, [bucket]: items } });
  }

  async setVisibility(resourceId, visible) {
    if (!this.state.config) throw new Error('Store is not loaded yet.');
    const resources = (this.state.config.resources || []).map(r => r.id === resourceId ? { ...r, visibleToFellows: visible ? 'true' : 'false' } : r);
    const toSave = {
      ...this.state.config,
      resources,
      updatedAt: this.timestamp(),
    };
    await this.saveConfig(toSave);
    this.setState({ config: toSave, resources: toSave.resources });
  }
  setState(next) {
    this.state = { ...this.state, ...next };
    this._listeners.forEach(listener => listener(this.state));
  }
}
