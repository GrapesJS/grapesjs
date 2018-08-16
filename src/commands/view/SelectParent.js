module.exports = {
  run(editor) {
    const sel = editor.getSelected();
    let comp = sel && sel.parent();

    // Recurse through the parent() chain until a selectable parent is found
    while (comp && !comp.get('selectable')) {
      comp = comp.parent();
    }

    comp && editor.select(comp);
  }
};
