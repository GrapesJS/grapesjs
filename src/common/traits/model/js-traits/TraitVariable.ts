import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export type VariableType =
  | { variableType: 'global'; data: { componentId: string; name: string } }
  | { variableType: 'parameter'; data: { default: string } };

export default class TraitVariable extends TraitObject<VariableType> {
  constructor(target: Trait<VariableType>) {
    super(target);
    target.opts.editable = false;
    // const variableType = this.value.variableType ??  'parameter';
    // const data = this.value.data
    // this.value = {variableType: 'parameter', ...this.value}
  }

  private getComponentWithVariables(em: EditorModel): SelectOption[] {
    return Object.entries(em.Components.componentsById)
      .filter(([id, comp]) => Object.keys(comp.scriptSubComp?.variables).length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));
  }

  private getVariableNames(compId: string) {
    return (em: EditorModel): SelectOption[] => {
      const component = em.Components.getById(compId);
      return component ? Object.keys(component.scriptSubComp?.variables) : [];
    };
  }

  protected initChildren() {
    const { target } = this;
    // const data = Object.values(target.em.Components.componentsById)[0];
    // const compId = target.value?.componentId ?? data?.id;
    const typeSelection = new TraitObjectItem('variableType', this, {
      type: 'select',
      options: ['parameter', 'global', 'fixed'],
      default: 'parameter',
      noLabel: true,
      width: 100,
    });
    typeSelection.value = typeSelection.value;
    console.log('setValueinitChildren', '');
    console.log('setValueValue', typeSelection.value);
    return [typeSelection, ...this.selectedTraits(typeSelection.value)];
  }

  private selectedTraits(selectedType: 'parameter' | 'global' | 'fixed') {
    const dataTrait = new TraitObjectItem('data', this, { type: 'object', noLabel: true, width: 100 });
    dataTrait.value = {};
    switch (selectedType) {
      case 'parameter':
        return [new TraitObjectItem('default', dataTrait, { type: 'text', default: '', width: 100 })];
      case 'global':
        return [
          new TraitObjectItem('componentId', dataTrait, {
            type: 'select',
            options: this.getComponentWithVariables,
            noLabel: true,
            width: 50,
          }),
          new TraitObjectItem('name', dataTrait, { type: 'select', options: [], noLabel: true, width: 50 }),
        ];
      case 'fixed':
        return [];
      default:
        return [];
    }
  }

  private static onVariableTypeChange(tr: TraitVariable) {
    return () => {
      console.log('setValue', 'onVariableTypeChange');
      console.log('setValue', tr.children);
      console.log('setValue', tr);
      // tr.childrenChanged();
      // tr.setValueFromModel();
    };
  }

  //   protected overrideValue(value: { componentId: string; name: string }) {
  //     console.log(value);
  //     console.log('/////////////////////////////////////////////////');
  //     return jsModifier(
  //       jsVariable(
  //         (value?.componentId &&
  //           value?.name &&
  //           `(callback) => window.globalVariables['${value.componentId}']['${value.name}']`) ||
  //           'undefined'
  //       )
  //     )(value);
  //   }

  protected setValue(value: VariableType): void {
    if (this.value.variableType != value.variableType) {
      console.log('setValuechildrenChanged', value);
      this.childrenChanged();
    }
    super.setValue(value);
    console.log('setValue', this.children);
    // this.setValueFromModel();
    const variablesTrait = this.children.find(tr => tr.name == 'name');
    if (variablesTrait && value.variableType == 'global') {
      console.log('setValueValue', value);
      const compId = value.data?.componentId;
      if (compId) {
        variablesTrait.opts.options = this.getVariableNames(compId);
        variablesTrait.onUpdateEvent();
      }
    }
    this.onUpdateEvent();
  }

  static renderJs(value: VariableType, paramJsName: string) {
    switch (value?.variableType) {
      case 'parameter':
        return `${paramJsName} ?? '${value.data?.default}'`;
      case 'global':
        return `window.globalScriptParams['${value.data?.componentId}'].vars['${value.data?.name}']`;
      // case 'fixed':
      //     return 'undefined'
      default:
        return 'undefined';
    }
  }
}
