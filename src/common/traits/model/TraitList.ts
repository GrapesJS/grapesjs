import { isArray } from 'underscore';
import Trait from './Trait';
import TraitFactory from './TraitFactory';
import TraitListItem from './TraitListItem';
import TraitModifier from './TraitModifier';

export default class TraitList extends TraitModifier<any[]> {
  constructor(target: Trait<any[]>) {
    target.opts.changeProp = true;
    super(target);
    if (!isArray(this.value)) {
      this.target.value = [];
    }
  }

  protected initChildren() {
    console.log(this.value);
    return this.value?.map((value, index) => {
      return TraitFactory.buildNestedTraits(new TraitListItem(index, this, this.target.templates as any));
    });
  }

  protected overrideValue(value: any[]) {
    return value;
  }
}
