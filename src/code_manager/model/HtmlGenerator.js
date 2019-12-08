import Backbone from 'backbone';

export default Backbone.Model.extend({
  build(model, opts = {}) {
    const models = model.get('components');

    if (opts.exportWrapper) {
      return model.toHTML({
        ...(opts.wrapperIsBody && { tag: 'body' })
      });
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
