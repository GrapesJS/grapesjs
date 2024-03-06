import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export default class TraitSignal extends TraitObject<{ componentId: string; slot: string }> {
  constructor(target: Trait<{ componentId: string; slot: string }>) {
    super(target);
    target.opts.editable = false;
  }

  private getComponentWithSlots(em: EditorModel): SelectOption[] {
    return Object.entries(em.Components.componentsById)
      .filter(([id, comp]) => Object.keys(comp.slots).length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));
  }

  private getSlotNames(compId: string) {
    return (em: EditorModel): SelectOption[] => {
      const component = em.Components.getById(compId);
      return component ? Object.keys(component.scriptSubComp?.get('slots')) : [];
    };
  }

  protected initChildren() {
    const { target } = this;
    const data = Object.values(target.em.Components.componentsById)[0];
    const compId = target.value?.componentId ?? data?.id;
    return [
      new TraitObjectItem(
        'componentId',
        this,
        { type: 'select', options: this.getComponentWithSlots, default: data?.id, noLabel: true, width: 50 },
        this.onComponentIdChange
      ),
      new TraitObjectItem('slot', this, {
        type: 'select',
        options: this.getSlotNames(compId),
        noLabel: true,
        width: 50,
      }),
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

  protected setValue(value: { componentId: string; slot: string }): void {
    super.setValue(value);
    const variablesTrait = this.children.find(tr => tr.name == 'slot');
    if (variablesTrait) {
      const compId = value?.componentId;
      if (compId) {
        variablesTrait.opts.options = this.getSlotNames(compId);
        variablesTrait.onUpdateEvent();
      }
    }
    this.onUpdateEvent();
  }
}
