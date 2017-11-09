const elProt = window.Element.prototype;
const matches = elProt.matches || elProt.webkitMatchesSelector || elProt.mozMatchesSelector || elProt.msMatchesSelector;

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


export {
  on,
  off,
  upFirst,
  matches,
  camelCase,
  getUnitFromValue
}
