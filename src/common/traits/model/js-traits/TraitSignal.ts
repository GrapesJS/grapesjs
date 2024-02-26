import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export default class TraitSignal extends TraitObject<{ componentId: string; slot: string }> {
  constructor(target: Trait<{ componentId: string; slot: string }>) {
    super(target);
    // target.opts.type = "object"
    target.opts.editable = false;
  }
  // eventNameTrait!: TraitObjectItem

  protected initChildren() {
    const { target } = this;

    const compOptions = Object.entries(target.em.Components.componentsById)
      .filter(([id, comp]) => Object.keys(comp.slots).length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));

    const data = Object.values(target.em.Components.componentsById)[0];
    let options: any[] = [];
    const compId = target.value?.componentId ?? data?.id;
    if (compId) {
      console.log(compId);
      const wrapper = target.em.Components.getById(compId);
      options = wrapper.scriptEvents.map(variable => variable.id);
    }
    // this.eventNameTrait = new TraitObjectItem("eventName", this, {type: "select", options, noLabel: true, width: 50})
    return [
      new TraitObjectItem(
        'componentId',
        this,
        { type: 'select', options: compOptions, default: data?.id, noLabel: true, width: 50 },
        this.onComponentIdChange
      ),
      new TraitObjectItem('slot', this, { type: 'select', options, noLabel: true, width: 50 }),
    ];
  }
  private onComponentIdChange(value: string) {
    this.setValueFromModel();
  }
  protected overrideValue(value: { componentId: string; slot: string }) {
    console.log(value);
    console.log('/////////////////////////////////////////////////');
    return jsModifier(
      jsVariable(
        (value?.componentId &&
          value?.slot &&
          `(callback) => window.globalSlots['${value.componentId}']['${value.slot}']()`) ||
          '() => {}'
      )
    )(value);
  }

  // private static renderJs(value: {componentId: string, eventName: string}){
  //     console.log("asdfasdf", value?.componentId && value?.eventName && `(callback) => window.globalEvents['${value.componentId}']['${value.eventName }'].subscribe('test', callback)` || '() => {}')
  //     return value?.componentId && value?.eventName && `(callback) => window.globalEvents['${value.componentId}']['${value.eventName }'].subscribe('test', callback)` || '() => {}'
  //   }

  protected setValue(value: { componentId: string; slot: string }): void {
    super.setValue(value);
    console.log('qwertqwert', this.children);
    const variablesTrait = this.children.find(tr => tr.name == 'slot');
    console.log('qwertqwert', variablesTrait);
    if (variablesTrait) {
      const compId = value?.componentId;
      if (compId) {
        console.log('qwertqwert', compId);
        const wrapper = this.em.Components.getById(compId);
        console.log('qwertqwert', wrapper);
        console.log('qwertqwert', Object.keys(wrapper.slots));
        variablesTrait.opts.options = Object.keys(wrapper.slots);
        variablesTrait.view?.onUpdateEvent(this.value, true);
      }
    }
  }
}
