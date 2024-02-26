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
// import TraitModifierJs, { jsFunction } from '../model/TraitModifierJs';

// export interface TraitAjaxViewOpts extends TraitObjectViewOpts<'ajax'> {
//   variables?: string[];
// }

// const traits = [ {type: "text", name: "componentId" }, {type: "select", name: "variableName", options: [""]}]
// export default class TraitAjaxView extends TraitsView{
//   type: string = 'ajax';
//   defaultDataId: string[] = [];

//   get clsLabel() {
//     const { ppfx } = this;
//     return `${ppfx}field`;
//   }

//   constructor(em: EditorModel, opts?: TraitAjaxViewOpts) {
//       //@ts-ignore
//     super(em, {...opts, type: 'ajax'});
//   }

//   private renderJs(value: {url: string, dataSrc?: string}){
//     const dataSrc = value?.dataSrc
//     console.log(value)
//     console.log("/////////////////////////////////////////////////")
//     const dataFn = (dataSrc) ? `data['${dataSrc}']` :'data';
//     return `function(){
//         let savedOpts = {url: ${value.url}};
//         let result;
//         return function(callback, opts){
//           if (typeof result === "undefined" || JSON.stringify({...opts, url: ${value.url}}) != JSON.stringify(savedOpts)){
//             savedOpts = opts;
//             result = $.get(${value.url})
//           }
//           result.done((data) => callback(${dataFn}, data))
//           return result;
//         }
//       }()`
//   }

//   //(function(callback){window.${ccid}ScopedVariables['${id}']().done((data)=>callback(${dataFn}))
// //   setParentValue(name: string, value: any): void {
// //     const values = {...this.target.value, [name]: value};
// //     const { _renderJs } = this
// //     this.target.value = {...values, _renderJs, _type: 'function', dataIds: []};

// //   }

//   get traits() {
//       console.log(";alkjl;kjlkjkoljkldkjfke")
//      const data = this.em.Canvas.getCanvasView().getFrameView()?.getWrapper()
//      console.log(this.em.Components)
//      const compOptions = Object.entries(this.em.Components.componentsById).filter(([id, comp]) => comp.get("script-global").length > 0)
//      .map(([id, comp]) => ({value: id, name: `${comp.getName()}-${id}`}) )
//      console.log(compOptions)
//      const targetJsModifier = new TraitModifierJs(this.target, jsFunction(this.renderJs))
//     return [new TraitObject( "url", targetJsModifier, {type: "url"}),
//             new TraitObject( "dataSrc", targetJsModifier, {type: "text", default: 'data'})]
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
