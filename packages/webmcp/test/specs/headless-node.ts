/**
 * @jest-environment node
 */
import grapesjs from 'grapesjs';
import webMcpPlugin, { ToolNames, WebMcpEvents } from '../../src';
import { createDefaultTools } from '../../src/tools';

describe('Headless', () => {
  test('Runs without browser globals', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
  });

  test('Plugin does not crash the editor and tools work', async () => {
    const logs: string[] = [];
    const editor = grapesjs.init({
      headless: true,
      storageManager: false,
      projectData: {
        pages: [
          { component: { attributes: { id: 'box', class: 'card' }, components: { type: 'textnode', content: 'Box' } } },
        ],
      },
      plugins: [
        (ed) => {
          ed.on('log:error', (msg: string) => logs.push(msg));
          return webMcpPlugin(ed, { instructions: 'Be nice' });
        },
      ],
    });
    const webmcp = editor.runCommand('webMcpManager');
    const executed: string[] = [];
    editor.on(WebMcpEvents.toolExecute, ({ name }) => executed.push(name));

    // All default tools are available, even without WebMCP
    const names = webmcp.getTools().map((tool) => tool.name);
    expect(names.sort()).toEqual(
      createDefaultTools({ editor, instructions: 'x' })
        .map((t) => t.name)
        .sort(),
    );

    // Headless editors never get the canvas, so they are not ready
    expect(await webmcp.executeTool(ToolNames.getEditorState)).toMatchObject({ ready: false });
    expect(await webmcp.executeTool(ToolNames.getEditorGuide)).toEqual({ instructions: 'Be nice' });
    expect(await webmcp.executeTool(ToolNames.getComponents, { ids: ['box'] })).toMatchObject({
      items: [{ id: 'box', attributes: { id: 'box', class: 'card' } }],
    });
    expect(
      await webmcp.executeTool(ToolNames.addComponents, {
        components: { tagName: 'p', components: { type: 'textnode', content: 'New' } },
      }),
    ).toMatchObject({ added: [{ tagName: 'p' }] });
    expect(
      await webmcp.executeTool(ToolNames.updateComponents, { updates: [{ id: 'box', attributes: { title: 'T' } }] }),
    ).toMatchObject({
      updated: [{ attributes: { title: 'T' } }],
    });
    expect(
      await webmcp.executeTool(ToolNames.setCssRules, { rules: [{ selector: '.card', style: { color: 'red' } }] }),
    ).toMatchObject({ count: 1, rules: [{ selector: '.card' }] });
    expect(await webmcp.executeTool(ToolNames.getPageCode, { includeStyles: true })).toMatchObject({
      code: expect.stringContaining('<p>New</p>'),
      styles: expect.stringContaining('.card{color:red;}'),
    });
    expect(await webmcp.executeTool(ToolNames.listPages)).toMatchObject({ pages: [{ selected: true }] });
    expect(await webmcp.executeTool(ToolNames.listDevices)).toMatchObject({ devices: expect.any(Array) });
    expect(await webmcp.executeTool(ToolNames.getProjectData)).toMatchObject({
      projectData: { pages: expect.any(Array) },
    });

    // Tools depending on browser APIs (HTML/CSS parsers) return errors instead of throwing
    expect(await webmcp.executeTool(ToolNames.addComponents, { components: '<p>Html</p>' })).toMatchObject({
      error: { code: 'execution_error' },
    });
    expect(await webmcp.executeTool(ToolNames.setCssRules, { css: '.a { color: blue }' })).toEqual(expect.any(Object));

    expect(executed.length).toBeGreaterThan(5);
    expect(logs).toEqual([]);
    expect(() => editor.destroy()).not.toThrow();
    expect(webmcp.getTools()).toEqual([]);
  });
});
