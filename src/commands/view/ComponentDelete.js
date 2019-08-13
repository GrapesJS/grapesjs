import { isArray } from 'underscore';

export default {
  run(ed, sender, opts = {}) {
    let components = opts.component || ed.getSelectedAll();
    components = isArray(components) ? [...components] : [components];

    // It's important to deselect components first otherwise,
    // with undo, the component will be set with the wrong `collection`
    ed.select(null);

    components.forEach(component => {
      if (!component || !component.get('removable')) {
        console.warn('The element is not removable', component);
        return;
      }
      if (component) {
        const coll = component.collection;
        component.trigger('component:destroy');
        coll && coll.remove(component);
      }
    });

    return components;
  }
};
