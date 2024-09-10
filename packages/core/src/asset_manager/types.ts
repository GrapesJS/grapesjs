import Asset from './model/Asset';

export type AssetEvent = `${AssetsEvents}`;

export interface AssetOpenOptions {
  select?: (asset: Asset, complete: boolean) => void;
  types?: string[];
  accept?: string;
  target?: any;
}

/**{START_EVENTS}*/
export enum AssetsEvents {
  /**
   * @event `asset:add` New asset added to the collection. The [Asset] is passed as an argument to the callback.
   * @example
   * editor.on('asset:add', (asset) => { ... });
   */
  add = 'asset:add',

  /**
   * @event `asset:remove` Asset removed from the collection. The [Asset] is passed as an argument to the callback.
   * @example
   * editor.on('asset:remove', (asset) => { ... });
   */
  remove = 'asset:remove',
  removeBefore = 'asset:remove:before',

  /**
   * @event `asset:update` Asset updated. The [Asset] and the object containing changes are passed as arguments to the callback.
   * @example
   * editor.on('asset:update', (asset, updatedProps) => { ... });
   */
  update = 'asset:update',

  /**
   * @event `asset:open` Asset Manager opened.
   * @example
   * editor.on('asset:open', () => { ... });
   */
  open = 'asset:open',

  /**
   * @event `asset:close` Asset Manager closed.
   * @example
   * editor.on('asset:close', () => { ... });
   */
  close = 'asset:close',

  /**
   * @event `asset:upload:start` Asset upload start.
   * @example
   * editor.on('asset:upload:start', () => { ... });
   */
  uploadStart = 'asset:upload:start',

  /**
   * @event `asset:upload:end` Asset upload end.
   * @example
   * editor.on('asset:upload:end', (result) => { ... });
   */
  uploadEnd = 'asset:upload:end',

  /**
   * @event `asset:upload:error` Asset upload error.
   * @example
   * editor.on('asset:upload:error', (error) => { ... });
   */
  uploadError = 'asset:upload:error',

  /**
   * @event `asset:upload:response` Asset upload response.
   * @example
   * editor.on('asset:upload:response', (res) => { ... });
   */
  uploadResponse = 'asset:upload:response',

  /**
   * @event `asset:custom` Event to use in case of [custom Asset Manager UI](https://grapesjs.com/docs/modules/Assets.html#customization).
   * @example
   * editor.on('asset:custom', ({ container, assets, ... }) => { ... });
   */
  custom = 'asset:custom',

  /**
   * @event `asset` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('asset', ({ event, model, ... }) => { ... });
   */
  all = 'asset',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default AssetsEvents;
