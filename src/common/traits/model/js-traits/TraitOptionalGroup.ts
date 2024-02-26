import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export default class TraitOptionalGroup extends TraitObject<{ type: string; _js: string }> {
  constructor(target: Trait<{ type: string; _js: string }>) {
    super(target);
    target.opts.type = 'object';
    target.opts.editable = false;
    target.opts.changeProp = true;

    //const data = trait.em.Canvas.getCanvasView().getFrameView()?.getWrapper()
    const data = Object.values(target.em.Components.componentsById)[0];
    console.log('fon', data);
    const compOptions = (this.templates as any[]).map(({ name, title }) => ({ value: name, name: title ?? name }));

    let options: any[] = [];
    const compId = target.value?.type ?? data?.id;
    if (compId) {
      console.log(compId);
      const wrapper = target.em.Components.getById(compId);
      options = wrapper.scriptEvents.map(variable => variable.id);
    }
    this.children = [
      new TraitObjectItem('type', this, {
        type: 'select',
        options: compOptions,
        default: data?.id,
        noLabel: true,
        width: 50,
      }),
      new TraitObjectItem('value', this, { type: 'object', options, default: data?.id, noLabel: true, width: 50 }),
    ];
    //    return [new TraitObject( "componentId", targetJsModifier, {type: "select", options: compOptions,  default: data?.id, noLabel: true, width: 50}),
    //            new TraitObject( "variableName", targetJsModifier, {type: "select", options, noLabel: true, width: 50})]
    target.children = [
      new TraitObjectItem('componentId', this, {
        type: 'select',
        options: compOptions,
        default: data?.id,
        noLabel: true,
        width: 50,
      }),
      new TraitObjectItem('eventName', this, { type: 'select', options, noLabel: true, width: 50 }),
    ];
  }
  protected initChildren() {
    const { target } = this;

    return [
      new TraitObjectItem('urlRaw', this, { type: 'text', label: 'url' }),
      new TraitObjectItem('variables', this, {
        type: 'unique-list',
        traits: { type: 'link' },
        label: false,
        editable: false,
      }),
    ];
  }

  protected overrideValue(value: { type: string; _js: string }) {
    console.log(value);
    console.log('/////////////////////////////////////////////////');
    return value; //jsModifier(jsVariable(value?.componentId && value?.eventName && `(callback) => window.globalEvents['${value.componentId}']['${value.eventName }'].subscribe('test', callback)` || '() => {}'))(value)
  }

  // private static renderJs(value: {type: string, _js: string}){
  //     return value?.componentId && value?.eventName && `(callback) => window.globalEvents['${value.componentId}']['${value.eventName }'].subscribe('test', callback)` || '() => {}'
  //   }

  protected setValue(value: { type: string; _js: string }): void {
    super.setValue(value);
    const variablesTrait = this.target.children.find(tr => tr.opts.name == 'eventName');
    if (variablesTrait) {
      const compId = value?.type;
      if (compId) {
        console.log(compId);
        const wrapper = this.em.Components.getById(compId);
        variablesTrait.opts.options = wrapper.globalVariables.map(variable => variable.id);
        this.target.view?.onUpdateEvent(this.value, true);
      }
    }
  }
}
