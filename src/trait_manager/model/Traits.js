import { isString, isArray } from 'underscore';
const Backbone = require('backbone');
const Trait = require('./Trait');
const TraitFactory = require('./TraitFactory');

module.exports = Backbone.Collection.extend({
  model: Trait,

  initialize(coll, options = {}) {
    this.em = options.em || '';
    this.listenTo(this, 'add', this.handleAdd);
  },

  handleAdd(model) {
    const target = this.target;

    if (target) {
      model.target = target;
    }
  },

  setTarget(target) {
    this.target = target;
  },

  add(models, opt) {
    const em = this.em;

    // Use TraitFactory if necessary
    if (isString(models) || isArray(models)) {
      const tm = em && em.get && em.get('TraitManager');
      const tmOpts = tm && tm.getConfig();
      const tf = TraitFactory(tmOpts);

      if (isString(models)) {
        models = [models];
      }

      for (var i = 0, len = models.length; i < len; i++) {
        const str = models[i];
        const model = isString(str) ? tf.build(str)[0] : str;
        model.target = this.target;
        models[i] = model;
      }
    }

    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  }
});
