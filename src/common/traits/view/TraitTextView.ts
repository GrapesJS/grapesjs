import { Model } from '../..';
import TraitView from './TraitView';

export default class TraitTextView<TModel extends Model> extends TraitView<TModel, string> {
  protected type: string = 'text';
}
