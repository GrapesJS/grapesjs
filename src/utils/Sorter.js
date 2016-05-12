define(['backbone'],
  function(Backbone) {

    return Backbone.View.extend({

      initialize: function(opt) {
        _.bindAll(this,'startSort','onMove','endMove','rollback');
        var o = opt || {};
        this.elT = 0;
        this.elL = 0;
        this.borderOffset = o.borderOffset || 10;
        this.freezeClass = o.freezeClass || 'freezed';

        var el = o.container;
        this.el = typeof el === 'string' ? document.querySelector(o.container) : el;
        this.$el = $(this.el);
        this.containerSel = o.containerSel || 'div';
        this.itemSel = o.itemSel || 'div';
        this.nested = o.nested || 0;
        this.pfx = o.pfx || '';
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
        if(!el)
          return;
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
        el.className = pfx + 'placeholder';
        el.style.display = 'none';
        el.style['pointer-events'] = 'none';
        ins.className = pfx + "placeholder-int";
        el.appendChild(ins);
        return el;
      },

      /**
       * Picking component to move
       * @param {Object} trg
       * */
      startSort: function(trg){
        this.moved = 0;
        this.eV = trg;

        if(!this.matches(trg, this.itemSel + ',' + this.containerSel))
          this.eV = this.closest(trg, this.itemSel);

        // Create placeholder if not exists
        if(!this.plh){
          this.plh = this.createPlaceholder();
          this.el.appendChild(this.plh);
        }

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
        var eO = this.offset(this.el);
        this.elT = eO.top;
        this.elL = eO.left;
        this.rX = (e.pageX - this.elL) + this.el.scrollLeft;
        this.rY = (e.pageY - this.elT) + this.el.scrollTop;

        var dims = this.dimsFromTarget(e.target, this.rX, this.rY);
        var pos = this.findPosition(dims, this.rX, this.rY);

        // If there is a significant changes with the pointer
        if( !this.lastPos ||
            (this.lastPos.index != pos.index || this.lastPos.method != pos.method)){
          this.movePlaceholder(this.plh, dims, pos, this.prevTargetDim);
          this.lastPos = pos;
        }

        //callback onMove
      },

      /**
       * Get children dimensions
       * @param {HTMLELement} el Element root
       * @retun {Array}
       * */
      getChildrenDim: function(elem){
        var dims = [];
        if(!elem)
          return dims;
        var ch = elem.children; //TODO filter match
        for (var i = 0, len = ch.length; i < len; i++) {
          var el = ch[i];
          if(!this.matches(el, this.itemSel))
            continue;
          var dim = this.getDim(el);
          dim.push(true); //TODO check if in flow, now only for vertical elements
          dim.push(el);
          dims.push(dim);
        }
        return dims;
      },

      /**
       * Returns dimensions and positions about the element
       * @param {HTMLElement} el
       * @return {Array<number>}
       */
      getDim: function(el){
        var o = this.offset(el);
        return [o.top - this.elT, o.left - this.elL, el.offsetHeight, el.offsetWidth];
      },

      /**
       * Get dimensions of nodes relative to the coordinates
       * @param  {HTMLElement} target
       * @param {number} rX Relative X position
       * @param {number} rY Relative Y position
       * @return {Array<Array>}
       */
      dimsFromTarget: function(target, rX, rY){
        var dims = [];

        if(!this.matches(target, this.itemSel + ',' + this.containerSel))
          target = this.closest(target, this.itemSel);

        if(!target)
          return dims;

        // Check if the target is different from the previous one
        if(this.prevTarget){
          if(this.prevTarget != target){
            this.prevTarget = null;
          }
        }

        // New target encountered
        if(!this.prevTarget){
          this.targetP = this.closest(target, this.containerSel);
          this.prevTarget = target;
          this.prevTargetDim = this.getDim(target);
          this.cacheDimsP = this.getChildrenDim(this.targetP);
          this.cacheDims = this.getChildrenDim(target);
        }

        // If the target is the previous one will return the cached dims
        if(this.prevTarget == target)
          dims = this.cacheDims;

        // Target when I will drop element to sort
        this.target = this.prevTarget;
        // Generally also on every new target the poiner enters near
        // to borders, so have to to check always
        if(this.nearBorders(this.prevTargetDim, rX, rY) ||
           (!this.nested && !this.cacheDims.length)){
          dims = this.cacheDimsP;
          this.target = this.targetP;
        }

        return dims;
      },

      /**
       * Check if the coordinates are near to the borders
       * @param {Array<number>} dim
       * @param {number} rX Relative X position
       * @param {number} rY Relative Y position
       * @return {Boolean}
       * */
      nearBorders: function(dim, rX, rY){
        var result = 0;
        var off = this.borderOffset;
        var x = rX || 0;
        var y = rY || 0;
        var t = dim[0];
        var l = dim[1];
        var h = dim[2];
        var w = dim[3];
        if( ((t + off) > y) || (y > (t + h - off)) ||
            ((l + off) > x) || (x > (l + w - off)) )
          result = 1;

        return !!result;
      },

      /**
       * Find the position based on passed dimensions and coordinates
       * @param {Array<Array>} dims Dimensions of nodes to parse
       * @param {number} posX X coordindate
       * @param {number} posY Y coordindate
       * @retun {Object}
       * */
      findPosition: function( dims, posX, posY ){
        var result = {index: 0, method: 'before'};
        var leftLimit = 0, xLimit = 0, dimRight = 0, yLimit = 0, xCenter = 0, yCenter = 0, dimDown = 0, dim = 0;
        // Each dim is: Top, Left, Height, Width
        for(var i = 0, len = dims.length; i < len; i++){
          dim = dims[i];
          // Right position of the element. Left + Width
          dimRight = dim[1] + dim[3];
          // Bottom position of the element. Top + Height
          dimDown = dim[0] + dim[2];
          // X center position of the element. Left + (Width / 2)
          xCenter = dim[1] + (dim[3] / 2);
          // Y center position of the element. Top + (Height / 2)
          yCenter = dim[0] + (dim[2] / 2);

          // Skip if over the limits
          if( (xLimit && dim[1] > xLimit) ||
              (yLimit && yCenter > yLimit) ||
              (leftLimit && dimRight < leftLimit) )
              continue;

          result.index = i;
          // If it's not in flow (like 'float' element)
          if(!dim[4]){
            if(posY < dimDown)
              yLimit = dimDown;
            //If x lefter than center
            if(posX < xCenter){
              xLimit = xCenter;
              result.method = "before";
            }else{
              leftLimit = xCenter;
              result.method = "after";
            }
          }else{
            // If y upper than center
            if(posY < yCenter){
              result.method = "before";
              break;
            }else
              result.method = "after"; // After last element
          }
        }
        return result;
      },


      /**
       * Updates the position of the placeholder
       * @param {HTMLElement} phl
       * @param {Array<Array>} dims
       * @param {Object} pos Position object
       * @param {Array<number>} trgDim target dimensions
       * */
      movePlaceholder: function(plh, dims, pos, trgDim){
        var marg = 0, t = 0, l = 0, w = 0, h = 0,
        un = 'px', margI = 5,
        method = pos.method;
        var elDim = dims[pos.index];
        if(elDim){
          // If it's not in flow (like 'float' element)
          if(!elDim[4]){
            w = 'auto';
            h = elDim[2] - (marg * 2) + un;
            t = elDim[0] + marg;
            l = (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
          }else{
            //w   = '100%';
            w = elDim[3] + un;
            //h   = elDim[3] + un;
            t = (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
            l = elDim[1];
          }
        }else{
          if(!this.nested){
            plh.style.display = 'none';
            return;
          }
          if(trgDim){
            t = trgDim[0] + margI + 17;
            l = trgDim[1] + margI * 7;
            w = (parseInt(trgDim[3]) - margI * 14) + un;
          }
        }
        plh.style.top = t + un;
        plh.style.left = l + un;
        if(w)
          plh.style.width = w;
        if(h)
          plh.style.height = h;
      },

      /**
       * Leave item
       * @param event
       *
       * @return void
       * */
      endMove: function(e){
        this.$el.off('mousemove', this.onMove);
        $(document).off('mouseup', this.endMove);
        $(document).off('keypress', this.rollback);
        this.plh.style.display = 'none';
        if(this.moved)
          this.move(this.target, this.eV, this.lastPos);
      },

      /**
       * Move component to new position
       * @param {HTMLElement} dst Destination target
       * @param {HTMLElement} src Element to move
       * @param {Object} pos Object with position coordinates
       * */
      move: function(dst, src, pos){
        var index = pos.index;
        var model = $(src).data('model');
        var collection = model.collection;
        var targetCollection = $(dst).data('collection');

        if(targetCollection){// && targetModel.get('droppable')
          index = pos.method === 'after' ? index + 1 : index;
          var modelTemp = targetCollection.add({}, {at: index, noIncrement: 1});
          var modelRemoved = model.collection.remove(model);
          targetCollection.add(modelRemoved, {at: index, noIncrement: 1});
          targetCollection.remove(modelTemp);
        }else
          console.warn("Invalid target position");
      },

      /**
       * Rollback to previous situation
       * @param {Event}
       * @param {Bool} Indicates if rollback in anycase
       * */
      rollback: function(e){
        var key = e.which || e.keyCode;
        if(key == 27)
          this.endMove();
        return;
      },

    });
});