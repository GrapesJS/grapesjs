export { default as Model } from './Model';
export { default as Collection } from './Collection';
export { default as View } from './View';

export type SetOptions = Backbone.ModelSetOptions & { avoidStore?: boolean };

export type AddOptions = Backbone.AddOptions;

export type RemoveOptions = Backbone.Silenceable;
