import type { Editor } from 'grapesjs';
import { createEditor, createModelContext } from '../helpers';

describe('CSS rule tools', () => {
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

  test('get_css_rules', async () => {
    const all = await call('get_css_rules', { selector: '.card' });
    expect(all.total).toBe(2);
    const media = await call('get_css_rules', { selector: '.card', atRuleParams: '(max-width: 768px)' });
    expect(media.items).toEqual(['@media (max-width: 768px){.card{color:blue;}}']);
    const base = await call('get_css_rules', { selector: '.card', atRuleParams: '', format: 'style' });
    expect(base.items).toEqual([
      { selector: '.card', state: '', atRuleType: '', atRuleParams: '', style: { color: 'red' } },
    ]);
  });

  test('get_css_rules keeps empty rules', async () => {
    editor.Css.setRule('.empty', {});
    expect((await call('get_css_rules', { selector: '.empty' })).items).toEqual(['.empty{}']);
  });

  test('set_css_rules with state and media', async () => {
    const res = await call('set_css_rules', {
      rules: [
        { selector: '.card:hover', style: { color: 'black' } },
        { selector: '.card', style: { 'font-weight': 'bold' }, atRuleParams: '(max-width: 768px)' },
      ],
    });
    // Only the identifiers of the affected rules are returned
    expect(res).toEqual({
      count: 2,
      rules: [
        { selector: '.card:hover', state: 'hover', atRuleType: '', atRuleParams: '' },
        { selector: '.card', state: '', atRuleType: 'media', atRuleParams: '(max-width: 768px)' },
      ],
    });
    expect(editor.getCss()).toContain('.card:hover{color:black;}');
    expect(editor.getCss()).toContain('@media (max-width: 768px){.card{color:blue;font-weight:bold;}}');

    await call('set_css_rules', {
      rules: [{ selector: '.card', style: { margin: 0 } }],
      replace: true,
    });
    expect(editor.Css.getRule('.card')!.getStyle()).toEqual({ margin: '0' });
  });

  test('set_css_rules with raw CSS', async () => {
    const res = await call('set_css_rules', {
      css: '.card { font-size: 12px } .btn:hover { color: white } section .title { font-weight: bold } @media (max-width: 768px) { .card { opacity: 0.5 } }',
    });
    expect(res.count).toBe(4);
    expect(res.rules.map((r: any) => r.selector)).toEqual(['.card', '.btn:hover', 'section .title', '.card']);
    // Merged into the existing rules by default
    const css = editor.getCss({ keepUnusedStyles: true });
    expect(css).toContain('.card{color:red;font-size:12px;}');
    expect(css).toContain('.btn:hover{color:white;}');
    expect(css).toContain('section .title{font-weight:bold;}');
    expect(css).toContain('@media (max-width: 768px){.card{color:blue;opacity:0.5;}}');

    await call('set_css_rules', { css: '.card { opacity: 1 }', replace: true });
    expect(editor.Css.getRule('.card')!.toCSS()).toBe('.card{opacity:1;}');
  });

  test('set_css_rules with rules and CSS together', async () => {
    const res = await call('set_css_rules', {
      rules: [{ selector: '.a', style: { color: 'red' } }],
      css: '.b { color: blue }',
    });
    expect(res.rules.map((r: any) => r.selector)).toEqual(['.a', '.b']);
    expect(editor.getCss({ keepUnusedStyles: true })).toContain('.a{color:red;}.b{color:blue;}');
  });

  test('set_css_rules input errors', async () => {
    expect(await call('set_css_rules', {})).toMatchObject({ error: { code: 'invalid_input' } });
    expect(await call('set_css_rules', { css: '  ' })).toMatchObject({ error: { code: 'invalid_input' } });
    expect(
      await call('set_css_rules', {
        rules: [
          { selector: '.ok', style: {} },
          { selector: ' ', style: {} },
        ],
      }),
    ).toEqual({
      error: { code: 'invalid_input', message: 'input.rules[1].selector is empty' },
    });
    expect(editor.Css.getRule('.ok')).toBeFalsy();
  });

  test('remove_css_rules', async () => {
    await call('set_css_rules', { rules: [{ selector: '.card:hover', style: { color: 'black' } }] });
    const res = await call('remove_css_rules', {
      rules: [{ selector: '.card:hover' }, { selector: '.card', atRuleParams: '(max-width: 768px)' }],
    });
    expect(res.removed).toEqual(['.card:hover{color:black;}', '@media (max-width: 768px){.card{color:blue;}}']);
    expect(editor.getCss()).not.toContain('@media');
    expect(editor.getCss()).not.toContain(':hover');
    expect(editor.getCss()).toContain('.card{color:red;}');
  });

  test('remove_css_rules removes nothing if a rule is missing', async () => {
    const res = await call('remove_css_rules', { rules: [{ selector: '.card' }, { selector: '.nope' }] });
    expect(res).toEqual({ error: { code: 'not_found', message: 'CSS rules not found: ".nope"' } });
    expect(editor.getCss()).toContain('.card{color:red;}');
    expect(await call('remove_css_rules', { rules: [] })).toMatchObject({ error: { code: 'invalid_input' } });
  });
});
