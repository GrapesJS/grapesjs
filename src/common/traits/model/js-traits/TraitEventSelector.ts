import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export default class TraitEventSelector extends TraitObject<{ componentId: string; eventName: string }> {
  constructor(target: Trait<{ componentId: string; eventName: string }>) {
    super(target);
    // target.opts.type = "object"
    target.opts.editable = false;
  }
  // eventNameTrait!: TraitObjectItem

  protected initChildren() {
    const { target } = this;

    const compOptions = Object.entries(target.em.Components.componentsById)
      .filter(([id, comp]) => comp.get('script-events').length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));

    const data = Object.values(target.em.Components.componentsById)[0];
    let options: any[] = [];
    const compId = target.value?.componentId ?? data?.id;
    if (compId) {
      console.log(compId);
      const wrapper = target.em.Components.getById(compId);
      // options = wrapper.scriptEvents.map(variable => variable.id);
    }
    // this.eventNameTrait = new TraitObjectItem("eventName", this, {type: "select", options, noLabel: true, width: 50})
    return [
      new TraitObjectItem(
        'componentId',
        this,
        { type: 'select', options: compOptions, default: data?.id, noLabel: true, width: 50 },
        this.onComponentIdChange
      ),
      new TraitObjectItem('eventName', this, { type: 'select', options, noLabel: true, width: 50 }),
    ];
  }
  private onComponentIdChange(value: string) {
    this.setValueFromModel();
  }
  protected overrideValue(value: { componentId: string; eventName: string }) {
    console.log(value);
    console.log('/////////////////////////////////////////////////');
    return jsModifier(
      jsVariable(
        (value?.componentId &&
          value?.eventName &&
          `(callback) => window.globalEvents['${value.componentId}']['${value.eventName}'].subscribe('test', callback)`) ||
          '() => {}'
      )
    )(value);
  }

  // private static renderJs(value: {componentId: string, eventName: string}){
  //     console.log("asdfasdf", value?.componentId && value?.eventName && `(callback) => window.globalEvents['${value.componentId}']['${value.eventName }'].subscribe('test', callback)` || '() => {}')
  //     return value?.componentId && value?.eventName && `(callback) => window.globalEvents['${value.componentId}']['${value.eventName }'].subscribe('test', callback)` || '() => {}'
  //   }

  protected setValue(value: { componentId: string; eventName: string }): void {
    super.setValue(value);
    const variablesTrait = this.target.children.find(tr => tr.opts.name == 'eventName');
    if (variablesTrait) {
      const compId = value?.componentId;
      if (compId) {
        console.log(compId);
        const wrapper = this.em.Components.getById(compId);
        // variablesTrait.opts.options = wrapper.globalVariables.map(variable => variable.id);
        this.target.onUpdateEvent();
      }
    }
  }
}
