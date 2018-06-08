import defaults from './config/config';
import ItemView from './view/ItemView';
import { isElement } from 'underscore';

module.exports = () => {
  let em;
  let layers;
  let config = {};

  return {
    name: 'LayerManager',

    init(opts = {}) {
      config = { ...defaults, ...opts };
      config.stylePrefix = opts.pStylePrefix;
      em = config.em;

      return this;
    },

    getConfig() {
      return config;
    },

    onLoad() {
      /*
      const collection = em.get('DomComponents').getComponents();
      const parent = collection.parent;
      const options = {
        level: 0,
        config,
        opened: config.opened || {}
      };

      // Show wrapper if requested
      if (config.showWrapper && parent) {
        View = ItemView;
        options.model = parent;
      } else {
        options.collection = collection;
      }
      */

      layers = new ItemView({
        level: 0,
        config,
        opened: config.opened || {},
        model: em.get('DomComponents').getWrapper()
      });
      em && em.on('component:selected', this.componentChanged);
      this.componentChanged();
    },

    postRender() {
      const elTo = config.appendTo;

      if (config.root) {
      }

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render());
      }
    },

    /**
     * Return the view of layers
     * @return {View}
     */
    getAll() {
      return layers;
    },

    /**
     * Triggered when the selected component is changed
     * @private
     */
    componentChanged(selected, opts = {}) {
      if (opts.fromLayers) return;
      const opened = em.get('opened');
      const model = em.getSelected();
      const scroll = config.scrollLayers;
      let parent = model && model.collection ? model.collection.parent : null;
      for (let cid in opened) opened[cid].set('open', 0);

      while (parent) {
        parent.set('open', 1);
        opened[parent.cid] = parent;
        parent = parent.collection ? parent.collection.parent : null;
      }

      if (model && scroll) {
        const el = model.viewLayer && model.viewLayer.el;
        el && el.scrollIntoView(scroll);
      }
    },

    render() {
      return layers.render().el;
    }
  };
};
