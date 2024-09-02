module.exports = {
  storageMock() {
    var db = {};
    return {
      id: 'testStorage',
      store(data) {
        db = data;
      },
      load(keys) {
        return db;
      },
      getDb() {
        return db;
      },
    };
  },
};
