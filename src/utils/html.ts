import { escape } from './mixins';

/**
 * Safe ES6 tagged template strings
 * @param {Array<String>} literals
 * @param  {Array<String>} substs
 * @returns {String}
 * @example
 * const str = '<b>Hello</b>';
 * const strHtml = html`Escaped ${str}, unescaped $${str}`;
 */
export default function html(literals: TemplateStringsArray, ...substs: string[]) {
  const { raw } = literals;

  return raw.reduce((acc, lit, i) => {
    let subst = substs[i - 1];
    const last = raw[i - 1];

    if (Array.isArray(subst)) {
      subst = subst.join('');
    } else if (last && last.slice(-1) === '$') {
      // If the interpolation is preceded by a dollar sign, it won't be escaped
      acc = acc.slice(0, -1);
    } else {
      subst = escape(subst);
    }

    return acc + subst + lit;
  });
}
