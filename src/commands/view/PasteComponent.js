import { isArray, contains } from 'underscore';

export default {
  run(ed) {
    const em = ed.getModel();
    const clp = em.get('clipboard');

    if (clp) {
      let currentIndex = 0;
      clp.forEach(comp => {
        if (!comp) return;
        const coll = comp.collection;
        const at = coll.indexOf(comp) + 1;
        const copyable = clp.filter(cop => cop.get('copyable'));
        let added;

        if (contains(clp, comp) && comp.get('copyable')) {
          added = coll.add(comp.clone(), { at });
        } else {
          added = coll.add(
            copyable.map(cop => cop.clone()),
            { at }
          );
        }
        currentIndex++;

        added = isArray(added) ? added : [added];
        added.forEach(add => {
          add['copyIndex'] = currentIndex;
          ed.trigger('component:paste', add);
        });
      });

      for (let i = 0; i < clp.length; i++) {
        clp[i].emitUpdate();
      }
    }
  }
};
