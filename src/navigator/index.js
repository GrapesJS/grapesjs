function Navigator(collection, c) {
  var config = c,
    defaults = require('./config/config'),
    ItemsView = require('./view/ItemsView');

  // Set default options
  for (var name in defaults) {
    if (!(name in config))
      config[name] = defaults[name];
  }

  var obj = {
    collection,
    config,
    opened: c.opened || {}
  };

  this.ItemsView = new ItemsView(obj);
}

Navigator.prototype  = {
    render() {
      return this.ItemsView.render().$el;
    },
};

module.exports = Navigator;
