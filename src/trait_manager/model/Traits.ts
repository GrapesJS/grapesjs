import { isArray } from 'underscore';
import { CollectionWithCategories } from '../../abstract/CollectionWithCategories';
import { AddOptions } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import Trait, { TraitProperties } from './Trait';
import TraitFactory from './TraitFactory';
import Categories from '../../abstract/ModuleCategories';
import TraitManager from '..';

export default class Traits extends CollectionWithCategories<Trait> {
  em: EditorModel;
  target!: Component;
  tf: TraitFactory;
  categories = new Categories();

  constructor(coll: TraitProperties[], options: { em: EditorModel }) {
    super(coll);
    this.em = options.em;
    this.on('add', this.handleAdd);
    this.on('reset', this.handleReset);
    const tm = this.module;
    const tmOpts = tm?.getConfig();
    this.tf = new TraitFactory(tmOpts);
  }

  get module(): TraitManager {
    return this.em.Traits;
  }

  getCategories() {
    return this.categories;
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

    this.initCategory(model);
  }

  setTarget(target: Component) {
    this.target = target;
    this.models.forEach(trait => trait.setTarget(target));
  }

  add(model: string | TraitProperties | Trait, options?: AddOptions): Trait;
  add(models: Array<string | TraitProperties | Trait>, options?: AddOptions): Trait[];
  add(models: unknown, opt?: AddOptions): any {
    if (models == undefined) {
      return undefined;
    }
    const { target, em } = this;

    if (isArray(models)) {
      var traits: Trait[] = [];
      for (var i = 0, len = models.length; i < len; i++) {
        const trait = models[i];
        traits[i] = trait instanceof Trait ? trait : this.tf.build(trait, em);
        traits[i].setTarget(target);
      }
      return super.add(traits, opt);
    }
    const trait = models instanceof Trait ? models : this.tf.build(models as any, em);
    trait.setTarget(target);

    return super.add(trait, opt);
  }
}
