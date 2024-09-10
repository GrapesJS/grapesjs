import AssetManager from '..';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import fetch from '../../utils/fetch';
import html from '../../utils/html';
import { AssetManagerConfig } from '../config/config';

type FileUploaderTemplateProps = {
  pfx: string;
  title: string;
  uploadId: string;
  disabled: boolean;
  multiUpload: boolean;
};

export default class FileUploaderView extends View {
  options: any;
  config: AssetManagerConfig;
  pfx: string;
  ppfx: string;
  em: EditorModel;
  module: AssetManager;
  target: any;
  uploadId: string;
  disabled: boolean;
  multiUpload: boolean;
  uploadForm?: HTMLFormElement | null;

  template({ pfx, title, uploadId, disabled, multiUpload }: FileUploaderTemplateProps) {
    return html`
      <form>
        <div id="${pfx}title">${title}</div>
        <input
          data-input
          type="file"
          id="${uploadId}"
          name="file"
          accept="*/*"
          ${disabled ? 'disabled' : ''}
          ${multiUpload ? 'multiple' : ''}
        />
        <div style="clear:both;"></div>
      </form>
    `;
  }

  events() {
    return {
      'change [data-input]': 'uploadFile',
    };
  }

  constructor(opts: any = {}) {
    super(opts);
    this.options = opts;
    const c = opts.config || {};
    this.module = opts.module;
    this.config = c;
    // @ts-ignore
    this.em = this.config.em;
    this.pfx = c.stylePrefix || '';
    this.ppfx = c.pStylePrefix || '';
    this.target = this.options.globalCollection || {};
    this.uploadId = this.pfx + 'uploadFile';
    this.disabled = c.disableUpload !== undefined ? c.disableUpload : !c.upload && !c.embedAsBase64;
    this.multiUpload = c.multiUpload !== undefined ? c.multiUpload : true;
    const uploadFile = c.uploadFile;

    if (uploadFile) {
      this.uploadFile = uploadFile.bind(this);
    } else if (!c.upload && c.embedAsBase64) {
      this.uploadFile = FileUploaderView.embedAsBase64;
    }

    this.delegateEvents();
  }

  /**
   * Triggered before the upload is started
   * @private
   */
  onUploadStart() {
    const { module } = this;
    module?.__propEv(module.events.uploadStart);
  }

  /**
   * Triggered after the upload is ended
   * @param  {Object|string} res End result
   * @private
   */
  onUploadEnd(res: any) {
    const { $el, module } = this;
    module?.__propEv(module.events.uploadEnd, res);
    const input = $el.find('input');
    input && input.val('');
  }

  /**
   * Triggered on upload error
   * @param  {Object} err Error
   * @private
   */
  onUploadError(err: Error) {
    const { module } = this;
    console.error(err);
    this.onUploadEnd(err);
    module?.__propEv(module.events.uploadError, err);
  }

  /**
   * Triggered on upload response
   * @param  {string} text Response text
   * @private
   */
  onUploadResponse(text: string, clb?: (json: any) => void) {
    const { module, config, target } = this;
    let json;
    try {
      json = typeof text === 'string' ? JSON.parse(text) : text;
    } catch (e) {
      json = text;
    }

    module?.__propEv(module.events.uploadResponse, json);

    if (config.autoAdd && target) {
      target.add(json.data, { at: 0 });
    }

    this.onUploadEnd(text);
    clb?.(json);
  }

  /**
   * Upload files
   * @param  {Object}  e Event
   * @return {Promise}
   * @private
   * */
  uploadFile(e: DragEvent, clb?: () => void) {
    // @ts-ignore
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const { config } = this;
    const { beforeUpload } = config;

    const beforeUploadResponse = beforeUpload && beforeUpload(files);
    if (beforeUploadResponse === false) return;

    const body = new FormData();
    const { params, customFetch, fetchOptions } = config;

    for (let param in params) {
      body.append(param, params[param]);
    }

    if (this.multiUpload) {
      for (let i = 0; i < files.length; i++) {
        body.append(`${config.uploadName}${config.multiUploadSuffix}`, files[i]);
      }
    } else if (files.length) {
      body.append(config.uploadName!, files[0]);
    }

    const url = config.upload;
    const headers = config.headers!;
    const reqHead = 'X-Requested-With';

    if (typeof headers[reqHead] == 'undefined') {
      headers[reqHead] = 'XMLHttpRequest';
    }

    if (url) {
      this.onUploadStart();
      const fetchOpts = {
        method: 'post',
        credentials: config.credentials || 'include',
        headers,
        body,
      };
      const fetchOptsResult = fetchOptions?.(fetchOpts) || fetchOpts;
      const fetchResult = customFetch
        ? customFetch(url, fetchOptsResult)
        : fetch(url, fetchOptsResult).then((res: any) =>
            ((res.status / 200) | 0) == 1 ? res.text() : res.text().then((text: string) => Promise.reject(text)),
          );
      return fetchResult
        .then((text: string) => this.onUploadResponse(text, clb))
        .catch((err: Error) => this.onUploadError(err));
    }
  }

