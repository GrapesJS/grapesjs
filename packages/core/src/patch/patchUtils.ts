// RFC6902 JSON Patch type
export type JsonOp = 'add' | 'remove' | 'replace';
export type JsonPatch = { op: JsonOp; path: string; value?: any };

export const makeCmpPath = (type: string, id: string) => `/${type}/${id}`;

export function ensurePatchObjectType(model: any): string {
  // Можеш зберігати тип у моделі (аналог patchObjectType)
  // або вивести з класу/namespace; поки що ставимо 'component'
  return (model.patchObjectType as string) || 'component';
}

export function toAttrPath(base: string, key: string) {
  return `${base}/attributes/${escapeJsonPointer(key)}`;
}

export function toStylePath(base: string, key: string) {
  return `${base}/style/${escapeJsonPointer(key)}`;
}

export function toPropPath(base: string, key: string) {
  return `${base}/${escapeJsonPointer(key)}`;
}

/** JSON Pointer escaping for ~ and / */
export function escapeJsonPointer(s: string) {
  return s.replace(/~/g, '~0').replace(/\//g, '~1');
}

/** Збірка forward/reverse патчів для заміни значення */
export function replacePair(path: string, prevVal: any, nextVal: any): { f: JsonPatch; r: JsonPatch } {
  const f: JsonPatch =
    nextVal === undefined
      ? { op: 'remove', path }
      : prevVal === undefined
        ? { op: 'add', path, value: nextVal }
        : { op: 'replace', path, value: nextVal };

  const r: JsonPatch =
    prevVal === undefined
      ? { op: 'remove', path } // reverse для add → remove
      : nextVal === undefined
        ? { op: 'add', path, value: prevVal }
        : { op: 'replace', path, value: prevVal };

  return { f, r };
}
