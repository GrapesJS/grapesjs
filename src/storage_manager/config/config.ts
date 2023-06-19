import { LiteralUnion } from '../../common';
import Editor from '../../editor';
import { ProjectData } from '../model/IStorage';
import { LocalStorageConfig } from '../model/LocalStorage';
import { RemoteStorageConfig } from '../model/RemoteStorage';

export interface StorageManagerConfig {
  /**
   * Prefix identifier that will be used inside storing and loading.
   * @default 'gjs-'
   * @deprecated
   */
  id?: string;

  /**
   * Default storage type.
   * Available by default: 'local' | 'remote'
   * @default 'local'
   */
  type?: LiteralUnion<'local' | 'remote', string>;

  /**
   * Enable/disable autosaving.
   * @default true
   */
  autosave?: boolean;

  /**
   * Enable/disable autoload of data on editor init.
   * @default true
   */
  autoload?: boolean;

  /**
   * If autosave enabled, indicates how many steps (general changes to structure)
   * need to be done before save. Useful with remoteStorage to reduce remote calls
   * @default 1
   */
  stepsBeforeSave?: number;

  /**
   * In case the `remote` storage is selected, and this options is enabled, the project
   * will be stored on the `local` storage in case the remote one fails.
   * The local data are cleared on every sucessful remote save. When the remote storage
   * fails (eg. network issue) and the editor is reloaded, a dialog with the possibility to
   * recovery previous data will be shown.
   * @default false
   * @example
   * // Enable recovery with default confirm dialog
   * recovery: true,
   * // Enable recovery with a custom dialog
   * recovery: (accept, cancel, editor) => {
   *   confirm('Recover data?') ? accept() : cancel();
   * },
   */
  recovery?: boolean | ((accept: Function, cancel: Function, editor: Editor) => void);

  /**
   * Callback triggered before the store call (can be asynchronous).
   * This can be used to enrich the project data to store.
   * @default data => data
   */
  onStore?: (data: ProjectData, editor: Editor) => ProjectData;

  /**
   * Callback triggered after the load call (can be asynchronous).
   * @default data => data
   */
  onLoad?: (data: ProjectData, editor: Editor) => ProjectData;

  /**
   * Default storage options.
   */
  options?: {
    local?: LocalStorageConfig;
    remote?: RemoteStorageConfig;
    [key: string]: any;
  };
}

const config: StorageManagerConfig = {
  id: 'gjs-',
  type: 'local',
  autosave: true,
  autoload: true,
  stepsBeforeSave: 1,
  recovery: false,
  onStore: data => data,
  onLoad: data => data,
  options: {
    local: {
      key: 'gjsProject',
      checkLocal: true,
    },
    remote: {
      headers: {},
      urlStore: '',
      urlLoad: '',
      contentTypeJson: true,
      fetchOptions: '',
      credentials: 'include',
      onStore: data => data,
      onLoad: result => result,
    },
  },
};

export default config;
