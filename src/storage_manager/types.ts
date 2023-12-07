/**{START_EVENTS}*/
export enum StorageEvents {
  /**
   * @event `canvas:spot` Spots updated.
   * @example
   * editor.on('canvas:spot', () => {
   *  console.log('Spots', editor.Canvas.getSpots());
   * });
   */
  spot = 'canvas:spot',

  /**
   * @event `storage:start` Storage request start.
   * @example
   * editor.on('storage:start', () => {
   *  console.log('Storage start');
   * });
   */
  start = 'storage:start',

  /**
   * @event `storage:start:store` Storage store request start.
   * The project JSON object to store is passed as an argument (which you can edit).
   * @example
   * editor.on('storage:start:store', () => {
   *  console.log('Storage start store');
   * });
   */
  startStore = 'storage:start:store',

  /**
   * @event `storage:start:load` Storage load request start.
   * @example
   * editor.on('storage:start:load', () => {
   *  console.log('Storage start load');
   * });
   */
  startLoad = 'storage:start:load',

  /**
   * @event `storage:load` Storage loaded the project.
   * The loaded project is passed as an argument.
   * @example
   * editor.on('storage:load', () => {
   *  console.log('Storage loaded the project');
   * });
   */
  load = 'storage:load',

  /**
   * @event `storage:store` Storage stored the project.
   * The stored project is passed as an argument.
   * @example
   * editor.on('storage:store', () => {
   *  console.log('Storage stored the project');
   * });
   */
  store = 'storage:store',

  /**
   * @event `storage:end` Storage request ended.
   * @example
   * editor.on('storage:end', () => {
   *  console.log('Storage request ended');
   * });
   */
  end = 'storage:end',

  /**
   * @event `storage:end:store` Storage store request ended.
   * @example
   * editor.on('storage:end:store', () => {
   *  console.log('Storage store request ended');
   * });
   */
  endStore = 'storage:end:store',

  /**
   * @event `storage:end:load` Storage load request ended.
   * @example
   * editor.on('storage:end:load', () => {
   *  console.log('Storage load request ended');
   * });
   */
  endLoad = 'storage:end:load',

  /**
   * @event `storage:error` Error on storage request.
   * @example
   * editor.on('storage:error', () => {
   *  console.log('Storage error');
   * });
   */
  error = 'storage:error',

  /**
   * @event `storage:error:store` Error on store request.
   * @example
   * editor.on('storage:error:store', () => {
   *  console.log('Error on store');
   * });
   */
  errorStore = 'storage:error:store',

  /**
   * @event `storage:error:load` Error on load request.
   * @example
   * editor.on('storage:error:load', () => {
   *  console.log('Error on load');
   * });
   */
  errorLoad = 'storage:error:load',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default StorageEvents;
