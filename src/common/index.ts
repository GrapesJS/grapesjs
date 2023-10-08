import Backbone from 'backbone';
export { default as $ } from '../utils/cash-dom';

interface NOOP {}

export type Debounced = Function & { cancel(): void };

export type SetOptions = Backbone.ModelSetOptions & { avoidStore?: boolean };

export type AddOptions = Backbone.AddOptions & { temporary?: boolean };

export type RemoveOptions = Backbone.Silenceable;

export type EventHandler = Backbone.EventHandler;

export type ObjectHash = Backbone.ObjectHash;

export type ObjectAny = Record<string, any>;

export type ObjectStrings = Record<string, string>;

// https://github.com/microsoft/TypeScript/issues/29729#issuecomment-1483854699
export type LiteralUnion<T, U> = T | (U & NOOP);

export type Position = {
  x: number;
  y: number;
};

export interface Coordinates {
  x: number;
  y: number;
}

export interface Dimensions {
  height: number;
  width: number;
}

export interface BoxRect extends Coordinates, Dimensions {}

export type ElementRect = {
  top: number;
  left: number;
  width: number;
  height: number;
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

export type PickMatching<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };

export type ExtractMethods<T> = PickMatching<T, Function>;

export enum CoordinatesTypes {
  Screen = 'screen',
  World = 'world',
}

export const DEFAULT_COORDS: Coordinates = {
  x: 0,
  y: 0,
};

export const DEFAULT_BOXRECT: BoxRect = {
  ...DEFAULT_COORDS,
  width: 0,
  height: 0,
};

export type PrevToNewIdMap = Record<string, string>;
