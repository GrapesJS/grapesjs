define(['backbone','./Trait', './TraitFactory'],
  function (Backbone, Trait, TraitFactory) {

    return Backbone.Collection.extend({

      model: Trait,

      setTarget: function(target){
        this.target = target;
      },

      add: function(models, opt){
        // Use TraitFactory if necessary
				if(typeof models === 'string' || models instanceof Array){
          if(typeof models === 'string')
            models = [models];
          for(var i = 0, len = models.length; i < len; i++){
            var str = models[i];
            var model = typeof str === 'string' ? TraitFactory.build(str)[0] : str;
            model.target = this.target;
            models[i] = model;
          }
				}
				return Backbone.Collection.prototype.add.apply(this, [models, opt]);
			},

    });
});
