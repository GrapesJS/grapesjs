import { createId } from '../utils/mixins';

export type PatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

export type PatchPath = Array<string | number>;

export type PatchChangeProps = {
  op: PatchOp;
  path: PatchPath;
  value?: any;
  from?: PatchPath;
};

export type PatchProps = {
  id: string;
  changes: PatchChangeProps[];
  reverseChanges: PatchChangeProps[];
};

export type PatchApplyOptions = {
  external?: boolean;
  direction?: 'forward' | 'backward';
};

export type PatchApplyHandler = (changes: PatchChangeProps[], options?: PatchApplyOptions) => void;

export type PatchEventEmitter = {
  trigger: (event: string, payload?: any) => void;
};

export type PatchManagerOptions = {
  enabled?: boolean;
  emitter?: PatchEventEmitter;
  applyPatch?: PatchApplyHandler;
};

export const PatchManagerEvents = {
  update: 'patch:update',
  undo: 'patch:undo',
  redo: 'patch:redo',
} as const;

type InternalPatch = PatchProps & { recordable: boolean };

const createPatchId = () => {
  // Prefer UUID when available, fallback to legacy id generator
  const randomUUID = typeof crypto !== 'undefined' && (crypto as any).randomUUID;
  return typeof randomUUID === 'function' ? randomUUID.call(crypto) : createId();
};

export default class PatchManager {
  isEnabled: boolean;
  private emitter?: PatchEventEmitter;
  private applyHandler?: PatchApplyHandler;
  private history: PatchProps[] = [];
  private redoStack: PatchProps[] = [];
  private activePatch?: InternalPatch;
  private updateDepth = 0;
  private finalizeScheduled = false;
  private suppressTracking = false;

  constructor(options: PatchManagerOptions = {}) {
    this.isEnabled = !!options.enabled;
    this.emitter = options.emitter;
    this.applyHandler = options.applyPatch;
  }

  createId(): string {
    return createPatchId();
  }

  createOrGetCurrentPatch(): PatchProps {
    if (!this.shouldRecord()) {
      return this.createVoidPatch();
    }

    if (!this.activePatch) {
      this.activePatch = this.createPatch();

      if (!this.updateDepth) {
        this.scheduleFinalize();
      }
    }

    return this.activePatch;
  }

  finalizeCurrentPatch(): void {
    const patch = this.activePatch;
    this.activePatch = undefined;
    this.finalizeScheduled = false;

    if (!patch || !patch.recordable) return;
    if (!patch.changes.length && !patch.reverseChanges.length) return;

    this.add(patch);
  }

  update(cb: () => void): void {
    if (!this.isEnabled) {
      cb();
      return;
    }

    this.updateDepth++;
    this.createOrGetCurrentPatch();

    try {
      cb();
    } finally {
      this.updateDepth--;

      if (this.updateDepth === 0) {
        this.finalizeCurrentPatch();
      }
    }
  }

  add(patch: PatchProps): void {
    if (!this.shouldRecord()) return;

    this.history.push(patch);
    this.redoStack = [];
    this.emit(PatchManagerEvents.update, patch);
  }

  apply(patch: PatchProps, opts: { external?: boolean } = {}): void {
    if (!this.isEnabled) return;

    const { external = false } = opts;
    const addToHistory = !external;

    if (addToHistory) {
      this.finalizeCurrentPatch();
    }

    this.applyChanges(patch.changes, { external, direction: 'forward' });

    if (addToHistory) {
      this.history.push(patch);
      this.redoStack = [];
      this.emit(PatchManagerEvents.update, patch);
    }
  }

  undo(): PatchProps | undefined {
    if (!this.isEnabled) return;

    this.finalizeCurrentPatch();
    const patch = this.history.pop();
    if (!patch) return;

    this.applyChanges(patch.reverseChanges, { direction: 'backward' });
    this.redoStack.push(patch);
    this.emit(PatchManagerEvents.undo, patch);

    return patch;
  }

  redo(): PatchProps | undefined {
    if (!this.isEnabled) return;

    this.finalizeCurrentPatch();

    const patch = this.redoStack.pop();
    if (!patch) return;

    this.applyChanges(patch.changes, { direction: 'forward' });
    this.history.push(patch);
    this.emit(PatchManagerEvents.redo, patch);

    return patch;
  }

  private applyChanges(changes: PatchChangeProps[], options: PatchApplyOptions = {}) {
    if (!changes.length || !this.applyHandler) return;

    this.withSuppressedTracking(() => {
      this.applyHandler?.(changes, options);
    });
  }

  private withSuppressedTracking<T>(cb: () => T): T {
    const prevSuppress = this.suppressTracking;
    this.suppressTracking = true;

    try {
      return cb();
    } finally {
      this.suppressTracking = prevSuppress;
    }
  }

  private shouldRecord() {
    return this.isEnabled && !this.suppressTracking;
  }

  private createPatch(): InternalPatch {
    return {
      id: createPatchId(),
      changes: [],
      reverseChanges: [],
      recordable: true,
    };
  }

  private createVoidPatch(): InternalPatch {
    return {
      id: '',
      changes: [],
      reverseChanges: [],
      recordable: false,
    };
  }

  private scheduleFinalize() {
    if (this.updateDepth || this.finalizeScheduled) return;
    this.finalizeScheduled = true;

    Promise.resolve().then(() => {
      this.finalizeScheduled = false;

      if (!this.updateDepth) {
        this.finalizeCurrentPatch();
      }
    });
  }

  private emit(event: string, payload: PatchProps): void {
    this.emitter?.trigger?.(event, payload);
  }
}

export { PatchObjectsRegistry, createRegistryApplyPatchHandler, type PatchUid } from './registry';
