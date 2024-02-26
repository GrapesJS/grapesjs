// import CodeMirrorEditor from '../../../code_manager/model/CodeMirrorEditor';
// import EditorModel from '../../../editor/model/Editor';
// import Trait from '../model/Trait';
// import TraitInputView, { TraitInputViewOpts } from './TraitInputView';
// import { EditorState } from '@codemirror/state';
// import { isString, isUndefined } from 'underscore';
// import TraitsView from './TraitsView';
// import TraitObjectView, { TraitObjectViewOpts } from './TraitObjectView';
// import ComponentWrapper from '../../../dom_components/model/ComponentWrapper';
// import Component from '../../../dom_components/model/Component';
// import TraitObject from '../model/TraitObject';
// import TraitModifierJs, { jsVariable } from '../model/TraitModifierJs';

// export interface TraitDataLinkViewOpts extends TraitObjectViewOpts<'link'> {
//   variables?: string[];
// }

// export default class TraitDataLinkView extends TraitsView{
//   type: string = 'link';
//   defaultDataId: string[] = [];

//   private url: string = '';

//   get clsLabel() {
//     const { ppfx } = this;
//     return `${ppfx}field`;
//   }

//   constructor(em: EditorModel, opts?: TraitDataLinkViewOpts) {
//       //@ts-ignore
//     super(em, {...opts, type: 'object'});
//   }

//   setParentValue(name: string, value: any): void {
//     const values = {...this.target.value, [name]: value};
//     const _renderJs = this.renderTargetValue(values) ?? {}
//     this.target.value = {...values, _renderJs: () => _renderJs, dataIds: []};
//     if(name == "componentId"){
//         this.render()
//     }
//   }

//   get traits() {
//       console.log(";alkjl;kjlkjkoljkldkjfke")
//      const data = this.em.Canvas.getCanvasView().getFrameView()?.getWrapper()
//      const compId = this.target.value?.componentId ?? data?.id
//      console.log(this.em.Components)
//      const compOptions = Object.entries(this.em.Components.componentsById).filter(([id, comp]) => comp.get("script-global").length > 0)
//      .map(([id, comp]) => ({value: id, name: `${comp.getName()}-${id}`}) )
//      console.log(compOptions)
//      let options: any[] = []
//      if (compId){
//          console.log(compId)
//         const wrapper = this.em.Components.getById(compId) as ComponentWrapper
//         options = wrapper.globalVariables.map(variable => variable.id)
//      }
//      const targetJsModifier = new TraitModifierJs(this.target, jsVariable(this.renderJs))
//     return [new TraitObject( "componentId", targetJsModifier, {type: "select", options: compOptions,  default: data?.id, noLabel: true, width: 50}),
//             new TraitObject( "variableName", targetJsModifier, {type: "select", options, noLabel: true, width: 50})]
//   }

//   private renderJs(value: {componentId: string, variableName: string}){
//     return value?.componentId && value?.variableName && `window.${value?.componentId}ScopedVariables${value?.variableName ? `['${value?.variableName }']` : ''}` || 'undefined'
//   }

//   private renderTargetValue(value: any){
//     const {url, em} = this;
//     console.log("updateTarget")
//     console.log(this.target.name)
//     console.log(value)

//     // this.target.value =eval(`(class {
//     //     static data = (()=>{
//     //     var data = undefined;
//     //     const url = "${url}";
//     //     var defaultOpts = {}

//     //     return function(opts) {
//     //     console.log(defaultOpts)
//     //     console.log(opts)
//     //     if (typeof data ==='undefined' || !(JSON.stringify(defaultOpts) == JSON.stringify(opts))){
//     //         console.log("defining it")
//     //         data = $.get( "https://reqres.in/api/users?page=2")//, { name: "John", time: "2pm" } )
//     //         .done(( d ) => {data = d; console.log(d)})
//     //         // console.log(ajax.responseJSON)
//     //         // data = "flaksjf"
//     //     }
//     //     console.log(data.responseJSON)
//     //     return data.responseJSON
//     // }})()
//     // })
//     // `)
//     // console.log(this.target.value.data())
//     const component = em.Components.getById(value.componentId) as ComponentWrapper
//     if (component){
//         const dataSource = component.globalVariables.find(variable => variable.id = value.variableName)
//         // const dataSource = component.renderJsDataUsage(value.variableName)
//         console.log(dataSource)
//         if(dataSource?.type == 'function'){
//           return dataSource._renderJs + "()"
//         }
//         return dataSource?._renderJs
//     }
//     return undefined
//   }

// //   templateInput() {
// //     return '';
// //   }

// //   renderField() {
// //     const { $el, variables, target, url, em } = this;
// //     const inputs = $el.find('[data-input]');
// //     const el = inputs[inputs.length - 1];
// //     // const txtarea = document.createElement('textarea');
// //     // if (isUndefined(target.value)){
// //     //     txtarea.value = `(${variables?.join(', ') ?? ''}) => { \n \n}`;
// //     // }
// //     // else if (isString(target.value)){
// //     //     txtarea.value = `(${variables?.join(', ') ?? ''}) => { \n return ${target.value}\n}`;
// //     // }
// //     // else {
// //     //     txtarea.value = target.value
// //     // }
// //     const urlTrait = new TraitGroupItem("url", this, {name: "url", value: url})
// //     const urlTraitView = new TraitTextView(em)
// //     urlTraitView.setTarget(urlTrait)
// //     el.appendChild(urlTraitView.render().el);
// //     // this.editor = new CodeMirrorEditor({
// //     //   el: txtarea,
// //     //   readOnly: false,
// //     //   lineNumbers: false,
// //     //   codeName: 'js',
// //     //   readOnlyRanges: (state: EditorState) => [
// //     //     { to: state.doc.line(1).to },
// //     //     { from: state.doc.line(state.doc.lines).from },
// //     //   ],
// //     // });

// //     // this.editor.init(txtarea);
// //     // this.editor.on('update', this.codeUpdated, this);

// //   }
// }
