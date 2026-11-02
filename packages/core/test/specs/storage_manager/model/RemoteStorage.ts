import RemoteStorage from '../../../../src/storage_manager/model/RemoteStorage';

describe('RemoteStorage requests', () => {
  const url = 'https://example.test/projects';
  let storage: RemoteStorage;

  beforeEach(() => {
    storage = new RemoteStorage();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('loads JSON using native fetch in the JSDOM environment', async () => {
    const data = { pages: [] };
    const urlLoad = `data:application/json,${encodeURIComponent(JSON.stringify(data))}`;

    await expect(storage.load({ urlLoad, contentTypeJson: true })).resolves.toEqual(data);
  });

  test('uses the current global fetch to store JSON', async () => {
    const data = { pages: [] };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(data)));

    await expect(
      storage.store(data, { urlStore: url, contentTypeJson: true, credentials: 'include' }),
    ).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(data),
    });
  });

  test('propagates fetch failures', async () => {
    const error = new Error('Network error');
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(error);

    await expect(storage.load({ urlLoad: url })).rejects.toBe(error);
  });
});
