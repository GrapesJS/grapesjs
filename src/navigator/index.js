module.exports = () => {
  let itemsView;
  let config = {};
  const defaults = require('./config/config');
  const ItemsView = require('./view/ItemsView');

  return {
    init(collection, opts) {
      config = opts || config;
      const em = config.em;

      // Set default options
      for (var name in defaults) {
        if (!(name in config))
          config[name] = defaults[name];
      }

      itemsView = new ItemsView({
        collection,
        config,
        opened: opts.opened || {}
      });
      em && em.on('change:selectedComponent', this.componentChanged);
      this.componentChanged();

      return this;
    },

    /**
     * Triggered when the selected component is changed
     * @private
     */
    componentChanged() {
      const em = config.em;
      const opened = em.get('opened');
      const model = em.get('selectedComponent');
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
      return itemsView.render().$el;
    },
  }
};
