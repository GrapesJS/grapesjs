import { isObject } from 'underscore';
import Trait from './Trait';
import TraitFactory from './TraitFactory';
import TraitModifier from './TraitModifier';
import TraitObjectItem from './TraitObjectItem';

export default class TraitListUnique extends TraitModifier<{ [id: string]: any }> {
  constructor(target: Trait<{ [id: string]: any }>) {
    target.opts.changeProp = true;
    super(target);
    if (!isObject(this.value)) {
      this.target.value = {};
    }
  }

  protected initChildren() {
    return Object.keys(this.value).map(id => {
      // const opts = isArray(trait.templates) ? trait.templates.find(tr => tr.name ==id) : trait.templates;
      return TraitFactory.buildNestedTraits(new TraitObjectItem(id, this, this.target.templates));
    });
  }

  protected overrideValue(value: any[]) {
    return value;
  }

  add(name: string) {
    console.log('qwerr', name);
    if (typeof this.value[name] == 'undefined') {
      this.children.push(
        TraitFactory.buildNestedTraits(new TraitObjectItem(name, this.target, this.target.opts.traits))
      );
    }
  }
}
