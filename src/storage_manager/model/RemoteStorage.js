import { isUndefined, isFunction, isString } from 'underscore';
import fetch from '../../utils/fetch';

export default class RemoteStorage {
  async store(data, opts = {}) {
    await this.request(opts.urlStore, this.__props(opts, data), opts);
  }

  async load(opts) {
    return await this.request(opts.urlLoad, this.__props(opts), opts);
  }

  request(url, props = {}, opts = {}) {
    return fetch(url, props)
      .then(res => {
        const result = res.text();
        const isOk = ((res.status / 200) | 0) === 1;
        return isOk ? result : result.then(Promise.reject);
      })
      .then(text => {
        const parsable = text && isString(text);
        return opts.contentTypeJson && parsable ? JSON.parse(text) : text;
      });
  }

  __props(opts = {}, data) {
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

    const result = {
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
