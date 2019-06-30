import Backbone from 'backbone';
import fetch from 'utils/fetch';
import { isUndefined, isFunction } from 'underscore';

export default Backbone.Model.extend({
  fetch,

  defaults: {
    urlStore: '',
    urlLoad: '',
    params: {},
    beforeSend() {},
    onComplete() {},
    contentTypeJson: false,
    credentials: 'include',
    fetchOptions: ''
  },

  /**
   * Triggered before the request is started
   * @private
   */
  onStart() {
    const em = this.get('em');
    const before = this.get('beforeSend');
    before && before();
  },

  /**
   * Triggered on request error
   * @param  {Object} err Error
   * @param  {Function} [clbErr] Error callback
   * @private
   */
  onError(err, clbErr) {
    if (clbErr) {
      clbErr(err);
    } else {
      const em = this.get('em');
      console.error(err);
      em && em.trigger('storage:error', err);
    }
  },

  /**
   * Triggered on request response
   * @param  {string} text Response text
   * @private
   */
  onResponse(text, clb) {
    const em = this.get('em');
    const complete = this.get('onComplete');
    const typeJson = this.get('contentTypeJson');
    const parsable = text && typeof text === 'string';
    const res = typeJson && parsable ? JSON.parse(text) : text;
    complete && complete(res);
    clb && clb(res);
    em && em.trigger('storage:response', res);
  },

  store(data, clb, clbErr) {
    const body = {};

    for (let key in data) {
      body[key] = data[key];
    }

    this.request(this.get('urlStore'), { body }, clb, clbErr);
  },

  load(keys, clb, clbErr) {
    this.request(this.get('urlLoad'), { method: 'get' }, clb, clbErr);
  },

  /**
   * Execute remote request
   * @param  {string} url Url
   * @param  {Object} [opts={}] Options
   * @param  {Function} [clb=null] Callback
   * @param  {Function} [clbErr=null] Error callback
   * @private
   */
  request(url, opts = {}, clb = null, clbErr = null) {
    const typeJson = this.get('contentTypeJson');
    const headers = this.get('headers') || {};
    const params = this.get('params');
    const reqHead = 'X-Requested-With';
    const typeHead = 'Content-Type';
    const bodyObj = opts.body || {};
    let fetchOptions;
    let body;

    for (let param in params) {
      bodyObj[param] = params[param];
    }

    if (isUndefined(headers[reqHead])) {
      headers[reqHead] = 'XMLHttpRequest';
    }

    // With `fetch`, have to send FormData without any 'Content-Type'
    // https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post

    if (isUndefined(headers[typeHead]) && typeJson) {
      headers[typeHead] = 'application/json; charset=utf-8';
    }

    if (typeJson) {
      body = JSON.stringify(bodyObj);
    } else {
      body = new FormData();

      for (let bodyKey in bodyObj) {
        body.append(bodyKey, bodyObj[bodyKey]);
      }
    }
    fetchOptions = {
      method: opts.method || 'post',
      credentials: this.get('credentials'),
      headers
    };

    // Body should only be included on POST method
    if (fetchOptions.method === 'post') {
      fetchOptions.body = body;
    }

    const fetchOpts = this.get('fetchOptions') || {};
    const addOpts = isFunction(fetchOpts)
      ? fetchOpts(fetchOptions)
      : fetchOptions;

    this.onStart();
    this.fetch(url, {
      ...fetchOptions,
      ...(addOpts || {})
    })
      .then(res =>
        ((res.status / 200) | 0) == 1
          ? res.text()
          : res.text().then(text => Promise.reject(text))
      )
      .then(text => this.onResponse(text, clb))
      .catch(err => this.onError(err, clbErr));
  }
});
