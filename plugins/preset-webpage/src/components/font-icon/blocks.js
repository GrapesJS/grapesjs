export default function (editor, opts = {}) {
  const bm = editor.BlockManager;
  const cssClass = opts.cssClass;

  if (opts.blocks.indexOf('font-icon') >= 0) {
    bm.add('font-icon', {
      label: editor.I18n.t('font_icon'),
      category: editor.I18n.t('extra'),
      attributes: {class: 'fa-solid fa-icons', style: 'font-size: 1.5rem; font-weight: 900'},
      content: `
        <i class="fa-solid fa-star"></i>
      `
    });
  }
}
