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

export {on, off}
