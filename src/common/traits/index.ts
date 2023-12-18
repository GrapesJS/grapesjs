import { isString } from 'underscore';
import { Model } from '..';
import EditorModel from '../../editor/model/Editor';
import Trait, { TraitProperties } from './model/Trait';
import TraitList from './model/TraitList';
import TraitButtonView, { TraitButtonViewOpts } from './view/TraitButtonView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitColorView from './view/TraitColorView';
import TraitListView from './view/TraitListView';
import {
  TraitNumberView,
  TraitNumberUnitView,
  TraitNumberUnitViewOpts,
  TraitNumberViewOpts,
} from './view/TraitNumberView';
import TraitSelectView, { TraitSelectViewOpts } from './view/TraitSelectView';
import TraitTextView from './view/TraitTextView';
import TraitView, { TraitViewOpts } from './view/TraitView';

export type InputViewProperties =
  | ({ type?: '' } & TraitViewOpts)
  | ({ type: 'text' } & TraitViewOpts)
  | ({ type: 'number' } & (TraitNumberViewOpts | TraitNumberUnitViewOpts))
  | ({ type: 'select' } & TraitSelectViewOpts)
  | ({ type: 'checkbox' } & TraitViewOpts)
  | ({ type: 'color' } & TraitViewOpts)
  | ({ type: 'button' } & TraitButtonViewOpts<Model>)
  | ({ type: 'list' } & TraitButtonViewOpts<Model>);

export type InputProperties = TraitProperties & { name: string };

export default abstract class InputFactory {
  static build(model: Model, trait: string | (InputProperties & InputViewProperties) | Trait): Trait {
    if (!(trait instanceof Trait)) {
      if (isString(trait)) {
        return new Trait(trait, model);
      } else {
        switch (trait.type) {
          case 'list':
            return new TraitList(trait.name, model, trait);
          default:
            return new Trait(trait.name, model, trait);
        }
      }
    } else {
      return trait;
    }
  }
  /**
   * Build props object by their name
   */
  static buildView<T extends Trait<Model, any>>(target: T, em: EditorModel, opts?: InputViewProperties): TraitView<T> {
    let type: string | undefined;
    let prop: any = { name: target.name, ...opts };
    if (opts !== undefined) {
      type = opts.type;
      prop = opts;
    }
    let view: TraitView<T>;
    switch (target.name) {
      case 'target':
        const options = em.Traits.config.optionsTarget;
        view = new TraitSelectView(em, { name: target.name, ...prop, default: false, options }) as any;
        break;
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
      case 'list':
        return TraitListView;
      default:
        return TraitTextView;
    }
  }
}

export type { default as TraitButtonView } from './view/TraitButtonView';
export type { default as TraitCheckboxView } from './view/TraitCheckboxView';
export type { default as TraitColorView } from './view/TraitColorView';
export type { TraitNumberView, TraitNumberUnitView } from './view/TraitNumberView';
export type { default as TraitSelectView } from './view/TraitSelectView';
export type { default as TraitTextView } from './view/TraitTextView';
export type { default as TraitView } from './view/TraitView';
