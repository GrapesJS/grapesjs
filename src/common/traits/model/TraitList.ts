import { isArray } from 'underscore';
import Trait from './Trait';
import TraitFactory from './TraitFactory';
import TraitListItem from './TraitListItem';
import TraitParent from './TraitParent';

export default class TraitList extends TraitParent<any[]> {
  constructor(target: Trait<any[]>) {
    target.opts.changeProp = true;
    super(target);
    if (!isArray(this.value)) {
      this.value = [];
    }
  }

  protected initChildren() {
    console.log(this.value);
    return this.value?.map((value, index) => {
      return TraitFactory.buildNestedTraits(new TraitListItem(index, this, this.target.templates as any));
    });
  }
}
