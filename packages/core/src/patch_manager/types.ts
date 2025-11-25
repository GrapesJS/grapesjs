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
