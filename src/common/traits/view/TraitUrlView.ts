// import CodeMirrorEditor from '../../../code_manager/model/CodeMirrorEditor';
// import EditorModel from '../../../editor/model/Editor';
// import Trait from '../model/Trait';
// import TraitInputView, { TraitInputViewOpts } from './TraitInputView';
// import { EditorState } from '@codemirror/state';
// import { isString, isUndefined, values } from 'underscore';
// import TraitTextView from './TraitTextView';
// import TraitsView from './TraitsView';
// import ComponentWrapper from '../../../dom_components/model/ComponentWrapper';
// import TraitObject from '../model/TraitObject';
// import TraitModifierJs, { jsVariable } from '../model/TraitModifierJs';
// import TraitModifier from '../model/TraitModifier';
// import { TraitViewOpts } from './TraitView';

// export interface TraitUrlViewOpts extends TraitViewOpts<'object'> {
//   variables?: string[];
// }

// const traits = [ {type: "text", name: "componentId" }, {type: "select", name: "variableName", options: [""]}]
// export default class TraitUrlView extends TraitsView{
//   type: string = 'url';
//   defaultDataId: string[] = [];

//   private url: string = '';

//   get clsLabel() {
//     const { ppfx } = this;
//     return `${ppfx}field`;
//   }

//   constructor(em: EditorModel, opts?: TraitUrlViewOpts) {
//       //@ts-ignore
//     super(em, {...opts, type: 'object'});
//     // this.traitOps = {default: traits.reduce((acc, t) => ({ ...acc, [t.name]: ""}))}
//   }

//   getParentValue(name: string) {
//     if(name == "urlRaw"){
//         return this.target.value[name]
//     }
//     else{
//         return this.target.value.variables[name]
//     }
//   }

//   setParentValue(name: string, value: any): void {
//     let values = this.target.value;
//     console.log(this.target)
//     if(name == "urlRaw"){
//         console.log("setUrl")
//         const variableNames = TraitUrlView.parseUrlToVariables(value)
//         console.log(variableNames)
//         const oldVariables = value.variables ?? {};
//         const variables = Object.fromEntries(variableNames.map(name => [name, oldVariables[name]]))
//         console.log(variables)
//         this.target.value = {urlRaw: value, variables, _renderJs: this.renderJs};
//         this.render()
//     }
//     else{
//         const variables = values.variables
//         variables[name] = value
//         this.target.value = {...values, variables};
//     }
//     console.log(this.renderJs(this.target.value))
//   }

//   private renderJs(value: {urlRaw: string, variables: {[id: string]: string}}){
//       let url = value.urlRaw
//       console.log(value)
//       console.log(value.urlRaw)
//       const variableNames = TraitUrlView.parseUrlToVariables(value.urlRaw)
//     console.log(variableNames)
//       variableNames.forEach(name => {
//           let variable = value.variables[name] ?? ""
//           console.log(variable)
//           url = url.replaceAll(`<${name}>`, `\${${variable}}`)
//       });
//       console.log(url)
//       return "`" + url + "`"
//   }

//   private static parseUrlToVariables(url?: string): string[]{
//       return url? Array.from(url.matchAll(/(?<=<)[\w\d]+(?=>)/g),(m)=> m[0]) : []
//   }

//   get traits() {
//     //  const data = this.em.Canvas.getCanvasView().getFrameView()?.getWrapper()
//     //  let options: any[] = []
//     //  if (data?.id){
//     //  const wrapper = this.em.Components.getById(data.id) as ComponentWrapper
//     //     options = Object.keys(wrapper.data)
//     //  }
//      const variables = Object.entries(this.target.value.variables ?? {})
//         console.log(variables)
//      console.log("traits")
//      const overrideValue = (value: any) => {
//         const variableNames = TraitUrlView.parseUrlToVariables(value.urlRaw)
//         console.log(variableNames)
//         const oldVariables = value.variables ?? {};
//         const variables = Object.fromEntries(variableNames.map(name => [name, oldVariables[name]]))
//         return {...value, variables};
//     }
//     const targetJsModifier = new TraitModifierJs(this.target, jsVariable(this.renderJs))
//     const parseVariables = new TraitModifier(targetJsModifier, overrideValue)
//     parseVariables.registerForUpdateEvent(this);
//     return [new TraitObject( "urlRaw", parseVariables, {type: "text", label: "url"}),
//     new TraitObject( "variables", targetJsModifier, {type: "list", traits: {type: "link"}, label: false}),
//     // ...variables.map( ([name, value]) => {
//     //     console.log(name)
//     //     console.log(value)
//     //     return new TraitObject(name, this.target, {type: "link", label:name, value})
//     // })
// ]
//   }

//   onUpdateEvent(value: any, fromTarget: boolean): void {
//     console.log('onUpdateEvent');
//     console.log(value)
//     // const variableNames = TraitUrlView.parseUrlToVariables(value.urlRaw ?? "`")
//     // console.log(variableNames)
//     // const oldVariables = value.variables ?? {};
//     // const variables = Object.fromEntries(variableNames.map(name => [name, oldVariables[name]]))
//     // this.target.value = {...value, variables};
//     this.render();
//   }

//   onItemRender(e: any){
// console.log("itemrender")
// console.log(e)
// }

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
