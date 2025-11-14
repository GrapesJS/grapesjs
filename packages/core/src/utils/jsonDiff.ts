// src/utils/jsonDiff.ts
export interface JsonPatch {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: any;
}

/** Порівняти два прості об'єкти та створити масив JSON Patch */
export function diffObjects(before: any, after: any, basePath = ''): JsonPatch[] {
  const patches: JsonPatch[] = [];

  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  for (const key of Array.from(allKeys)) {
    const path = `${basePath}/${key}`;
    const oldVal = before?.[key];
    const newVal = after?.[key];

    if (oldVal === undefined && newVal !== undefined) {
      patches.push({ op: 'add', path, value: newVal });
    } else if (newVal === undefined) {
      patches.push({ op: 'remove', path });
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      if (typeof newVal === 'object' && newVal && typeof oldVal === 'object' && oldVal) {
        patches.push(...diffObjects(oldVal, newVal, path));
      } else {
        patches.push({ op: 'replace', path, value: newVal });
      }
    }
  }

  return patches;
}
