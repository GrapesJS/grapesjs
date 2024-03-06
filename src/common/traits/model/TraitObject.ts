import { isObject } from 'underscore';
import Trait from './Trait';
import TraitFactory from './TraitFactory';
import TraitObjectItem from './TraitObjectItem';
import TraitParent from './TraitParent';

export default class TraitObject<
  TraitValueType extends { [id: string]: any } = any
> extends TraitParent<TraitValueType> {
  constructor(target: Trait<TraitValueType>) {
    target.opts.changeProp = true;
    super(target);
    if (!isObject(this.target.value)) {
      this.value = {} as TraitValueType;
    }
  }

  protected initChildren() {
    return (this.target.templates as any[])?.map(tr => {
      return TraitFactory.buildNestedTraits(new TraitObjectItem(tr.name, this, tr));
    });
  }

  get viewType() {
    return 'object';
  }

  get editable(): boolean {
    return this.opts.editable ?? true;
  }
}
