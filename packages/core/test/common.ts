import Editor from '../src/editor';

// DocEl + Head + Wrapper
export const DEFAULT_CMPS = 3;

export function setupTestEditor() {
  const editor = new Editor({
    mediaCondition: 'max-width',
    avoidInlineStyle: true,
  });
  const em = editor.getModel();
  const dsm = em.DataSources;
  document.body.innerHTML = '<div id="fixtures"></div>';
  const { Pages, Components } = em;
  Pages.onLoad();
  const cmpRoot = Components.getWrapper()!;
  const View = Components.getType('wrapper')!.view;
  const wrapperEl = new View({
    model: cmpRoot,
    config: { ...cmpRoot.config, em },
  });
  wrapperEl.render();
  const fixtures = document.body.querySelector('#fixtures')!;
  fixtures.appendChild(wrapperEl.el);
  return { editor, em, dsm, cmpRoot, fixtures: fixtures as HTMLElement };
}

export function flattenHTML(html: string) {
  return html.replace(/>\s+|\s+</g, (m) => m.trim());
}
