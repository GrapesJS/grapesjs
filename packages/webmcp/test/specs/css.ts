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
    expect(media.items).toEqual([
      expect.objectContaining({ atRuleType: 'media', atRuleParams: '(max-width: 768px)', style: { color: 'blue' } }),
    ]);
    const base = await call('get_css_rules', { selector: '.card', atRuleParams: '' });
    expect(base.items).toEqual([expect.objectContaining({ atRuleParams: '', style: { color: 'red' } })]);
  });

  test('set_css_rules with state and media', async () => {
    const res = await call('set_css_rules', {
      rules: [
        { selector: '.card:hover', style: { color: 'black' } },
        { selector: '.card', style: { 'font-weight': 'bold' }, atRuleParams: '(max-width: 768px)' },
      ],
    });
    expect(res.rules[0]).toMatchObject({ selector: '.card:hover', state: 'hover', style: { color: 'black' } });
    expect(res.rules[1].style).toEqual({ color: 'blue', 'font-weight': 'bold' });
    expect(editor.getCss()).toContain('@media (max-width: 768px){.card{color:blue;font-weight:bold;}}');

    const replaced = await call('set_css_rules', {
      rules: [{ selector: '.card', style: { margin: 0 } }],
      replace: true,
    });
    expect(replaced.rules[0].style).toEqual({ margin: '0' });
  });

  test('set_css_rules with raw CSS', async () => {
    const res = await call('set_css_rules', {
      css: '.card { font-size: 12px } .btn:hover { color: white } section .title { font-weight: bold } @media (max-width: 768px) { .card { opacity: 0.5 } }',
    });
    // Merged into the existing rules by default
    expect(res.rules.map((r: any) => r.css)).toEqual([
      '.card{color:red;font-size:12px;}',
      '.btn:hover{color:white;}',
      'section .title{font-weight:bold;}',
      '@media (max-width: 768px){.card{color:blue;opacity:0.5;}}',
    ]);
    expect(editor.Css.getRule('.btn:hover')).toBeTruthy();

    const replaced = await call('set_css_rules', { css: '.card { opacity: 1 }', replace: true });
    expect(replaced.rules[0].css).toBe('.card{opacity:1;}');
  });

  test('set_css_rules with rules and CSS together', async () => {
    const res = await call('set_css_rules', {
      rules: [{ selector: '.a', style: { color: 'red' } }],
      css: '.b { color: blue }',
    });
    expect(res.rules.map((r: any) => r.css)).toEqual(['.a{color:red;}', '.b{color:blue;}']);
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
    expect(res.removed.map((r: any) => r.selector)).toEqual(['.card:hover', '.card']);
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
