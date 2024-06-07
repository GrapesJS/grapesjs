export enum ActionLabelComponents {
  remove = 'component:remove',
  add = 'component:add',
  move = 'component:move',
}

export enum ComponentsEvents {
  /**
   * @event `component:add` New component added.
   * @example
   * editor.on('component:add', (component) => { ... });
   */
  add = 'component:add',

  /**
   * @event `component:remove` Component removed.
   * @example
   * editor.on('component:remove', (component) => { ... });
   */
  remove = 'component:remove',
  removeBefore = 'component:remove:before',

  /**
   * @event `component:create` Component created.
   * @example
   * editor.on('component:create', (component) => { ... });
   */
  create = 'component:create',
}
