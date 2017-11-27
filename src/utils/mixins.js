import { omit, keys, isUndefined } from 'underscore';

const elProt = window.Element.prototype;
const matches = elProt.matches || elProt.webkitMatchesSelector || elProt.mozMatchesSelector || elProt.msMatchesSelector;

/**
 * Returns shallow diff between 2 objects
 * @param  {Object} objOrig
 * @param  {Objec} objNew
 * @return {Object}
 * @example
 * var a = {foo: 'bar', baz: 1, faz: 'sop'};
 * var b = {foo: 'bar', baz: 2, bar: ''};
 * shallowDiff(a, b);
 * // -> {baz: 2, faz: null, bar: ''};
 */
const shallowDiff = (objOrig, objNew) => {
  const result = {};
  const keysNew = keys(objNew);

  for (let prop in objOrig) {
    if (objOrig.hasOwnProperty(prop)) {
      const origValue = objOrig[prop];
      const newValue = objNew[prop];

      if (keysNew.indexOf(prop) >= 0) {
        if (origValue !== newValue) {
          result[prop] = newValue;
        }
      } else {
        result[prop] = null;
      }
    }
  }

  for (let prop in objNew) {
    if (objNew.hasOwnProperty(prop)) {
      if (isUndefined(objOrig[prop])) {
        result[prop] = objNew[prop];
      }
    }
  }

  return result;
};


const on = (el, ev, fn) => {
  ev = ev.split(/\s+/);
  el = el instanceof Array ? el : [el];

  for (let i = 0; i < ev.length; ++i) {
    el.forEach(elem => elem.addEventListener(ev[i], fn));
  }
}


const off = (el, ev, fn) => {
  ev = ev.split(/\s+/);
  el = el instanceof Array ? el : [el];

  for (let i = 0; i < ev.length; ++i) {
    el.forEach(elem => elem.removeEventListener(ev[i], fn));
  }
}


const getUnitFromValue = (value) => {
  return value.replace(parseFloat(value), '');
}


const upFirst = value => value[0].toUpperCase() + value.toLowerCase().slice(1);


const camelCase = value => {
  const values = value.split('-');
  return values[0].toLowerCase() + values.slice(1).map(upFirst);
}

const normalizeFloat = (value, step = 1, valueDef = 0) => {
  let stepDecimals = 0;
  if (isNaN(value)) return valueDef;
  value = parseFloat(value);

  if (Math.floor(value) !== value) {
    const side = step.toString().split('.')[1];
    stepDecimals = side ? side.length : 0;
  }

  return stepDecimals ? parseFloat(value.toFixed(stepDecimals)) : value;
}


export {
  on,
  off,
  upFirst,
  matches,
  camelCase,
  shallowDiff,
  normalizeFloat,
  getUnitFromValue
}
