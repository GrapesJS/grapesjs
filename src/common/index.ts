export { default as Model } from './Model';
export { default as Collection } from './Collection';
export { default as View } from './View';

export type SetOptions = Backbone.ModelSetOptions & { avoidStore?: boolean };

export type AddOptions = Backbone.AddOptions & { temporary?: boolean };

export type RemoveOptions = Backbone.Silenceable;

export type ObjectAny = Record<string, any>;

export type ObjectStrings = Record<string, string>;

export type Position = {
  x: number;
  y: number;
};
