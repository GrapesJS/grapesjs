import { Collection } from '../../common';
import CssRule from './CssRule';

export default class CssRules extends Collection {
  initialize(models, opt) {
    // Inject editor
    if (opt && opt.em) this.editor = opt.em;

    // This will put the listener post CssComposer.postLoad
    setTimeout(() => {
      this.on('remove', this.onRemove);
      this.on('add', this.onAdd);
    });
  }

  toJSON(opts) {
    const result = Collection.prototype.toJSON.call(this, opts);
    return result.filter(rule => rule.style && !rule.shallow);
  }

  onAdd(model, c, o) {
    model.ensureSelectors(model, c, o); // required for undo
  }

  onRemove(removed) {
    const em = this.editor;
    em.stopListening(removed);
    em.get('UndoManager').remove(removed);
  }

  add(models, opt = {}) {
    if (typeof models === 'string') {
      models = this.editor.get('Parser').parseCss(models);
    }
    opt.em = this.editor;
    return Collection.prototype.add.apply(this, [models, opt]);
  }
}

CssRules.prototype.model = CssRule;
