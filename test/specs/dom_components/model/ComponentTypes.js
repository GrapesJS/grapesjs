import Editor from 'editor';

describe('Component Types', () => {
  let editor;
  let wrapper;

  const expectedType = (input, type, opts = {}) => {
    const cmp = wrapper.append(input)[0];
    expect(wrapper.components().length).toBe(opts.total || 1);
    !opts.skipHtml && expect(cmp.toHTML()).toBe(input);
    expect(cmp.is(type)).toBe(true);
  };

  beforeAll(() => {
    editor = new Editor({ allowScripts: 1 });
    editor
      .getModel()
      .get('PageManager')
      .onLoad();
    wrapper = editor.getWrapper();
  });

  afterAll(() => {
    editor.destroy();
  });

  afterEach(() => {
    wrapper.components().reset();
  });

  test('<img> is correctly recognized', () => {
    expectedType('<img src="img.png" attr-test="value"/>', 'image');
  });

  test('<label> is correctly recognized', () => {
    expectedType('<label attr-test="value">Hello</label>', 'label');
  });

  test('<a> is correctly recognized', () => {
    expectedType('<a href="/link">link</a>', 'link');
  });

  test('<table> is correctly recognized', () => {
    expectedType('<table></table>', 'table', { skipHtml: 1 });
  });

  test('<thead> is correctly recognized', () => {
    expectedType('<thead></thead>', 'thead', { skipHtml: 1 });
  });

  test('<tbody> is correctly recognized', () => {
    expectedType('<tbody></tbody>', 'tbody', { skipHtml: 1 });
  });

  test('<tr> is correctly recognized', () => {
    expectedType('<tr></tr>', 'row');
  });

  test('<video> is correctly recognized', () => {
    expectedType('<video></video>', 'video', { skipHtml: 1 });
  });

  test('<td> & <th> are correctly recognized', () => {
    expectedType('<td></td>', 'cell');
    expectedType('<th></th>', 'cell', { total: 2 });
  });

  test('<tfoot> is correctly recognized', () => {
    expectedType('<tfoot></tfoot>', 'tfoot', { skipHtml: 1 });
  });

  test('<script> is correctly recognized', () => {
    // const scr = 'console.log("Inline script");'; // issues with jsdom parser
    const scr = ``;
    expectedType(`<script attr-test="value">${scr}</script>`, 'script');
  });

  test('<iframe> is correctly recognized', () => {
    expectedType(
      `<iframe frameborder="0" src="/somewhere" attr-test="value"></iframe>`,
      'iframe'
    );
  });

  test('<svg> is correctly recognized', () => {
    const cmp = wrapper.append(`<svg viewBox="0 0 24 24" height="30px">
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"></path></svg>
        `)[0];
    expect(wrapper.components().length).toBe(1);
    expect(cmp.is('svg')).toBe(true);
    expect(
      cmp
        .components()
        .at(0)
        .is('svg-in')
    ).toBe(true);
  });
});
