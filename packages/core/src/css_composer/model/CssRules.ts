import CollectionWithPatches from '../../patch_manager/CollectionWithPatches';
import EditorModel from '../../editor/model/Editor';
import CssRule, { CssRuleProperties } from './CssRule';

export default class CssRules extends CollectionWithPatches<CssRule> {
  editor: EditorModel;

  constructor(props: any, opt: any) {
    const em: EditorModel = opt?.em || opt?.editor;
    super(props, { ...opt, em, patchObjectType: 'css-rules', collectionId: opt?.collectionId || 'global' });
    // Inject editor
    this.editor = em;

    // This will put the listener post CssComposer.postLoad
    setTimeout(() => {
      this.on('remove', this.onRemove);
      this.on('add', this.onAdd);
    });
  }

  toJSON(opts?: any) {
    const result = CollectionWithPatches.prototype.toJSON.call(this, opts);
    return result.filter((rule: CssRuleProperties) => rule.style && !rule.shallow);
  }

  onAdd(model: CssRule, c: CssRules, o: any) {
    model.ensureSelectors(model, c, o); // required for undo
  }

  onRemove(removed: CssRule) {
    const em = this.editor;
    em.stopListening(removed);
    em.UndoManager.remove(removed);
  }

  /** @ts-ignore */
  add(models: any, opt: any = {}) {
    if (typeof models === 'string') {
      models = this.editor.get('Parser').parseCss(models);
    }
    opt.em = this.editor;
    return CollectionWithPatches.prototype.add.apply(this, [models, opt]);
  }
}

CssRules.prototype.model = CssRule;
