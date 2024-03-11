// import EditorModel from '../../../../editor/model/Editor';
// import { SelectOption } from '../../view/TraitSelectView';
// import Trait from '../Trait';
// import TraitListUnique from '../TraitListUnique';
// import TraitModifier from '../TraitModifier';
// import { jsModifier, jsVariable } from '../TraitModifierJs';
// import TraitObject from '../TraitObject';
// import TraitObjectItem from '../TraitObjectItem';
// import TraitParent from '../TraitParent';
// import TraitVariable from './TraitVariable';

// export default class TraitSlots extends TraitListUnique{
//   constructor(target: Trait<Record<string, { componentId: string; name: string, params: Record<string, string> }>>) {
//     super(target);
//     target.opts.editable = false;
//   }

//   private getComponentWithSignals(em: EditorModel): SelectOption[] {
//     return Object.entries(em.Components.componentsById)
//       .filter(([id, comp]) => Object.keys(comp.scriptSubComp?.signals ?? {}).length > 0)
//       .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));
//   }

//   private getSignalNames(compId: string) {
//     return (em: EditorModel): SelectOption[] => {
//       const component = em.Components.getById(compId);
//       return component ? Object.keys(component.scriptSubComp?.signals) : [];
//     };
//   }

//   protected initChildren() {
//     const { target } = this;
//     const data = Object.values(target.em.Components.componentsById)[0];
//     const compId = target.value?.componentId ?? data?.id;

//     const paramsTrait =        
//     new TraitObjectItem('params', this, {
//       type: 'unique-list',
//       traits: {type: 'variable'},
//       noLabel: true,
//       editable: false,
//       width: 100,
//     })
//     return [
//       new TraitObjectItem(
//         'componentId',
//         this,
//         { type: 'select', options: this.getComponentWithSignals, default: data?.id, noLabel: true, width: 50 },
//         this.onComponentIdChange
//       ),
//       new TraitObjectItem('name', this, {
//         type: 'select',
//         options: this.getSignalNames(compId),
//         noLabel: true,
//         width: 50,
//       },this.onSignalChange(paramsTrait)),
//       paramsTrait
//     ];
//   }

//   private onComponentIdChange(value: string) {
//     // this.setValueFromModel();
//   }

//   private onSignalChange(trait: TraitObjectItem){
//     return (value: { componentId: string; name: string, params: Record<string, string> }) =>{
//       const {componentId, name} = value;
//       if (componentId && name){
//         const selected = trait.em.Components.getById(componentId).scriptSubComp?.signals[name] ?? {};
//         trait.value = Object.fromEntries(Object.keys(selected.params ?? {}).map(name => [name, '']));
//         // trait.setValueFromModel();
//         (trait.target as TraitParent).childrenChanged();
//         // trait.target.setValueFromModel();
//         console.log("setParams1", trait.value)
//         console.log("setParams2", trait)
//       }
//       // trait.value = 
//     // this.setValueFromModel();
//     }
//   }

//   protected overrideValue(value: Record<string, { componentId: string; name: string, params: Record<string, any> }>) {
//     console.log(value);
//     console.log('/////////////////////////////////////////////////');

//     // const {componentId, slot} = value;
//     // if (componentId && slot){
//     //   const selected = this.em.Components.getById(componentId).slots[slot]
//     //   value.params = Object.fromEntries(Object.keys(selected.params).map(name => [name, '']))
//     // }
//     const {componentId, name, params = {}} = value;
//     // const targetSlot = em.Components.getById(componentId).scriptSubComp!.slots[slot]
//     // const data = Object.entries(params).map(([name, param]) => `'${name}': ${TraitVariable.renderJs(param)}`).join(",")
//     console.log("setParams", value)
//     return jsModifier(
//       jsVariable(
//         Object.entries(value).map(([k, slot]) => `'${k}': ${(slot.componentId && slot.name &&
//             `window.globalScriptParams['${slot.componentId}'].el?.addEventListener('${slot.name}', window.globalScriptParams['${this.component.getId()}'].slots['${k}']);`) ||
//             '() => {}'
//         }`).join()
//       )
//     )(value);
//   }

//   protected setValue(value: Record<string, { componentId: string; name: string, params: Record<string, string> }>): void {
//     super.setValue(this.overrideValue(value));
//     const variablesTrait = this.children.find(tr => tr.name == 'slot');
//     if (variablesTrait) {
//       const compId = value?.componentId;
//       if (compId) {
//         variablesTrait.opts.options = this.getSignalNames(compId);
//         variablesTrait.onUpdateEvent();
//       }
//     }
//     this.onUpdateEvent();
//   }
// }
