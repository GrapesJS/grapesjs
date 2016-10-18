define(function () {
  return {

    storageMock: function() {
      var db = {};
      return {
        id: 'testStorage',
        store: function(data){
          db = data;
        },
        load: function(keys){
          return db;
        },
        getDb: function(){
          return db;
        },
      };
    },

  };
});