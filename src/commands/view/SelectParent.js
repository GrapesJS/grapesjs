module.exports = {

  run(editor) {
    const comp = editor.getSelected();
    const coll = comp && comp.collection;
    coll && coll.parent && editor.select(coll.parent);
  }

};
