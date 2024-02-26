import { any, isArray, isFunction, isObject, isString } from 'underscore';
import { Model } from '..';
import EditorModel from '../../editor/model/Editor';
import TraitRoot from './model/TraitRoot';
import TraitButtonView, { TraitButtonViewOpts } from './view/TraitButtonView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitColorView from './view/TraitColorView';
import {
  TraitNumberView,
  TraitNumberUnitView,
  TraitNumberUnitViewOpts,
  TraitNumberViewOpts,
} from './view/TraitNumberView';
import TraitSelectView, { TraitSelectViewOpts } from './view/TraitSelectView';
import TraitObjectView from './view/TraitObjectView';
import TraitTextView from './view/TraitTextView';
import TraitInputView, { TraitInputViewOpts } from './view/TraitInputView';
import TraitView from './view/TraitView';
import TraitFunctionView from './view/TraitFunctionView';
// import TraitDataLinkView from './view/TraitDataLinkView';
import TraitListView, { TraitListViewOpts } from './view/TraitListView';
// import TraitUrlView from './view/TraitUrlView';
// import TraitAjaxView from './view/TraitAjaxView';
import Trait from './model/Trait';
import TraitFactory from './model/TraitFactory';
import Component from '../../dom_components/model/Component';
import TraitListUniqueView from './view/TraitListUniqueView';

export type InputViewProperties =
  | ({ type: 'text' } & TraitInputViewOpts<'text'>)
  | ({ type: 'number' } & (TraitNumberViewOpts | TraitNumberUnitViewOpts))
  | ({ type: 'select' } & TraitSelectViewOpts)
  | ({ type: 'checkbox' } & TraitInputViewOpts<'checkbox'>)
  | ({ type: 'color' } & TraitInputViewOpts<'color'>)
  | ({ type: 'button' } & TraitButtonViewOpts)
  | ({ type: 'ajax' } & TraitListViewOpts<'ajax'>)
  | ({ type: 'url' } & TraitListViewOpts<'url'>)
  | ({ type: 'list' } & TraitInputViewOpts<'list'>)
  | ({ type: 'unique-list' } & TraitInputViewOpts<'unique-list'>)
  | ({ type: 'object' } & TraitListViewOpts);

export default abstract class InputFactory {
  static build(
    model: Model & { em: EditorModel },
    trait: string | ({ name: string } & InputViewProperties) | ({ name: string } & Trait<any>)
  ): { name: string } & Trait<any> {
    return TraitFactory.build(model, trait);
  }
  /**
   * Build props object by their name
   */
  static buildView<T extends Trait>(target: T, em: EditorModel, opts: InputViewProperties): TraitView<T> {
    let type: string | undefined;
    let prop: any = { ...opts };
    type = target.viewType ?? opts?.type;
    prop = opts;

    let view: TraitView<any>;
    switch (target) {
      default:
        const ViewClass = this.getView(type, prop);
        //@ts-ignore
        view = new ViewClass(em, opts);
        break;
    }
    return view.setTarget(target);
  }

  private static getView(type?: string, opts?: any) {
    switch (type) {
      case 'text':
        return TraitTextView;
      case 'number':
        return opts.units ? TraitNumberUnitView : TraitNumberView;
      case 'select':
        return TraitSelectView;
      case 'checkbox':
        return TraitCheckboxView;
      case 'color':
        return TraitColorView;
      case 'button':
        return TraitButtonView;
      case 'object':
        return TraitObjectView;
      case 'list':
        return TraitListView;
      case 'unique-list':
        return TraitListUniqueView;
      case 'function':
        return TraitFunctionView;
      // case 'link':
      //   return TraitDataLinkView;
      // case 'url':
      //   return TraitUrlView;
      // case 'ajax':
      //   return TraitAjaxView;
      default:
        return TraitTextView;
    }
  }
}

function renderNestedJs(value: any, ignoreJs: boolean, alwaysString: boolean = true): any {
  if (value?._js && !ignoreJs) {
    const helper = value._js; //(renderNestedJs(value, true, false)?? {});
    console.log('qwerrtest', helper);
    // console.log("qwerr",helper.render())
    return helper.render(helper);
  } else if (isArray(value)) {
    console.log(value);
    console.log([...value.map(item => renderNestedJs(item, false))]);
    const items = value.map(item => renderNestedJs(item, false, alwaysString));
    return alwaysString ? `[${items.join(',')}]` : items;
  } else if (isFunction(value)) {
    return alwaysString ? value + '' : value;
    // return objEntries.length > 0 ? objReturn : undefined
    // return objEntries.length > 0 ? Object.fromEntries(objEntries) : undefined
  } else if (isObject(value)) {
    // console.log("qwerr", value)
    const objKeys = Object.keys(value).filter(id => id != '_js');
    if (alwaysString) {
      const objItems = objKeys.map(id => `${id}: ${renderNestedJs(value[id], false, alwaysString)}`);
      return `{${objItems.join(',')}}`;
    } else {
      const objItems = objKeys.map(id => [id, renderNestedJs(value[id], false, alwaysString)]);
      return Object.fromEntries(objItems);
    }
    // return objEntries.length > 0 ? objReturn : undefined
    // return objEntries.length > 0 ? Object.fromEntries(objEntries) : undefined
  } else {
    return value && alwaysString ? JSON.stringify(value) : value;
  }
}

export function renderVariableValue(variable: any) {
  return renderNestedJs(variable, false);
}

// : string|undefined{
//   console.log(variable)

//   if (variable){
//     if (variable?._js){
//       console.log(renderNestedJs(variable, false))
//       console.log(variable)
//       // console.log(variable._js.render(variable))
//       return renderNestedJs(variable, false);
//     }
//     else if (isObject(variable)){
//       return `{${Object.keys(variable).map(id =>`${id}: ${renderNestedJs(variable[id], false)}`).join(',')}}`
//     }
//     else{
//       return JSON.stringify(variable)
//     }
//   }
//   return undefined
// }

export type { default as TraitButtonView } from './view/TraitButtonView';
export type { default as TraitCheckboxView } from './view/TraitCheckboxView';
export type { default as TraitColorView } from './view/TraitColorView';
export type { TraitNumberView, TraitNumberUnitView } from './view/TraitNumberView';
export type { default as TraitSelectView } from './view/TraitSelectView';
export type { default as TraitTextView } from './view/TraitTextView';
export type { default as TraitView } from './view/TraitInputView';
