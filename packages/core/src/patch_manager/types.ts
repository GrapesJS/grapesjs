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

export type PatchObjectType =
  | 'component'
  | 'cssRule'
  | 'dataSource'
  | 'dataRecord'
  | 'asset'
  | 'page'
  | 'selector';

export type PatchObjectMap = Partial<Record<PatchObjectType, Record<string, any>>>;

export interface PatchAdapterEventContext {
  args: any[];
  options?: Record<string, any>;
}

export interface PatchAdapterEventResult {
  patches: JsonPatch[];
  inverse?: JsonPatch[];
}

export interface PatchAdapterEvent {
  event: string;
  target?: (pm: any) => any;
  handler: (ctx: PatchAdapterEventContext) => PatchAdapterEventResult | void;
  getOptions?: (...args: any[]) => Record<string, any> | undefined;
  skipTrackingCheck?: boolean;
}

export interface PatchAdapterChange<T> {
  target: T;
  changed: Record<string, any>;
}

export interface PatchAdapter<T> {
  type: string;
  sourceKeys?: string[];
  blockedKeys?: Set<string> | string[];
  getId: (model: T) => string | undefined;
  resolve?: (em: any, id: string) => T | null | undefined;
  filterChangedKey?: (key: string) => boolean;
  getChange?: (data: Record<string, any>) => PatchAdapterChange<T> | null;
  events?: PatchAdapterEvent[];
  onReady?: (manager: any) => void;
}
