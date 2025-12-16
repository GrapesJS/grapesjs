import { createId } from './mixins';

export const getUid = (target: any, attr = 'uid') => {
  if (!target) return '';
  return (
    target[attr] ||
    (typeof target.get === 'function' ? target.get(attr) : undefined) ||
    (typeof target.attributes === 'object' ? (target as any).attributes?.[attr] : undefined) ||
    ''
  );
};

export const ensureUid = <T extends Record<string, any>>(target: T, attr = 'uid', prefix?: string): string => {
  const existing = getUid(target, attr);
  const uid = existing || (prefix ? `${prefix}-${createId()}` : createId());

  if (typeof (target as any).set === 'function') {
    (target as any).set(attr, uid, { silent: true });
  } else {
    (target as any)[attr] = uid;
  }

  return uid;
};

