define(['backbone','./Trait', './TraitFactory'],
  function (Backbone, Trait, TraitFactory) {

    return Backbone.Collection.extend({

      model: Trait,

      add: function(models, opt){
        // Use TraitFactory if necessary
				if(typeof models === 'string' || models instanceof Array){
          if(typeof models === 'string')
            models = [models];
          for(var i = 0, len = models.length; i < len; i++){
            var model = models[i];
            models[i] = TraitFactory.build(model)[0];
          }
				}
				return Backbone.Collection.prototype.add.apply(this, [models, opt]);
			},

    });
});
