import { WebMcpTool } from '../../src';
import { getModelContext, registerTool } from '../../src/registry';
import { createModelContext, flush } from '../helpers';

const tool = (name: string): WebMcpTool => ({ name, description: name, execute: () => ({}) });

describe('registerTool', () => {
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
    const regA = registerTool(mc.modelContext, tool('a'));
    registerTool(mc.modelContext, tool('b'));
    await regA.ready;
    expect([...mc.tools.keys()]).toEqual(['a', 'b']);
    regA.unregister();
    regA.unregister();
    expect([...mc.tools.keys()]).toEqual(['b']);
  });

  test('Supports legacy unregisterTool', async () => {
    const names = new Set<string>();
    const legacy = {
      registerTool: jest.fn((t: any) => void names.add(t.name)),
      unregisterTool: jest.fn((name: string) => void names.delete(name)),
    };
    const reg = registerTool(legacy, tool('a'));
    await reg.ready;
    expect([...names]).toEqual(['a']);
    reg.unregister();
    expect(legacy.unregisterTool).toHaveBeenCalledTimes(1);
    expect(names.size).toBe(0);
  });

  test('Supports legacy registration handles', async () => {
    const unregister = jest.fn();
    const legacy = { registerTool: jest.fn(() => ({ unregister })), unregisterTool: jest.fn() };
    const reg = registerTool(legacy, tool('a'));
    await reg.ready;
    reg.unregister();
    expect(unregister).toHaveBeenCalledTimes(1);
    expect(legacy.unregisterTool).not.toHaveBeenCalled();
  });

  test('Failures reject the registration', async () => {
    const mc = createModelContext();
    mc.tools.set('a', tool('a') as any); // Name taken by someone else
    await expect(registerTool(mc.modelContext, tool('a')).ready).rejects.toThrow('already registered');
    const rejecting = { registerTool: () => Promise.reject(new Error('Rejected')) };
    await expect(registerTool(rejecting, tool('b')).ready).rejects.toThrow('Rejected');
  });

  test('Unregister during pending registration', async () => {
    let resolve!: () => void;
    const unregisterTool = jest.fn();
    const pending = { registerTool: () => new Promise<void>((res) => (resolve = res)), unregisterTool };
    const reg = registerTool(pending, tool('a'));
    reg.unregister();
    expect(unregisterTool).not.toHaveBeenCalled();
    resolve();
    await reg.ready;
    await flush();
    // Removed once the registration settles
    expect(unregisterTool).toHaveBeenCalledWith('a');
  });
});
