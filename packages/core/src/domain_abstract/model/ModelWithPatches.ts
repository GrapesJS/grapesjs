// src/domain_abstract/model/ModelWithPatches.ts
import Backbone, { ObjectHash } from 'backbone';
import type { JsonPatch } from '../../utils/jsonDiff';
import { diffObjects } from '../../utils/jsonDiff';

export default class ModelWithPatches<T extends ObjectHash = any> extends Backbone.Model<T> {
  patchObjectType = ''; // наприклад 'component'

  set(key: any, val?: any, opts?: any) {
    const { em } = this as any;
    const P = em?.Patches;
    if (!P?.isEnabled || (P as any)['isApplyingExternal']) {
      return super.set(key, val, opts);
    }

    // нормалізуємо вхід
    const props = typeof key === 'string' ? { [key]: val } : key;
    const options = typeof key === 'string' ? opts || {} : val || {};

    const before = { ...this.attributes };
    super.set(props, options);
    const after = this.attributes;

    const rawPatches = diffObjects(before, after);
    if (!rawPatches.length) return this;

    const id = this.id;
    const type = this.patchObjectType;

    const forward: JsonPatch[] = [];
    const reverse: JsonPatch[] = [];

    for (const p of rawPatches) {
      const prefixed = { ...p, path: `/${type}/${id}${p.path}` };
      forward.push(prefixed);

      // зворотні операції
      switch (p.op) {
        case 'add':
          reverse.unshift({ op: 'remove', path: prefixed.path });
          break;
        case 'remove':
          reverse.unshift({ op: 'add', path: prefixed.path, value: (before as any)[p.path.slice(1)] });
          break;
        case 'replace':
          reverse.unshift({ op: 'replace', path: prefixed.path, value: (before as any)[p.path.slice(1)] });
          break;
      }
    }

    P.collect(forward, reverse);
    return this;
  }
}
