define(['backbone'],
  function(Backbone) {

    return Backbone.View.extend({

      initialize: function(opt) {
        _.bindAll(this,'startSort','onMove','endMove','rollback', 'itemLeft');
        var o = opt || {};
        this.config = o.config || {};
        this.pfx = this.config.stylePrefix || '';
        this.itemClass  = '.' + this.pfx + this.config.itemClass;
        this.itemsClass = '.' + this.pfx + this.config.itemsClass;
        this.setElement('.'+this.pfx+this.config.containerId);

        this.elT = 0;
        this.elL = 0;

        this.el = document.querySelector(o.container);
        this.$el = $(this.el);
        this.containerSel = 'div';
        this.itemSel = 'div';
      },

      /**
       * Returns true if the element matches with selector
       * @param {Element} el
       * @param {String} selector
       * @return {Boolean}
       */
      matches: function(el, selector){
        var els = (el.parentNode || document.body).querySelectorAll(selector);
        var i = 0;
        while (els[i] && els[i] !== el)
          ++i;
        return !!els[i];
      },

      /**
       * Closest parent
       * @param {Element} el
       * @param {String} selector
       * @return {Element|null}
       */
      closest: function(el, selector){
        var elem = el.parentNode;
        while (elem && elem.nodeType === 1) {
          if (this.matches(elem, selector))
            return elem;
          elem = elem.parentNode;
        }
        return null;
      },

      /**
       * Get the offset of the element
       * @param  {HTMLElement} el
       * @return {Object}
       */
      offset: function(el){
        var rect = el.getBoundingClientRect();
        return {
          top: rect.top + document.body.scrollTop,
          left: rect.left + document.body.scrollLeft
        };
      },

      /**
       * Create placeholder
       * @return {HTMLElement}
       */
      createPlaceholder: function(){
        var pfx = this.pfx;
        var el = document.createElement('div');
        var ins = document.createElement('div');
        el.id = pfx + 'placeholder';
        el.style.display = 'none';
        el.style['pointer-events'] = 'none';
        ins.id = pfx + "plh-int";
        el.appendChild(ins);
        return el;
      },

      /**
       * Picking component to move
       * @param {Object}  Element view
       * */
      startSort: function(el){
        this.moved = 0;
        this.eV = el.el || el;

        // Create placeholder if not exists
        if(!this.plh){
          this.plh = this.createPlaceholder();
          this.el.appendChild(this.plh);
        }
        //freeze el

        this.$el.on('mousemove',this.onMove);
        $(document).on('mouseup',this.endMove);
        $(document).on('keypress',this.rollback);
      },

      /**
       * During move
       * @param {Event} e
       * */
      onMove: function(e){
        this.moved = 1;

        // Turn placeholder visibile
        var plh = this.plh;
        if(plh.style.display === 'none'){
          plh.style.display = 'block';
        }

        // Cache all necessary positions
        var rect = this.el.getBoundingClientRect();
        var body = document.body;
        var eO = { top: rect.top + body.scrollTop, left: rect.left + body.scrollLeft };
        this.elT = eO.top;
        this.elL = eO.left;
        this.rY = (e.pageY - this.elT) + this.el.scrollTop;
        this.rX = (e.pageX - this.elL) + this.el.scrollLeft;

        this.inspect(e);
        this.updatePosition(this.rX, this.rY);
        var actualPos   = this.posIndex+':'+this.posMethod;

        //If there is a significant changes with the pointer
        if(!this.lastPos || (this.lastPos != actualPos)){
          this.updatePlaceholderPos(this.posIndex, this.posMethod);
          this.lastPos  = this.posIndex+':'+this.posMethod;
        }
        //Working alternative for find taget element
        //var $targetEl = this.$selParent.children('.'+this.pfx+this.config.itemClass).eq(this.aIndex);
      },

      /**
       * Get children dimensions
       * @param {HTMLELement} el Element root
       * @retun {Array}
       * */
      getChildrenDim: function(elem){
        var dim = [];
        var ch = elem.children;//TODO filter match
        for (var i = 0, len = ch.length; i < len; i++) {
            var el = ch[i];
            var elO = this.offset(el);
            dim.push([elO.top - this.elT, elO.left - this.elL, el.offsetHeight, el.offsetWidth, true, el]);
        }
        return dim;
      },

      /**
       * Search where to put placeholder
       * @param int X position of the mouse
       * @param int Y position of the mouse
       * @retun void
       * */
      updatePosition: function( posX, posY ){
        this.posMethod = "before";
        this.posIndex = 0;
        var leftLimit = 0, xLimit = 0, dimRight = 0, yLimit = 0, xCenter = 0, yCenter = 0, dimDown = 0, dim = 0;
        for(var i = 0; i < this.cDim.length; i++){                      //Dim => t,l,h,w
          dim = this.cDim[i];
          dimDown = dim[0] + dim[2];
          yCenter = dim[0] + (dim[2] / 2);                        //Horizontal center
          xCenter = dim[1] + (dim[3] / 2);                        //Vertical center
          dimRight = dim[1] + dim[3];
          if( (xLimit && dim[1] > xLimit) || (yLimit && yCenter > yLimit) ||
            (leftLimit && dimRight < leftLimit))                    //No need with this one if over the limit
              continue;
          if(!dim[4]){                                  //If it's not inFlow (like float element)
            if( posY < dimDown)
              yLimit = dimDown;
            if( posX < xCenter){                            //If mouse lefter than center
              xLimit = xCenter;
              this.posMethod = "before";
            }else{
              leftLimit = xCenter;
              this.posMethod = "after";
            }
            this.posIndex = i;
          }else{
            this.posIndex = this.aIndex = i;
            if( posY < yCenter ){                           //If mouse upper than center
              this.posMethod = "before";                        //Should place helper before
              if(posY < dim[0])
                this.aIndex = i - 1;
              break;                                  //No need to continue under inFlow element
            }else
              this.posMethod = "after";
          }
        }
      },

      /**
       * Updates the position of the placeholder
       * @param int Index of the nearest child
       * @param str Before or after position
       * @return void
       * */
      updatePlaceholderPos: function(index, method){
        var marg = 0, t = 0, l = 0, w = 0, h = 0,
          un      = 'px',
          margI   = 5,
          plh     = this.$plh[0];
        if( this.cDim[index] ){
          var elDim = this.cDim[index];
          //If it's like with 'float' style
          if(!elDim[4]){
            w   = 'auto';
            h   = elDim[2] - (marg * 2) + un;
            t   = elDim[0] + marg;
            l   = (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
          }else{
            //w   = '100%';
            w   = elDim[3] + un;
            //h   = elDim[3] + un;
            t   = (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
            l   = elDim[1];
          }
        }else{
          if(this.$targetEl){
            var trg   = this.$targetEl[0],
              $elO  = this.$targetEl.offset();
            t   = $elO.top  - this.elT  + margI + 17;
            l   = $elO.left - this.elL  + margI * 7;
            w     = (parseInt(trg.offsetWidth) - margI * 14) + un;
          }
        }
        plh.style.top     = t + un;
        plh.style.left      = l + un;
        if(w)
          plh.style.width   = w;
        if(h)
          plh.style.height  = h;
      },

      /**
       * Leave item
       * @param event
       *
       * @return void
       * */
      endMove: function(e){
        this.$el.off('mousemove',this.onMove);
        $(document).off('mouseup', this.endMove);
        $(document).off('keypress', this.rollback);
        this.eV.unfreeze();
        this.$plh.hide();
        if(this.moved)
          this.move(this.$targetEl, this.$sel, this.posIndex, this.posMethod);
        this.itemLeft();
      },

      /**
       * Move component to new position
       * @param {Object}  Component to move
       * @param {Object}  Target component
       * @param   {Integer}   Indicates the position inside the collection
       * @param   {String}  Before of after component
       *
       * @return void
       * */
      move: function(target, el, posIndex, method){
        var trg         = target|| this.$targetEl;
        trg           = trg || this.$backupEl;
        if(!trg)
          return;
        var index         = posIndex || 0;
        var model         = el.data("model");
        var collection      = model.collection;
        var targetModel     = trg.data('model');
        var targetCollection  = targetModel.collection;

        if(!this.cDim.length)
          targetCollection  = targetModel.get('components');

        if(targetCollection && targetModel.get('droppable')){
          index       = method == 'after' ? index + 1 : index;
          var modelTemp     = targetCollection.add({style:{}}, { at: index});
          var modelRemoved  = collection.remove(model, { silent:false });
          targetCollection.add(modelRemoved, { at: index, silent:false });
          targetCollection.remove(modelTemp);
        }else
          console.warn("Invalid target position");
      },

      /**
       * Track inside which element pointer entered
       * @param event
       *
       * @return void
       * */
      inspect: function(e){
        var item    = $(e.target).closest(this.itemClass);
        if(!this.$targetEl || (item.length && item[0] != this.$targetEl[0]) ){
          this.status   = 1;
          if(item.length){
            this.$targetEl  = this.$backupEl = item;
            this.$targetElP = this.$targetEl.parent();
            this.$targetsEl = this.$targetEl.find(this.itemsClass + ':first');
            this.$targetEl.on('mouseleave', this.itemLeft);
            this.targetM  = this.$targetEl.data('model');
            this.dimT   = this.getTargetDim(this.$targetEl[0]);
            this.cDim     = this.getChildrenDim();
          }
        }else if( this.nearToBorders(this.$targetEl[0]) || this.$targetEl[0] == this.$sel[0] ){
          if(this.status == 1){
            this.status   = 2;
            this.lastPos  = null;
            this.cDim     = this.getChildrenDim(this.$targetElP);
          }
        }else if( !this.nearToBorders(this.$targetEl[0]) ){
          if(this.status == 2){
            this.status   = 1;
            this.lastPos  = null;
          }
          this.cDim   = [];
        }
      },

      /**
       * Triggered when pointer leaves item
       * @param event
       *
       * @return void
       * */
      itemLeft: function(e){
        if(this.$targetEl){
          this.$targetEl.off('mouseleave',this.itemLeft);
          this.$targetEl    = null;
        }
      },

      /**
       * Returns dimension of the target
       * @param Event
       *
       * @return Array
       * */
      getTargetDim: function(e){
        var $el   = $(e),
          $elO  = $el.offset();
        return [ $elO.top - this.elT, $elO.left - this.elL, $el.outerHeight(), $el.outerWidth() ];
      },

      /**
       * Check if pointer is near to the borders of the target
       * @param event
       * @return Bool
       * */
      nearToBorders: function(e){
        var m = 10;                                   //Limit in pixels for be near
        if(!this.dimT)
          return;
        var dimT = this.dimT;
        if( ((dimT[0] + m) > this.rY) || (this.rY > (dimT[0] + dimT[2] - m)) ||
          ((dimT[1] + m) > this.rX) || (this.rX > (dimT[1] + dimT[3] - m))  )
          return 1;
        else
          return 0;
      },

      /**
       * Rollback to previous situation
       * @param Event
       * @param Bool Indicates if rollback in anycase
       * @return void
       * */
      rollback: function(e, force){
        var key = e.which || e.keyCode;
        if(key == 27 || force){
          this.moved = false;
          this.endMove();
        }
        return;
      },

    });
});