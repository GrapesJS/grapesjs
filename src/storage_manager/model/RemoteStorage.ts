import Editor from '../../editor';
import { isUndefined, isFunction, isString } from 'underscore';
import fetch from '../../utils/fetch';
import IStorage, { ProjectData } from './IStorage';
import { ObjectAny } from '../../common';

export interface RemoteStorageConfig {
  /**
   * Custom headers.
   * @default {}
   */
  headers?: ObjectAny;

  /**
   * Endpoint URL where to store data project.
   */
  urlStore?: string;

  /**
   * Endpoint URL where to load data project.
   */
  urlLoad?: string;

  /**
   * Use JSON contentType.
   * @default true
   */
  contentTypeJson?: boolean;

  /**
   * Credentials option for the fetch API.
   * @default 'include'
   */
  credentials?: RequestCredentials;

  /**
   * Pass custom options to fetch API (remote storage)
   * You can pass a simple object: { someOption: 'someValue' }
   * or a function which returns and object to add:
   * @example
   * fetchOptions: currentOpts => {
   *  return currentOpts.method === 'POST' ?  { method: 'PATCH' } : {};
   * },
   */
  fetchOptions?: string | ((opts: RequestInit) => RequestInit);

  /**
   * The remote storage sends the project data as a body of the request.
   * You can use this method to update the body before the store call in order to align
   * with your API requirements.
   * @default data => data
   */
  onStore?: (data: ProjectData, editor: Editor) => ProjectData;

  /**
   * The remote storage loads the project data directly from the request response.
   * You can use this method to properly extract the project data from the response.
   * @default data => data
   */
  onLoad?: (data: ProjectData, editor: Editor) => ProjectData;
}

export default class RemoteStorage implements IStorage<RemoteStorageConfig> {
  async store(data: ProjectData, opts: RemoteStorageConfig = {}) {
    return await this.request(opts.urlStore!, this.__props(opts, data), opts);
  }

  async load(opts: RemoteStorageConfig = {}) {
    return await this.request(opts.urlLoad!, this.__props(opts), opts);
  }

  request(url: string, props: RequestInit = {}, opts: RemoteStorageConfig = {}) {
    return fetch(url, props)
      .then((res: any) => {
        const result = res.text();
        const isOk = ((res.status / 200) | 0) === 1;
        return isOk ? result : result.then(Promise.reject);
      })
      .then((text: string) => {
        const parsable = text && isString(text);
        return opts.contentTypeJson && parsable ? JSON.parse(text) : text;
      });
  }

  __props(opts: RemoteStorageConfig = {}, data?: ProjectData): RequestInit {
    const typeJson = opts.contentTypeJson;
    const headers = opts.headers || {};
    const fetchOpts = opts.fetchOptions || {};
    const reqHead = 'X-Requested-With';
    const typeHead = 'Content-Type';
    let body;

    if (isUndefined(headers[reqHead])) {
      headers[reqHead] = 'XMLHttpRequest';
    }

    if (isUndefined(headers[typeHead]) && typeJson) {
      headers[typeHead] = 'application/json; charset=utf-8';
    }

    if (data) {
      if (typeJson) {
        body = JSON.stringify(data);
      } else {
        body = new FormData();

        for (let key in data) {
          body.append(key, data[key]);
        }
      }
    }

    const result: RequestInit = {
      method: body ? 'POST' : 'GET',
      credentials: opts.credentials,
      headers,
      body,
    };

    return {
      ...result,
      ...(isFunction(fetchOpts) ? fetchOpts(result) : fetchOpts),
    };
  }
}
