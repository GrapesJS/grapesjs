import { isUndefined, isFunction, isString } from "underscore";
import fetch from "../../utils/fetch";
import IStorage from "./IStorage";

interface RemoteStorageConfig {
  urlStore: string;
  urlLoad: string;
  contentTypeJson: boolean;
  credentials: string;
  headers?: any;
  fetchOptions?: any;
}
export default class RemoteStorage implements IStorage {
  config: RemoteStorageConfig;
  constructor(config: RemoteStorageConfig) {
    this.config = config;
  }

  async store(data: any) {
    const { urlStore } = this.config;
    await this.request(urlStore, this.__props(data));
  }

  async load() {
    const { urlLoad } = this.config;
    return await this.request(urlLoad, this.__props());
  }

  request(url: string, props: any = {}) {
    const { contentTypeJson } = this.config;
    return fetch(url, props)
      .then((res) => {
        const result = res.text();
        const isOk = ((res.status / 200) | 0) === 1;
        return isOk ? result : result.then(Promise.reject);
      })
      .then((text) => {
        const parsable = text && isString(text);
        return contentTypeJson && parsable ? JSON.parse(text) : text;
      });
  }

  __props(data?: any) {
    const { contentTypeJson, credentials } = this.config;
    const { headers = {}, fetchOptions = {} } = this.config;
    const reqHead = "X-Requested-With";
    const typeHead = "Content-Type";
    let body;

    if (isUndefined(headers[reqHead])) {
      headers[reqHead] = "XMLHttpRequest";
    }

    if (isUndefined(headers[typeHead]) && contentTypeJson) {
      headers[typeHead] = "application/json; charset=utf-8";
    }

    if (data) {
      if (contentTypeJson) {
        body = JSON.stringify(data);
      } else {
        body = new FormData();

        for (let key in data) {
          body.append(key, data[key]);
        }
      }
    }

    const result = {
      method: body ? "POST" : "GET",
      credentials: credentials,
      headers,
      body,
    };

    return {
      ...result,
      ...(isFunction(fetchOptions) ? fetchOptions(result) : fetchOptions),
    };
  }
}
