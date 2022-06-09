import Promise from 'promise-polyfill';
import { hasWin } from './mixins';

if (hasWin()) {
  window.Promise = window.Promise || Promise;
}

export default typeof fetch == 'function'
  ? fetch.bind()
  : (url, options) => {
      return new Promise((res, rej) => {
        const req = new XMLHttpRequest();
        req.open(options.method || 'get', url);
        req.withCredentials = options.credentials == 'include';

        for (let k in options.headers || {}) {
          req.setRequestHeader(k, options.headers[k]);
        }

        req.onload = e =>
          res({
            status: req.status,
            statusText: req.statusText,
            text: () => Promise.resolve(req.responseText),
          });
        req.onerror = rej;

        // Actually, fetch doesn't support onProgress feature
        if (req.upload && options.onProgress) {
          req.upload.onprogress = options.onProgress;
        }

        // Include body only if present
        options.body ? req.send(options.body) : req.send();
      });
    };
