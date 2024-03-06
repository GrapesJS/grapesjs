import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export default class TraitDataLink extends TraitObject<{ componentId: string; variableName: string }> {
  constructor(target: Trait<{ componentId: string; variableName: string }>) {
    super(target);
    target.opts.type = 'object';
    target.opts.editable = false;
  }

  protected initChildren() {
    const { target } = this;
    //const data = trait.em.Canvas.getCanvasView().getFrameView()?.getWrapper()
    const data = Object.values(target.em.Components.componentsById)[0];
    console.log('fon', data);
    const compOptions = Object.entries(target.em.Components.componentsById)
      .filter(([id, comp]) => comp.get('script-global').length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));

    let options: any[] = [];
    const compId = target.value?.componentId ?? data?.id;
    if (compId) {
      console.log(compId);
      const wrapper = target.em.Components.getById(compId);
      // options = wrapper.globalVariables.map(variable => variable.id);
    }

    //    return [new TraitObject( "componentId", targetJsModifier, {type: "select", options: compOptions,  default: data?.id, noLabel: true, width: 50}),
    //            new TraitObject( "variableName", targetJsModifier, {type: "select", options, noLabel: true, width: 50})]
    return [
      new TraitObjectItem('componentId', this, {
        type: 'select',
        options: compOptions,
        default: data?.id,
        noLabel: true,
        width: 50,
      }),
      new TraitObjectItem('variableName', this, { type: 'select', options, noLabel: true, width: 50 }),
    ];
  }

  protected overrideValue(value: { componentId: string; variableName: string }) {
    console.log(value);
    console.log('/////////////////////////////////////////////////');
    return jsModifier(
      jsVariable(
        (value?.componentId &&
          value?.variableName &&
          `window.${value?.componentId}ScopedVariables${value?.variableName ? `['${value?.variableName}']` : ''}`) ||
          'undefined'
      )
    )(value);
  }

  protected setValue(value: { componentId: string; variableName: string }): void {
    super.setValue(value);
    const variablesTrait = this.target.children.find(tr => tr.opts.name == 'variableName');
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
