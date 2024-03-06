import { isArray, isObject, isString } from 'underscore';
import { Model } from '../..';
import { TraitButtonViewOpts } from '../view/TraitButtonView';
import { TraitNumberUnitViewOpts, TraitNumberViewOpts } from '../view/TraitNumberView';
import { TraitSelectViewOpts } from '../view/TraitSelectView';
import { TraitInputViewOpts } from '../view/TraitInputView';
import Trait, { TraitProperties } from './Trait';
import TraitListItem from './TraitListItem';
import TraitRoot from './TraitRoot';
import { TraitListViewOpts } from '../view/TraitListView';
import TraitObjectItem from './TraitObjectItem';
import { InputViewProperties } from '..';
import Component from '../../../dom_components/model/Component';
import EditorModel from '../../../editor/model/Editor';
import TraitModifier from './TraitModifier';
import TraitDataLink from './js-traits/TraitDataLink';
import TraitUrl from './js-traits/TraitUrl';
import TraitAjax from './js-traits/TraitAjax';
import TraitEventSelector from './js-traits/TraitEventSelector';
import TraitObject from './TraitObject';
import TraitList from './TraitList';
import TraitListUnique from './TraitListUnique';
import TraitSignal from './js-traits/TraitSignal';
import TraitVariable from './js-traits/TraitVariable';

// export type InputViewProperties =
//   | TraitInputViewOpts<'text'>
//   | (TraitNumberViewOpts | TraitNumberUnitViewOpts)
//   | TraitSelectViewOpts
//   | TraitInputViewOpts<'checkbox'>
//   | TraitInputViewOpts<'color'>
//   | TraitButtonViewOpts
//   | TraitListViewOpts
//   | TraitObjectViewOpts
//   | TraitObjectViewOpts<'ajax'>;

//   | ({ type: 'text' } & TraitInputViewOpts<"text">)
//   | ({ type: 'number' } & (TraitNumberViewOpts | TraitNumberUnitViewOpts))
//   | ({ type: 'select' } & TraitSelectViewOpts)
//   | ({ type: 'checkbox' } & TraitInputViewOpts<"checkbox">)
//   | ({ type: 'color' } & TraitInputViewOpts<"color">)
//   | ({ type: 'button' } & TraitButtonViewOpts)
//   | ({ type: 'list' } & TraitListViewOpts);

function isTraitList(trait: Trait): trait is Trait & { value: any[]; templates: TraitProperties } {
  return trait.type == 'list';
}

function isTraitUniqueList(trait: Trait): trait is Trait<{ [id: string]: any }> & { templates: TraitProperties } {
  return trait.type == 'unique-list';
}

function isTraitObject(
  trait: Trait
): trait is Trait<{ [id: string]: any }> & { templates: ({ name: string } & TraitProperties)[] } {
  return trait.type == 'object';
}

export default abstract class TraitFactory {
  static build(
    model: Model & { em: EditorModel },
    trait: string | ({ name: string } & InputViewProperties) | ({ name: string } & Trait<any>)
  ): Trait<any> & { name: string } {
    if (!(trait instanceof TraitRoot)) {
      if (isString(trait)) {
        return new TraitRoot(trait, model, { type: 'text', label: trait });
      } else if (trait.name == 'target') {
        const options = model.em.Traits.config.optionsTarget;
        return new TraitRoot(trait.name, model, { ...trait, type: 'select', default: false, options });
      } else {
        const tr = new TraitRoot(trait.name, model, trait);
        // switch (trait.type) {
        //     case 'list':
        //     return TraitFactory.buildChildren(new TraitRoot(trait.name, model, { ...trait, changeProp: true  }));
        //     case 'unique-list':
        //         return TraitFactory.buildChildren(new TraitRoot(trait.name, model, { ...trait, changeProp: true  }));
        //     case 'object':
        //         new TraitObject(trait)
        //         break;
        //   default:
        //     //   trait = TraitFactory.buildChildren(new TraitRoot(trait.name, model, trait));
        //     //   if(isObject(trait.value)){
        //     //     console.log("new staff",trait)
        //     //     trait.opts.type = "object"
        //     //   }
        //     return trait;
        // }
        console.log('asdfasdf', trait, TraitFactory.buildNestedTraits(tr));
        return TraitFactory.buildNestedTraits(tr);
      }
    } else {
      return trait;
    }
  }

  static buildNestedTraits(trait: Trait & { name: string }): Trait & { name: string } {
    console.log('asdfasdf', trait.type);
    switch (trait.type) {
      case 'list':
        return new TraitList(trait);
      case 'unique-list':
        return new TraitListUnique(trait);
      case 'object':
        return new TraitObject(trait);
      case 'url':
        return new TraitUrl(trait);
      case 'link':
        return new TraitDataLink(trait);
      case 'ajax':
        return new TraitAjax(trait);
      case 'signal':
        return new TraitSignal(trait);
      case 'variable':
        return new TraitVariable(trait);
      case 'event':
        return new TraitEventSelector(trait);
      default:
        return trait;
    }
  }

  // static buildChildren<T extends Trait>(trait: T): T{
  //     if (isTraitList(trait)){
  //         console.log(trait)
  //         console.log(trait.value)
  //         trait.children = (trait.value as any[])?.map((value, index) => {
  //             console.log("test", value)
  //         return new TraitListItem(index, trait, {...trait.templates})
  //         })
  //     }
  //     else if (isTraitUniqueList(trait)){
  //         console.log("UNIQUE", trait)
  //         console.log("UNIQUE", trait.value)
  //         console.log("UNIQUE", Object.keys(trait.value))
  //         trait.children = Object.keys(trait.value).map((id) => {
  //             // const opts = isArray(trait.templates) ? trait.templates.find(tr => tr.name ==id) : trait.templates;
  //             return new TraitObjectItem(id, trait, trait.templates)
  //         })
  //     }
  //     else if (isTraitObject(trait)){
  //         console.log(trait);
  //         trait.children = trait.templates.map((tr) => {
  //             return new TraitObjectItem(tr.name, trait, tr)
  //         })
  //         // trait.children = Object.keys(trait.value).filter(tr => tr != '_js').map((id) => {
  //         //     const opts = isArray(trait.templates) ? trait.templates.find(tr => tr.name ==id) : trait.templates;
  //         //     return new TraitObject(id, trait, opts)
  //         // })
  //     }
  //     else{
  //     switch (trait.type) {
  //         // case 'list':
  //         //     if(isArray(trait.value)){
  //         //         trait.value.map(([value, index]) => buildt(new TraitList(index, trait, trait.traits)))
  //         //     }
  //         //     else if (isObject(trait.value)){
  //         //         Object.keys(trait.value).map((id) => buildt(new TraitObject(id, trait, trait.traits.find(tr => tr.name ==id))))
  //         //     }
  //         //     return trait
  //         //     // (trait.value as any[]).map(([value, index]) => buildt(new TraitList(index, trait, {trait.traits})))
  //         // // return new TraitSingle(trait.name, model, { ...trait, name: trait.name, changeProp: true  });
  //         case 'url':
  //             new TraitUrl(trait)
  //             break;
  //         case 'link':
  //             new TraitDataLink(trait)
  //             break;
  //         case 'ajax':
  //             new TraitAjax(trait)
  //             break;
  //         case 'event':
  //             new TraitEventSelector(trait)
  //             break;
  //     }
  //     }
  //     return trait;
  // }
}
