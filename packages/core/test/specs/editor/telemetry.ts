import { EditorConfig } from '../../../src/editor/config/config';
import EditorView from '../../../src/editor/view/EditorView';
import { fixJsDom, fixJsDomIframe, waitEditorEvent } from '../../common';

const grapesjs = require('../../../src').default;

describe('Editor telemetry', () => {
  const version = '1.0.0';
  let editorName = '';
  let config: Partial<EditorConfig>;

  let originalFetch: typeof fetch;
  let originalWindowFetch: typeof window.fetch;
  let fetchMock: jest.Mock;

  const initTestEditor = (config: Partial<EditorConfig>) => {
    grapesjs.version = version;
    const editor = grapesjs.init({
      ...config,
      plugins: [fixJsDom, ...(config.plugins || [])],
    });
    fixJsDomIframe(editor.getModel().shallow);

    return editor;
  };

  const getSendTelemetryData = (hostname = 'example.com') => {
    jest.resetModules();
    let sendTelemetryData: any;

    jest.isolateModules(() => {
      jest.doMock('../../../src/utils/host-name', () => ({
        getHostName: jest.fn(() => hostname),
      }));
      sendTelemetryData = require('../../../src/editor/view/EditorView').default.prototype.sendTelemetryData;
    });

    return sendTelemetryData;
  };

  beforeAll(() => {
    editorName = 'editor-fixture';
  });

  beforeEach(() => {
    config = {
      container: `#${editorName}`,
      storageManager: {
        autoload: false,
        autosave: false,
        type: '',
      },
    };
    document.body.innerHTML = `<div id="fixtures"><div id="${editorName}"></div></div>`;

    originalFetch = global.fetch;
    originalWindowFetch = window.fetch;
    fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
    Object.defineProperty(global, 'fetch', { value: fetchMock, configurable: true, writable: true });
    Object.defineProperty(window, 'fetch', { value: fetchMock, configurable: true, writable: true });

    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, configurable: true });
    Object.defineProperty(global, 'sessionStorage', { value: sessionStorageMock, configurable: true });

    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    Object.defineProperty(global, 'fetch', { value: originalFetch, configurable: true, writable: true });
    Object.defineProperty(window, 'fetch', { value: originalWindowFetch, configurable: true, writable: true });
    jest.clearAllMocks();
    jest.dontMock('../../../src/utils/host-name');
  });

  test('Telemetry hook is invoked when enabled', async () => {
    const spy = jest.spyOn(EditorView.prototype as any, 'sendTelemetryData').mockResolvedValue(undefined);
    const editor = initTestEditor({
      ...config,
      telemetry: true,
    });

    await waitEditorEvent(editor, 'load');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Telemetry hook is not invoked when disabled', async () => {
    const spy = jest.spyOn(EditorView.prototype as any, 'sendTelemetryData').mockResolvedValue(undefined);
    const editor = initTestEditor({
      ...config,
      telemetry: false,
    });

    await waitEditorEvent(editor, 'load');

    expect(spy).not.toHaveBeenCalled();
  });

  test('Telemetry data is sent and session key stored', async () => {
    const sendTelemetryData = getSendTelemetryData();
    const trigger = jest.fn();

    await sendTelemetryData.call({
      model: { version },
      trigger,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/gjs/telemetry/collect');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      domain: 'example.com',
      version,
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith(`gjs_telemetry_sent_${version}`, 'true');
    expect(trigger).toHaveBeenCalledTimes(1);
  });

  test('Telemetry is not sent twice in the same session', async () => {
    sessionStorage.getItem = jest.fn(() => 'true');
    const sendTelemetryData = getSendTelemetryData();

    await sendTelemetryData.call({
      model: { version },
      trigger: jest.fn(),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Telemetry cleans up old version keys', async () => {
    const sessionStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      'gjs_telemetry_sent_0.9.0': 'true',
      'gjs_telemetry_sent_0.9.1': 'true',
      other_key: 'true',
    };

    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, configurable: true });
    Object.defineProperty(global, 'sessionStorage', { value: sessionStorageMock, configurable: true });
    Object.defineProperty(sessionStorageMock, 'length', { value: 3 });

    const sendTelemetryData = getSendTelemetryData();

    await sendTelemetryData.call({
      model: { version },
      trigger: jest.fn(),
    });

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(`gjs_telemetry_sent_${version}`, 'true');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('gjs_telemetry_sent_0.9.0');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('gjs_telemetry_sent_0.9.1');
    expect(sessionStorageMock.removeItem).not.toHaveBeenCalledWith('other_key');
  });

  test('Telemetry send can fail without noisy logging', async () => {
    const sendTelemetryData = getSendTelemetryData();
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      sendTelemetryData.call({
        model: { version },
        trigger: jest.fn(),
      }),
    ).rejects.toThrow('Network error');

    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});
