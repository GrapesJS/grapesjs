import { isString, isArray } from 'underscore';
import { AddOptions, Collection } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import Trait, { TraitProperties } from './Trait';
import TraitFactory from './TraitFactory';

export default class Traits extends Collection<Trait> {
  em: EditorModel;
  target!: Component;

  constructor(coll: TraitProperties[], options: { em: EditorModel }) {
    super(coll);
    this.em = options.em;
    this.listenTo(this, 'add', this.handleAdd);
    this.listenTo(this, 'reset', this.handleReset);
  }

  handleReset(coll: TraitProperties[], { previousModels = [] }: { previousModels?: Trait[] } = {}) {
    previousModels.forEach(model => model.trigger('remove'));
  }

  handleAdd(model: Trait) {
    model.em = this.em;
    const target = this.target;

    if (target) {
      model.target = target;
    }
  }

  setTarget(target: Component) {
    this.target = target;
  }

  /** @ts-ignore */
  add(models: string | Trait | TraitProperties | (string | Trait | TraitProperties)[], opt?: AddOptions) {
    const em = this.em;

    // Use TraitFactory if necessary
    if (isString(models) || isArray(models)) {
      const tm = em && em.get! && em.Traits;
      const tmOpts = tm && tm.getConfig();
      const tf = TraitFactory(tmOpts);

      if (isString(models)) {
        models = [models];
      }

      for (var i = 0, len = models.length; i < len; i++) {
        const str = models[i];
        const model = isString(str) ? tf.build(str)[0] : str;
        model.target = this.target;
        models[i] = model as Trait;
      }
    }

    return Collection.prototype.add.apply(this, [models as Trait[], opt]);
  }
}

Traits.prototype.model = Trait;
