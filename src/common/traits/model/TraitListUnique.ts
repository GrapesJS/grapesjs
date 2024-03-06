import { isObject } from 'underscore';
import Trait from './Trait';
import TraitFactory from './TraitFactory';
import TraitObjectItem from './TraitObjectItem';
import TraitParent from './TraitParent';

export default class TraitListUnique extends TraitParent<{ [id: string]: any }> {
  constructor(target: Trait<{ [id: string]: any }>) {
    target.opts.changeProp = true;
    super(target);
    console.log(this.value);
    if (!isObject(this.value)) {
      this.value = {};
    }
  }

  protected initChildren() {
    return Object.keys(this.value).map(id => {
      // const opts = isArray(trait.templates) ? trait.templates.find(tr => tr.name ==id) : trait.templates;
      return TraitFactory.buildNestedTraits(new TraitObjectItem(id, this, this.target.templates));
    });
  }

  add(name: string) {
    console.log('qwerr', name);
    if (typeof this.value[name] == 'undefined') {
      this.children.push(
        TraitFactory.buildNestedTraits(new TraitObjectItem(name, this.target, this.target.opts.traits))
      );
    }
    this.onUpdateEvent();
  }

  remove(name: string) {
    console.log('qwerr', name);
    const { value } = this;
    if (typeof value[name] != 'undefined') {
      delete value[name];
      this.value = value;
    }
    this.onUpdateEvent();
  }
}
