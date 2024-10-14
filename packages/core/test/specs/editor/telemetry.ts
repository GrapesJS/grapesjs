import Editor from '../../../src/editor';

describe('Editor telemetry', () => {
  let editor = new Editor();
  let originalFetch: typeof fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = fetchMock;

    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  const triggerLoadAndWait = (editor: Editor) => {
    return new Promise<void>((resolve) => {
      editor.on('telemetry:sent', () => {
        resolve();
      });
      editor.getModel().trigger('load');
    });
  };

  test('Telemetry is sent when enabled', async () => {
    editor = new Editor({
      telemetry: true,
    });

    await triggerLoadAndWait(editor);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/gjs/telemetry/collect');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      type: 'EDITOR:LOAD',
      domain: expect.any(String),
      version: expect.any(String),
      url: expect.any(String),
    });
  });

  test('Telemetry is not sent when disabled', async () => {
    editor = new Editor({
      telemetry: false,
    });

    await triggerLoadAndWait(editor);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Telemetry is not sent twice in the same session', async () => {
    const version = '1.0.0';
    (global as any).__GJS_VERSION__ = version;

    window.sessionStorage.getItem = jest.fn(() => 'true');

    editor = new Editor({
      telemetry: true,
    });

    await triggerLoadAndWait(editor);

    expect(window.sessionStorage.getItem).toHaveBeenCalledWith(`gjs_telemetry_sent_${version}`);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(`Telemetry already sent for version ${version} this session`);
  });

  test('Telemetry handles fetch errors gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    editor = new Editor({
      telemetry: true,
    });

    await triggerLoadAndWait(editor);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Failed to send telemetry data', expect.any(Error));
  });

  test('Telemetry cleans up old version keys', async () => {
    const version = '1.0.0';
    (global as any).__GJS_VERSION__ = version;

    const sessionStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
    Object.defineProperty(sessionStorageMock, 'length', { value: 3 });
    Object.defineProperty(sessionStorageMock, 'key', {
      value: (index: number) => {
        const keys = ['gjs_telemetry_sent_0.9.0', 'gjs_telemetry_sent_0.9.1', 'other_key'];
        return keys[index];
      },
    });

    editor = new Editor({
      telemetry: true,
    });

    await triggerLoadAndWait(editor);

    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('gjs_telemetry_sent_0.9.0');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('gjs_telemetry_sent_0.9.1');
    expect(sessionStorageMock.removeItem).not.toHaveBeenCalledWith('other_key');
  });
});
