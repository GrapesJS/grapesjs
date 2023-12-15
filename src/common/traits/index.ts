import { Model } from '..';
import EditorModel from '../../editor/model/Editor';
import TraitButtonView, { TraitButtonViewOpts } from './view/TraitButtonView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitColorView from './view/TraitColorView';
import TraitNumberView, {
  TraitNumberUnitView,
  TraitNumberUnitViewOpts,
  TraitNumberViewOpts,
} from './view/TraitNumberView';
import TraitSelectView, { TraitSelectViewOpts } from './view/TraitSelectView';
import TraitTextView from './view/TraitTextView';
import TraitView, { TraitViewOpts } from './view/TraitView';

type InputProperties =
  | { type?: string; opts: { em: EditorModel; name?: string } }
  | {
      type: 'text';
      opts: TraitViewOpts;
    }
  | {
      type: 'number';
      opts: TraitNumberViewOpts | TraitNumberUnitViewOpts;
    }
  | {
      type: 'select';
      opts: TraitSelectViewOpts;
    }
  | {
      type: 'checkbox';
      opts: TraitViewOpts;
    }
  | {
      type: 'color';
      opts: TraitViewOpts;
    }
  | {
      type: 'button';
      opts: TraitButtonViewOpts<Model>;
    };

export default abstract class InputFactory {
  /**
   * Build props object by their name
   */
  static build<M extends Model>(name: string, model: M, prop: InputProperties): TraitView<M, any> {
    let type = 'text';
    let opts: any = { name, ...prop.opts };
    if (prop.type !== undefined) {
      type = prop.type;
      opts = prop.opts;
    }

    switch (name) {
      case 'target':
        const options = opts.em.Traits.config.optionsTarget;
        return new TraitSelectView(name, model, { ...prop.opts, name, default: false, options });
      default:
        const ViewClass = this.getView(type, opts);
        //@ts-ignore
        return new ViewClass(name, model, opts);
    }
  }

  private static getView<M extends Model>(type: string, opts: any) {
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
      default:
        return TraitTextView;
    }
  }
}
