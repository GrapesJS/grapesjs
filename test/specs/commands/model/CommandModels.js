const Command = require('commands/model/Command');
const Commands = require('commands');

module.exports = {
  run() {
    describe('Command', () => {
      let obj;

      beforeEach(() => {
        obj = new Command();
      });

      afterEach(() => {
        obj = null;
      });

      it('Has id property', () => {
        expect(obj.has('id')).toEqual(true);
      });

    });

    describe('Commands', () => {
      var obj;

      beforeEach(() => {
        obj = new Commands();
      });

      afterEach(() => {
        obj = null;
      });

      it('Object is ok', () => {
        expect(obj).toExist();
      });

    });

  }
};
