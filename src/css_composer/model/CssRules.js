import Backbone from 'backbone';
import CssRule from './CssRule';

export default Backbone.Collection.extend({
  model: CssRule,

  initialize(models, opt) {
    // Inject editor
    if (opt && opt.em) this.editor = opt.em;

    // This will put the listener post CssComposer.postLoad
    setTimeout(() => this.on('remove', this.onRemove));
  },

  onRemove(removed) {
    const em = this.editor;
    const um = em.get('UndoManager');
    em.stopListening(removed);
    um && um.remove(removed);
  },

  add(models, opt = {}) {
    if (typeof models === 'string') {
      models = this.editor.get('Parser').parseCss(models);
    }
    opt.em = this.editor;
    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  }
});