  /**
   * Make input file droppable
   * @private
   * */
  initDrop() {
    var that = this;

    if (!this.uploadForm) {
      this.uploadForm = this.$el.find('form').get(0)!;
      const formEl = this.uploadForm;

      if ('draggable' in formEl) {
        this.uploadForm.ondragover = function () {
          formEl.className = that.pfx + 'hover';
          return false;
        };
        this.uploadForm.ondragleave = function () {
          formEl.className = '';
          return false;
        };
        this.uploadForm.ondrop = function (ev) {
          formEl.className = '';
          ev.preventDefault();
          that.uploadFile(ev);
          return;
        };
      }
    }
  }

  initDropzone(ev: any) {
    let addedCls = 0;
    const c = this.config;
    const em = ev.model;
    const edEl = ev.el;
    const editor = em.Editor;
    const frameEl = em.Canvas.getBody();
    const ppfx = this.ppfx;
    const updatedCls = `${ppfx}dropzone-active`;
    const dropzoneCls = `${ppfx}dropzone`;
    const cleanEditorElCls = () => {
      edEl.className = edEl.className.replace(updatedCls, '').trim();
      addedCls = 0;
    };
    const onDragOver = () => {
      if (!addedCls) {
        edEl.className += ` ${updatedCls}`;
        addedCls = 1;
      }
      return false;
    };
    const onDragLeave = () => {
      cleanEditorElCls();
      return false;
    };
    const onDrop = (e: DragEvent) => {
      cleanEditorElCls();
      e.preventDefault();
      e.stopPropagation();
      this.uploadFile(e);

      if (c.openAssetsOnDrop && editor) {
        const target = editor.getSelected();
        editor.runCommand('open-assets', {
          target,
          onSelect() {
            editor.Modal.close();
            editor.AssetManager.setTarget(null);
          },
        });
      }

      return false;
    };

    ev.$el.append(`<div class="${dropzoneCls}">${c.dropzoneContent}</div>`);
    cleanEditorElCls();

    if ('draggable' in edEl) {
      [edEl, frameEl].forEach((item) => {
        item.ondragover = onDragOver;
        item.ondragleave = onDragLeave;
        item.ondrop = onDrop;
      });
    }
  }

  render() {
    const { $el, pfx, em } = this;
    $el.html(
      this.template({
        title: em && em.t('assetManager.uploadTitle'),
        uploadId: this.uploadId,
        disabled: this.disabled,
        multiUpload: this.multiUpload,
        pfx,
      }),
    );
    this.initDrop();
    $el.attr('class', pfx + 'file-uploader');
    return this;
  }

  static embedAsBase64(e: DragEvent, clb?: () => void) {
    // List files dropped
    // @ts-ignore
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const response: Record<string, any> = { data: [] };

    // Unlikely, widely supported now
    if (!FileReader) {
      // @ts-ignore
      this.onUploadError(new Error('Unsupported platform, FileReader is not defined'));
      return;
    }

    const promises = [];
    const mimeTypeMatcher = /^(.+)\/(.+)$/;

    for (const file of files) {
      // For each file a reader (to read the base64 URL)
      // and a promise (to track and merge results and errors)
      const promise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          let type;
          const name = file.name;

          // Try to find the MIME type of the file.
          const match = mimeTypeMatcher.exec(file.type);
          if (match) {
            type = match[1]; // The first part in the MIME, "image" in image/png
          } else {
            type = file.type;
          }

          /*
        // Show local video files, http://jsfiddle.net/dsbonev/cCCZ2/embedded/result,js,html,css/
        var URL = window.URL || window.webkitURL
        var file = this.files[0]
        var type = file.type
        var videoNode = document.createElement('video');
        var canPlay = videoNode.canPlayType(type) // can use also for 'audio' types
        if (canPlay === '') canPlay = 'no'
        var message = 'Can play type "' + type + '": ' + canPlay
        var isError = canPlay === 'no'
        displayMessage(message, isError)

        if (isError) {
          return
        }

        var fileURL = URL.createObjectURL(file)
        videoNode.src = fileURL
         */

          // If it's an image, try to find its size
          if (type === 'image') {
            const data = {
              src: reader.result,
              name,
              type,
              height: 0,
              width: 0,
            };

            const image = new Image();
            image.addEventListener('error', (error) => {
              reject(error);
            });
            image.addEventListener('load', () => {
              data.height = image.height;
              data.width = image.width;
              resolve(data);
            });
            // @ts-ignore
            image.src = data.src;
          } else if (type) {
            // Not an image, but has a type
            resolve({
              src: reader.result,
              name,
              type,
            });
          } else {
            // No type found, resolve with the URL only
            resolve(reader.result);
          }
        });
        reader.addEventListener('error', (error) => {
          reject(error);
        });
        reader.addEventListener('abort', (error) => {
          reject('Aborted');
        });

        reader.readAsDataURL(file);
      });

      promises.push(promise);
    }

    return Promise.all(promises).then(
      (data) => {
        response.data = data;
        // @ts-ignore
        this.onUploadResponse(response, clb);
      },
      (error) => {
        // @ts-ignore
        this.onUploadError(error);
      },
    );
  }
}
