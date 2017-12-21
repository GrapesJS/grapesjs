module.exports = {

  run(editor) {
    var comp = editor.getSelected() && editor.getSelected().parent();

    // recurse through the parent() chain until a selectable parent is found
    while (comp && !comp.get("selectable")) {
      comp = comp.parent();
    }

    comp && editor.select(comp);
  }

};
