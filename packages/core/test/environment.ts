import { TestEnvironment } from 'jest-environment-jsdom';

export default class extends TestEnvironment {
  constructor(...args: ConstructorParameters<typeof TestEnvironment>) {
    super(...args);

    // JSDOM has its own global object; expose Node's native fetch APIs to tests.
    Object.assign(this.global, {
      fetch: globalThis.fetch,
      Headers: globalThis.Headers,
      Request: globalThis.Request,
      Response: globalThis.Response,
    });
  }
}
