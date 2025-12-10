export type JsonPatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

export interface JsonPatch {
  op: JsonPatchOp;
  path: string;
  from?: string;
  value?: any;
}

export interface PatchProps {
  id: string;
  ts: number;
  changes: JsonPatch[];
  reverseChanges: JsonPatch[];
  meta?: Record<string, any>;
}

export interface PatchManagerConfig {
  enable?: boolean;
  maxHistory?: number;
  coalesceMs?: number;
  debug?: boolean;
}

export interface PatchAdapterChange<T = any> {
  target: T;
  changed: Record<string, any>;
}

export interface PatchAdapterEventContext {
  args: any[];
  options?: Record<string, any>;
}

export interface PatchAdapterEventResult {
  patches?: JsonPatch[];
  inverse?: JsonPatch[];
}

export interface PatchAdapterEvent {
  event: string;
  handler: (context: PatchAdapterEventContext) => PatchAdapterEventResult | void;
  getOptions?: (...args: any[]) => Record<string, any> | undefined;
  skipTrackingCheck?: boolean;
  target?: (manager: any) => any;
}

export interface PatchAdapter<T = any> {
  type: string;
  sourceKeys?: string[];
  getChange?: (data: Record<string, any>) => PatchAdapterChange<T> | null;
  getId: (target: T) => string | undefined;
  resolve: (em: any, id: string) => T | undefined | null;
  filterChangedKey?: (key: string) => boolean;
  events?: PatchAdapterEvent[];
  applyPatch?: (target: T, path: string[], patch: JsonPatch) => boolean | void;
  onReady?: (manager: any) => void;
  blockedKeys?: Set<string> | string[];
}
