import grapesjs from '../../../src';
import { EditorConfig } from '../../../src/editor/config/config';
import { fixJsDom, fixJsDomIframe, waitEditorEvent } from '../../common';

import * as hostUtil from '../../../src/utils/host-name';
jest.mock('../../../src/utils/host-name');

describe('Editor telemetry', () => {
  const version = '1.0.0';
  let fixture: HTMLElement;
  let editorName = '';
  let htmlString = '';
  let config: Partial<EditorConfig>;
  let cssString = '';
  let documentEl = '';

  let originalFetch: typeof fetch;
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

  beforeAll(() => {
    jest.spyOn(hostUtil, 'getHostName').mockReturnValue('example.com');
    editorName = 'editor-fixture';
  });

  beforeEach(() => {
    const initHtml = '<div class="test1"></div><div class="test2"></div>';
    htmlString = `<body>${initHtml}</body>`;
    cssString = '.test2{color:red}.test3{color:blue}';
    documentEl = '<style>' + cssString + '</style>' + initHtml;
    config = {
      container: '#' + editorName,
      storageManager: {
        autoload: false,
        autosave: false,
        type: '',
      },
    };
    document.body.innerHTML = `<div id="fixtures"><div id="${editorName}"></div></div>`;
    fixture = document.body.querySelector(`#${editorName}`)!;

    originalFetch = global.fetch;
    fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = fetchMock;

    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'example.com',
      },
    });

    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test('Telemetry is sent when enabled', async () => {
    const editor = initTestEditor({
      ...config,
      telemetry: true,
    });

    await waitEditorEvent(editor, 'load');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/gjs/telemetry/collect');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      domain: expect.any(String),
      version: expect.any(String),
    });
  });

  test('Telemetry is not sent when disabled', async () => {
    const editor = initTestEditor({
      ...config,
      telemetry: false,
    });
    await waitEditorEvent(editor, 'load');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Telemetry is not sent twice in the same session', async () => {
    window.sessionStorage.getItem = jest.fn(() => 'true');

    const editor = initTestEditor({
      ...config,
      telemetry: true,
    });
    await waitEditorEvent(editor, 'load');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Telemetry handles fetch errors gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const editor = initTestEditor({
      ...config,
      telemetry: true,
    });
    await waitEditorEvent(editor, 'load');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
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
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
    Object.defineProperty(sessionStorageMock, 'length', { value: 3 });

    fetchMock.mockResolvedValueOnce({ ok: true });

    const editor = initTestEditor({
      ...config,
      telemetry: true,
    });
    await waitEditorEvent(editor, 'load');

    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(`gjs_telemetry_sent_${version}`, 'true');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('gjs_telemetry_sent_0.9.0');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('gjs_telemetry_sent_0.9.1');
    expect(sessionStorageMock.removeItem).not.toHaveBeenCalledWith('other_key');
  }, 10000);
});
