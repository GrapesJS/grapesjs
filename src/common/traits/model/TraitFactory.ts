import { isString } from 'underscore';
import { Model } from '../..';
import { TraitButtonViewOpts } from '../view/TraitButtonView';
import { TraitNumberUnitViewOpts, TraitNumberViewOpts } from '../view/TraitNumberView';
import { TraitSelectViewOpts } from '../view/TraitSelectView';
import { TraitInputViewOpts } from '../view/TraitInputView';
import Trait, { TraitProperties } from './Trait';
import TraitList, { TraitListProperties } from './TraitList';
import TraitSingle from './TraitSingle';
import { TraitListViewOpts } from '../view/TraitListView';

export type InputViewProperties =
  | TraitInputViewOpts<'text'>
  | (TraitNumberViewOpts | TraitNumberUnitViewOpts)
  | TraitSelectViewOpts
  | TraitInputViewOpts<'checkbox'>
  | TraitInputViewOpts<'color'>
  | TraitButtonViewOpts
  | TraitListViewOpts;

//   | ({ type: 'text' } & TraitInputViewOpts<"text">)
//   | ({ type: 'number' } & (TraitNumberViewOpts | TraitNumberUnitViewOpts))
//   | ({ type: 'select' } & TraitSelectViewOpts)
//   | ({ type: 'checkbox' } & TraitInputViewOpts<"checkbox">)
//   | ({ type: 'color' } & TraitInputViewOpts<"color">)
//   | ({ type: 'button' } & TraitButtonViewOpts)
//   | ({ type: 'list' } & TraitListViewOpts);

export type InputProperties = TraitProperties;
export default abstract class TraiFactory {
  static build(model: Model, trait: string | (InputProperties & InputViewProperties) | Trait): Trait {
    if (!(trait instanceof Trait)) {
      if (isString(trait)) {
        return new TraitSingle(trait, model, { type: 'text', label: trait });
      } else {
        switch (trait.type) {
          case 'list':
            return new TraitList(trait.name, model, trait);
          default:
            return new TraitSingle(trait.name, model, trait);
        }
      }
    } else {
      return trait;
    }
  }
}
