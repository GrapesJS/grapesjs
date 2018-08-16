import Backbone from 'backbone';

module.exports = Backbone.Model.extend({
  build(model, opts = {}) {
    const models = model.get('components');

    if (opts.exportWrapper) {
      return opts.wrappesIsBody
        ? `<body>${this.buildModels(models)}</body>`
        : model.toHTML();
    }

    return this.buildModels(models);
  },

  buildModels(models) {
    let code = '';
    models.each(model => {
      code += model.toHTML();
    });
    return code;
  }
});
