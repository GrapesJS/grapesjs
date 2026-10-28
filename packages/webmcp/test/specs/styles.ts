import type { Editor } from 'grapesjs';
import { createEditor, createModelContext } from '../helpers';

describe('Style tools', () => {
  let editor: Editor;
  let call: ReturnType<typeof createModelContext>['call'];

  beforeEach(async () => {
    const res = await createEditor(
      {},
      {
        components: '<div id="box" class="card">Box</div>',
        style: '.card { color: red; } @media (max-width: 768px) { .card { color: blue; } }',
      },
    );
    editor = res.editor;
    call = (name, input, opts) => res.mc.call(`grapesjs_${name}`, input, opts);
  });

  afterEach(() => editor.destroy());

  test('set_component_style merges and removes properties', async () => {
    await call('set_component_style', { id: 'box', style: { color: 'green', padding: '10px' } });
    let res = await call('set_component_style', { id: 'box', style: { padding: '', 'font-size': 12 } });
    expect(res.style).toEqual({ color: 'green', 'font-size': '12' });
    res = await call('set_component_style', { id: 'box', style: { margin: '0' }, replace: true });
    expect(res.style).toEqual({ margin: '0' });
    expect(editor.getCss()).toContain('#box{margin:0;}');
  });

  test('update_component_classes', async () => {
    expect((await call('update_component_classes', { id: 'box', add: ['a', 'b'], remove: ['card'] })).classes).toEqual([
      'a',
      'b',
    ]);
    expect((await call('update_component_classes', { id: 'box', set: ['x'] })).classes).toEqual(['x']);
    expect(await call('update_component_classes', { id: 'box', add: ['.bad'] })).toMatchObject({
      error: { code: 'invalid_input' },
    });
  });

  test('get_css_rules', async () => {
    const all = await call('get_css_rules', { selector: '.card' });
    expect(all.total).toBe(2);
    const media = await call('get_css_rules', { selector: '.card', atRuleParams: '(max-width: 768px)' });
    expect(media.items).toEqual([
      expect.objectContaining({ atRuleType: 'media', atRuleParams: '(max-width: 768px)', style: { color: 'blue' } }),
    ]);
    const base = await call('get_css_rules', { selector: '.card', atRuleParams: '' });
    expect(base.items).toEqual([expect.objectContaining({ atRuleParams: '', style: { color: 'red' } })]);
  });

  test('set_css_rule with state and media', async () => {
    let res = await call('set_css_rule', { selector: '.card:hover', style: { color: 'black' } });
    expect(res.rule).toMatchObject({ selector: '.card:hover', state: 'hover', style: { color: 'black' } });

    res = await call('set_css_rule', {
      selector: '.card',
      style: { 'font-weight': 'bold' },
      atRuleParams: '(max-width: 768px)',
    });
    expect(res.rule.style).toEqual({ color: 'blue', 'font-weight': 'bold' });
    expect(editor.getCss()).toContain('@media (max-width: 768px){.card{color:blue;font-weight:bold;}}');

    res = await call('set_css_rule', { selector: '.card', style: { margin: 0 }, replace: true });
    expect(res.rule.style).toEqual({ margin: '0' });
  });

  test('remove_css_rule', async () => {
    await call('set_css_rule', { selector: '.card:hover', style: { color: 'black' } });
    expect((await call('remove_css_rule', { selector: '.card:hover' })).removed.selector).toBe('.card:hover');
    expect(await call('remove_css_rule', { selector: '.card:hover' })).toMatchObject({ error: { code: 'not_found' } });
    await call('remove_css_rule', { selector: '.card', atRuleParams: '(max-width: 768px)' });
    expect(editor.getCss()).not.toContain('@media');
    expect(editor.getCss()).toContain('.card{color:red;}');
  });
});
