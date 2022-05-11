import { AddOptions } from 'backbone';
import { isString, isArray } from 'underscore';
import { Collection } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Trait from './Trait';
import TraitFactory from './TraitFactory';

export default class Traits extends Collection<Trait> {

  em: EditorModel;
  target?: any;
  constructor(coll: any, options:any = {}) {
    super(coll);
    this.em = options.em;
    this.listenTo(this, 'add', this.handleAdd);
    this.listenTo(this, 'reset', this.handleReset);
  }

  handleReset(coll: any, { previousModels = [] as Trait[] } = {}) {
    previousModels.forEach(model => model.trigger('remove'));
  }

  handleAdd(model: Trait) {
    model.em = this.em;
    const target = this.target;

    if (target) {
      model.target = target;
    }
  }

  setTarget(target: any) {
    this.target = target;
  }

  add(model: {} | Trait, options?: AddOptions): Trait;
  add(models: Array<{} | Trait>, options?: AddOptions): Trait[];
  add(models: unknown, opt?: AddOptions): any {
    const em = this.em;

    // Use TraitFactory if necessary
    if (isString(models) || isArray(models)) {
      const tm = em && em.get && em.get('TraitManager');
      const tmOpts = tm && tm.getConfig();
      const tf = new TraitFactory(tmOpts);

      if (isString(models)) {
        models = [models] as any[];
      }
      if (isArray(models)){
      const traits: Trait[] =[]
      for (var i = 0, len = models.length; i < len; i++) {
        const str = models[i];
        const model = isString(str) ? tf.build(str)[0] : str;
        const trait = model instanceof Trait ? model : new Trait(model as any)
        trait.target = this.target;
        traits[i] = trait;
      }
      return super.add(traits, opt);
    }
    }
    return super.add(models instanceof Trait ? models : new Trait(models as any), opt);
    
  }
};
