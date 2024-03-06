import Trait from './Trait';

export default abstract class TraitModifier<TraitValueType> extends Trait<TraitValueType> {
  target: Trait<TraitValueType>;
  protected abstract overrideValue(value: TraitValueType): any;

  constructor(target: Trait<TraitValueType>) {
    super(target.opts);
    this.target = target;
    this.value = this.value;
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
    this.target.value = this.overrideValue(value);
    console.log('sss', this.target.value);
  }

  refreshTrait() {
    const children = this.initChildren();
    console.log(
      'setValueRefreshTrait',
      this.children.map(tr => tr.name).toString(),
      children.map(tr => tr.name).toString()
    );
    if (this.children.map(tr => tr.name).toString() != children.map(tr => tr.name).toString()) {
      this.children = children;
      // this.view?.onUpdateEvent(this.value, true);
    }
    console.log('setValueFromModel', this.children);
  }
}
