import Backbone from 'backbone';
import Model from './Model';

export default class Collection<
  TModel extends Model = Model
> extends Backbone.Collection<TModel> {}
