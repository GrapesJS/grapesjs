import Trait from './Trait';
// import TraitFactory from './TraitFactory';

export default abstract class TraitElement<TraitValueType = any> extends Trait<TraitValueType> {
  target: Trait<TraitValueType>;

  constructor(target: Trait<TraitValueType>, opts?: any) {
    super(opts ?? target.opts);
    this.target = target;
    this.refreshTrait(true)
    target.setTraitElement(this);
  }

  abstract get name(): string

  abstract get defaultValue(): TraitValueType

  get component() {
    return this.target.component
  }

  get em() {
    return this.target.em;
  }

  protected getValue(): TraitValueType {
    return this.target.value;
  }

  protected setValue(value: TraitValueType): void {
    this.target.value = value;
  }

  refreshTrait(forced: boolean) {

  }

  triggerTraitChanged(event: string){
    this.target.triggerTraitChanged(event)
  }

  get updateEventName(){
    const {name} = this
    return this.target.updateEventName + ':' + name;
  }

  onUpdateEvent() {
    //@ts-ignore
    console.log('ChangeScriptEVENTSetInitElement', this.view, this.target?.view)
    this.view ? this.view.onUpdateEvent(this.value, true) : this.target.onUpdateEvent();
  }
}
