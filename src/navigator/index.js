import defaults from './config/config';
import ItemView from './view/ItemView';
import ItemsView from './view/ItemsView';

module.exports = () => {
  let em;
  let layers;
  let config = {};
  let View = ItemsView;

  return {
    name: 'LayerManager',

    init(opts = {}) {
      config = { ...defaults, ...opts };
      em = config.em;

      return this;
    },

    onLoad() {
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

      layers = new View(options);
      em && em.on('component:selected', this.componentChanged);
      this.componentChanged();
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
    componentChanged(e, md, opts = {}) {
      if (opts.fromLayers) {
        return;
      }

      const em = config.em;
      const opened = em.get('opened');
      const model = em.getSelected();
      let parent = model && model.collection ? model.collection.parent : null;

      for (let cid in opened) {
        opened[cid].set('open', 0);
      }

      while (parent) {
        parent.set('open', 1);
        opened[parent.cid] = parent;
        parent = parent.collection ? parent.collection.parent : null;
      }
    },

    render() {
      return layers.render().$el;
    }
  };
};
