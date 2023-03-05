import Backbone from 'backbone';
export { default as $ } from '../utils/cash-dom';

export type Debounced = Function & { cancel(): void };

export type SetOptions = Backbone.ModelSetOptions & { avoidStore?: boolean };

export type AddOptions = Backbone.AddOptions & { temporary?: boolean };

export type RemoveOptions = Backbone.Silenceable;

export type EventHandler = Backbone.EventHandler;

export type ObjectHash = Backbone.ObjectHash;

export type ObjectAny = Record<string, any>;

export type ObjectStrings = Record<string, string>;

export type Position = {
  x: number;
  y: number;
};

export type CombinedModelConstructorOptions<
  E,
  M extends Model<any, any, E> = Model
> = Backbone.ModelConstructorOptions<M> & E;

export interface ViewOptions<TModel extends Model | undefined = Model, TElement extends Element = HTMLElement>
  extends Backbone.ViewOptions<TModel, TElement> {}

export class Model<T extends ObjectHash = any, S = SetOptions, E = any> extends Backbone.Model<T, S, E> {}

export class Collection<T extends Model = Model> extends Backbone.Collection<T> {}

export class View<T extends Model | undefined = Model, E extends Element = HTMLElement> extends Backbone.View<T, E> {}
