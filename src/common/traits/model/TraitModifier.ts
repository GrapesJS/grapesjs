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
    if (!this.updatingValue) {
      this.initChildren();
      this.view?.onUpdateEvent(this.value, true);
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
}
