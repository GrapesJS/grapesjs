import Editor from 'editor';

describe('Component Types', () => {
  let editor;
  let wrapper;

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

  test('<script> is correctly recognized', () => {
    // const scr = 'console.log("Inline script");'; // issues with jsdom parser
    const scr = ``;
    const scrFull = `<script attr-test="value">${scr}</script>`;
    const cmp = wrapper.append(scrFull)[0];
    expect(wrapper.components().length).toBe(1);
    expect(cmp.toHTML()).toBe(scrFull);
    expect(cmp.is('script')).toBe(true);
  });

  test('<iframe> is correctly recognized', () => {
    const str =
      '<iframe frameborder="0" src="/somewhere" attr-test="value"></iframe>';
    const cmp = wrapper.append(str)[0];
    expect(wrapper.components().length).toBe(1);
    expect(cmp.toHTML()).toBe(str);
    expect(cmp.is('iframe')).toBe(true);
  });

  test.skip('<svg> is correctly recognized', () => {
    const cmp = wrapper.append(`<svg viewBox="0 0 24 24" height="30px">
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"></path></svg>
        `)[0];
    expect(wrapper.components().length).toBe(1);
    expect(cmp.is('svg')).toBe(true);
  });
});
