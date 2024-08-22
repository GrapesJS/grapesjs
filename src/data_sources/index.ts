/**
 * This module manages data sources within the editor.
 * You can initialize the module with the editor by passing an instance of `EditorModel`.
 *
 * ```js
 * const editor = new EditorModel();
 * const dsm = new DataSourceManager(editor);
 * ```
 *
 * Once the editor is instantiated, you can use the following API to manage data sources:
 *
 * ```js
 * const dsm = editor.DataSources;
 * ```
 *
 * * [add](#add) - Add a new data source.
 * * [get](#get) - Retrieve a data source by its ID.
 * * [getAll](#getall) - Retrieve all data sources.
 * * [remove](#remove) - Remove a data source by its ID.
 * * [clear](#clear) - Remove all data sources.
 *
 * Example of adding a data source:
 *
 * ```js
 * const ds = dsm.add({
 *   id: 'my_data_source_id',
 *   records: [
 *     { id: 'id1', name: 'value1' },
 *     { id: 'id2', name: 'value2' }
 *   ]
 * });
 * ```
 *
 * @module DataSources
 * @param {EditorModel} em - Editor model.
 */

import { ItemManagerModule, ModuleConfig } from '../abstract/Module';
import { AddOptions, RemoveOptions } from '../common';
import EditorModel from '../editor/model/Editor';
import DataSource from './model/DataSource';
import DataSources from './model/DataSources';
import { DataSourceProps, DataSourcesEvents } from './types';
import { Events } from 'backbone';

export default class DataSourceManager extends ItemManagerModule<ModuleConfig, DataSources> {
  storageKey = '';
  events = DataSourcesEvents;
  destroy(): void {}

  constructor(em: EditorModel) {
    super(em, 'DataSources', new DataSources([], em), DataSourcesEvents);
    Object.assign(this, Events); // Mixin Backbone.Events
  }

  /**
   * Add new data source.
   * @param {Object} props Data source properties.
   * @returns {[DataSource]} Added data source.
   * @example
   * const ds = dsm.add({
   *  id: 'my_data_source_id',
   *  records: [
   *    { id: 'id1', name: 'value1' },
   *    { id: 'id2', name: 'value2' }
   *  ]
   * });
   */
  add(props: DataSourceProps, opts: AddOptions = {}) {
    const { all } = this;
    props.id = props.id || this._createId();
    return all.add(props, opts);
  }

  /**
   * Get data source.
   * @param {String} id Data source id.
   * @returns {[DataSource]} Data source.
   * @example
   * const ds = dsm.get('my_data_source_id');
   */
  get(id: string) {
    return this.all.get(id);
  }

  /**
   * Remove data source.
   * @param {String|[DataSource]} id Id of the data source.
   * @returns {[DataSource]} Removed data source.
   * @example
   * const removed = dsm.remove('DS_ID');
   */
  remove(id: string | DataSource, opts?: RemoveOptions) {
    return this.__remove(id, opts);
  }
}
