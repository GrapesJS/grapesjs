import Trait from './Trait';

export default abstract class TraitParent<TraitValueType = any> extends Trait<TraitValueType> {
  target: Trait<TraitValueType>;
  private updateChildren: boolean = false;

  constructor(target: Trait<TraitValueType>) {
    super(target.opts);
    this.target = target;
    this.children = this.initChildren();
  }

  get name(): string {
    return this.target.name;
  }

  protected initChildren(): Trait[] {
    return [];
  }

  setValueFromModel() {
    console.log('setValueFromModel', this.updatingValue);
    if (!this.updatingValue) {
      this.children.forEach((tr, index) => delete this.children[index]);
      this.children = [];
      this.children = this.initChildren();
      console.log('setValueFromModel', this.children);
      this.onUpdateEvent();
    }
  }

  get em() {
    return this.target.em;
  }

  protected getValue(): TraitValueType {
    return this.target.value;
  }

  protected setValue(value: TraitValueType): void {
    console.log('urlTestTriggerParent', value);
    this.target.value = value;
  }

  refreshTrait() {
    console.log('setValueFromModel1', this.children);
    if (this.updateChildren) {
      this.updateChildren = false;
      console.log('setValueFromModel2', this.children);
      this.children.forEach((tr, index) => delete this.children[index]);
      this.children = [];
      this.children = this.initChildren();
      console.log('setValueinitChildren', this.children);
      console.log('setValueFromModel3', this.children);
      this.onUpdateEvent();
    }
    console.log('setValueFromModel4', this.children);
  }

  childrenChanged() {
    this.updateChildren = true;
  }

  //   onUpdateEvent(){
  //     this.target.onUpdateEvent();
  //   }
}
