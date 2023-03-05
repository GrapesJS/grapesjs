export interface AssetManagerConfig {
  /**
   * Default assets.
   * @example
   * [
   *  'https://...image1.png',
   *  'https://...image2.png',
   *  {type: 'image', src: 'https://...image3.png', someOtherCustomProp: 1}
   * ]
   */
  assets?: (string | Record<string, any>)[];
  /**
   * Content to add where there is no assets to show.
   * @default ''
   * @example 'No <b>assets</b> here, drag to upload'
   */
  noAssets?: string;
  /**
   * Style prefix
   * @default 'am-'
   */
  stylePrefix?: string;
  /**
   * Upload endpoint, set `false` to disable upload.
   * @example 'https://endpoint/upload/assets'
   */
  upload?: false | string;
  /**
   * The name used in POST to pass uploaded files.
   * @default 'files'
   */
  uploadName?: string;
  /**
   * Custom headers to pass with the upload request.
   * @default {}
   */
  headers?: Record<string, any>;
  /**
   * Custom parameters to pass with the upload request, eg. csrf token.
   * @default {}
   */
  params?: Record<string, any>;
  /**
   * The credentials setting for the upload request, eg. 'include', 'omit'.
   * @default 'include'
   */
  credentials?: RequestCredentials;
  /**
   * Allow uploading multiple files per request. If disabled filename will not have '[]' appended.
   * @default true
   */
  multiUpload?: boolean;
  /**
   * If true, tries to add automatically uploaded assets. To make it work the server should respond with a JSON containing assets in a data key, eg:
   * { data: [ 'https://.../image.png', {src: 'https://.../image2.png'} ]
   * @default true
   */
  autoAdd?: boolean;
  /**
   * To upload your assets, the module uses Fetch API. With this option you can overwrite it with your own logic. The custom function should return a Promise.
   * @example
   * customFetch: (url, options) => axios(url, { data: options.body }),
   */
  customFetch?: (url: string, options: Record<string, any>) => Promise<void>;
  /**
   * Custom uploadFile function.
   * Differently from the `customFetch` option, this gives a total control over the uploading process, but you also have to emit all `asset:upload:*` events b
   * y yourself (if you need to use them somewhere).
   * @example
   * uploadFile: (ev) => {
   *  const files = ev.dataTransfer ? ev.dataTransfer.files : ev.target.files;
   *  // ...send somewhere
   * }
   */
  uploadFile?: (ev: DragEvent) => void;
  /**
   * In the absence of 'uploadFile' or 'upload' assets will be embedded as Base64.
   * @default true
   */
  embedAsBase64?: boolean;
  /**
   * Handle the image url submit from the built-in 'Add image' form.
   * @example
   * handleAdd: (textFromInput) => {
   *   // some check...
   *   editor.AssetManager.add(textFromInput);
   * }
   */
  handleAdd?: (value: string) => void;
  /**
   * Method called before upload, on return false upload is canceled.
   * @example
   * beforeUpload: (files) => {
   *  // logic...
   *  const stopUpload = true;
   *  if(stopUpload) return false;
   * }
   */
  beforeUpload?: (files: any) => void | false;
  /**
   * Toggles visiblity of assets url input
   * @default true
   */
  showUrlInput?: boolean;
  /**
   * Avoid rendering the default asset manager.
   * @default false
   */
  custom?:
    | boolean
    | {
        open?: (props: any) => void;
        close?: (props: any) => void;
      };
  /**
   * Enable an upload dropzone on the entire editor (not document) when dragging files over it.
   * If active the dropzone disable/hide the upload dropzone in asset modal, otherwise you will get double drops (#507).
   * @deprecated
   */
  dropzone?: boolean;
  /**
   * Open the asset manager once files are been dropped via the dropzone.
   * @deprecated
   */
  openAssetsOnDrop?: boolean;
  /**
   * Any dropzone content to append inside dropzone element
   * @deprecated
   */
  dropzoneContent?: string;
}

const config: AssetManagerConfig = {
  assets: [],
  noAssets: '',
  stylePrefix: 'am-',
  upload: '',
  uploadName: 'files',
  headers: {},
  params: {},
  credentials: 'include',
  multiUpload: true,
  autoAdd: true,
  customFetch: undefined,
  uploadFile: undefined,
  embedAsBase64: true,
  handleAdd: undefined,
  beforeUpload: undefined,
  showUrlInput: true,
  custom: false,
  dropzone: false,
  openAssetsOnDrop: true,
  dropzoneContent: '',
};

export default config;
