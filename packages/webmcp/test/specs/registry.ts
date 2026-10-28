import { getModelContext, registerTools, WebMcpTool } from '../../src';
import { createModelContext, flush } from '../helpers';

const tool = (name: string): WebMcpTool => ({ name, description: name, execute: () => ({}) });

describe('registerTools', () => {
  test('getModelContext prefers document over navigator', () => {
    expect(getModelContext()).toBeUndefined();
    const legacy = { registerTool: jest.fn() };
    const modern = { registerTool: jest.fn() };
    (navigator as any).modelContext = legacy;
    expect(getModelContext()).toBe(legacy);
    (document as any).modelContext = modern;
    expect(getModelContext()).toBe(modern);
    delete (navigator as any).modelContext;
    delete (document as any).modelContext;
  });

  test('Unregisters via abort signal and is idempotent', async () => {
    const mc = createModelContext();
    const reg = registerTools(mc.modelContext, [tool('a'), tool('b')]);
    await reg.ready;
    expect([...mc.tools.keys()]).toEqual(['a', 'b']);
    reg.unregister();
    reg.unregister();
    expect(mc.tools.size).toBe(0);
  });

  test('Supports legacy unregisterTool', async () => {
    const names = new Set<string>();
    const legacy = {
      registerTool: jest.fn((t: any) => void names.add(t.name)),
      unregisterTool: jest.fn((name: string) => void names.delete(name)),
    };
    const reg = registerTools(legacy, [tool('a'), tool('b')]);
    await reg.ready;
    expect([...names]).toEqual(['a', 'b']);
    reg.unregister();
    expect(legacy.unregisterTool).toHaveBeenCalledTimes(2);
    expect(names.size).toBe(0);
  });

  test('Supports legacy registration handles', async () => {
    const unregister = jest.fn();
    const legacy = { registerTool: jest.fn(() => ({ unregister })), unregisterTool: jest.fn() };
    const reg = registerTools(legacy, [tool('a')]);
    await reg.ready;
    reg.unregister();
    expect(unregister).toHaveBeenCalledTimes(1);
    expect(legacy.unregisterTool).not.toHaveBeenCalled();
  });

  test('Rolls back on synchronous failure', async () => {
    const mc = createModelContext();
    mc.tools.set('b', tool('b') as any); // Name taken by someone else
    const reg = registerTools(mc.modelContext, [tool('a'), tool('b'), tool('c')]);
    await expect(reg.ready).rejects.toThrow('already registered');
    expect([...mc.tools.keys()]).toEqual(['b']);
  });

  test('Rolls back on asynchronous failure', async () => {
    const mc = createModelContext();
    const registerTool = jest.fn((t: any, opts: any) =>
      t.name === 'c' ? Promise.reject(new Error('Rejected')) : mc.registerTool(t, opts),
    );
    const reg = registerTools({ registerTool }, [tool('a'), tool('b'), tool('c')]);
    await expect(reg.ready).rejects.toThrow('Rejected');
    expect(mc.tools.size).toBe(0);
  });

  test('Unregister during pending registration', async () => {
    let resolve!: () => void;
    const mc = createModelContext();
    const registerTool = jest.fn((t: any, opts: any) => {
      mc.registerTool(t, opts);
      return new Promise<void>((res) => (resolve = res));
    });
    const reg = registerTools({ registerTool }, [tool('a'), tool('b')]);
    await flush();
    reg.unregister();
    resolve();
    await reg.ready;
    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(mc.tools.size).toBe(0);
  });
});
