// src/patch_manager/types.ts
export type JsonPatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

export interface JsonPatch {
  op: JsonPatchOp;
  path: string; // RFC6902, например: "/component/comp_123/styles/color"
  from?: string;
  value?: any;
}

export interface PatchProps {
  id: string; // uuid
  ts: number; // timestamp
  changes: JsonPatch[]; // прямые изменения
  reverseChanges: JsonPatch[]; // инверсия для undo
  meta?: Record<string, any>; // user, txnId, etc.
}
