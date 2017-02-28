define(function(require) {

    var Backbone = require('backbone');

    return Backbone.View.extend({

      initialize: function(opt) {
        this.opt = opt || {};
        _.bindAll(this,'startSort','onMove','endMove','rollback', 'udpateOffset', 'moveDragHelper');
        var o = opt || {};
        this.elT = 0;
        this.elL = 0;
        this.borderOffset = o.borderOffset || 10;

        var el = o.container;
        this.el = typeof el === 'string' ? document.querySelector(el) : el;
        this.$el = $(this.el);

        this.containerSel = o.containerSel || 'div';
        this.itemSel = o.itemSel || 'div';
        this.draggable = o.draggable || true;
        this.nested = o.nested || 0;
        this.pfx = o.pfx || '';
        this.ppfx = o.ppfx || '';
        this.freezeClass = o.freezeClass || this.pfx + 'freezed';
        this.onStart = o.onStart || '';
        this.onEndMove = o.onEndMove || '';
        this.direction = o.direction || 'v'; // v (vertical), h (horizontal), a (auto)
        this.onMoveClb = o.onMove || '';
        this.relative = o.relative || 0;
        this.plh = o.placer || '';
        // Frame offset
        this.wmargin = o.wmargin || 0;
        this.offTop = o.offsetTop || 0;
        this.offLeft = o.offsetLeft || 0;
        this.document = o.document || document;
        this.$document = $(this.document);
        this.dropContent = null;
        this.em = o.em || '';
        this.dragHelper = null;

        if(this.em && this.em.on){
          this.em.on('change:canvasOffset', this.udpateOffset);
          this.udpateOffset();
        }
      },

      getContainerEl: function () {
        if (!this.el) {
          var el = this.opt.container;
          this.el = typeof el === 'string' ? document.querySelector(el) : el;
          this.$el = $(this.el);
        }
        return this.el;
      },

      /**
       * Triggered when the offset of the editro is changed
       */
      udpateOffset: function(){
        var offset = this.em.get('canvasOffset');
        this.offTop = offset.top;
        this.offLeft = offset.left;
      },

      /**
       * Set content to drop
       * @param {String|Object} content
       */
      setDropContent: function(content){
        this.dropContent = content;
      },

      /**
       * Toggle cursor while sorting
       * @param {Boolean} active
       */
      toggleSortCursor: function(active) {
        var em = this.em;
        var body = document.body;
        var pfx = this.ppfx || this.pfx;
        var sortCls = pfx + 'grabbing';
        var emBody = em ? em.get('Canvas').getBody() : '';
        if(active) {
          body.className += ' ' + sortCls;
          if(em) {
            emBody.className += ' ' + sortCls;
          }
        } else {
          body.className = body.className.replace(sortCls, '').trim();
          if(em) {
            emBody.className = emBody.className.replace(sortCls, '').trim();
          }
        }
      },

      /**
       * Set drag helper
       * @param {HTMLElement} el
       * @param {Event} event
       */
      setDragHelper: function(el, event) {
        var ev = event || '';
        var clonedEl = el.cloneNode(1);

        // Attach style
        var style = '';
        var o = getComputedStyle(el);
        for(var i = 0; i < o.length; i++) {
          style += o[i] + ':' + o.getPropertyValue(o[i])+';';
        }
        clonedEl.style = style;
        clonedEl.className += ' ' + this.pfx + 'bdrag';
        document.body.appendChild(clonedEl);
        this.dragHelper = clonedEl;

        if(ev) {
          this.moveDragHelper(ev);
        }

        // Listen mouse move events
        if(this.em) {
          $(this.em.get('Canvas').getBody().ownerDocument)
            .off('mousemove', this.moveDragHelper).on('mousemove', this.moveDragHelper);
        }
        $(document)
          .off('mousemove', this.moveDragHelper).on('mousemove', this.moveDragHelper);
      },

      /**
       * //TODO Refactor, use canvas.getMouseRelativePos to get mouse's X and Y
       * Update the position of the helper
       * @param  {Event} e
       */
      moveDragHelper: function(e){
        if(!this.dragHelper) {
          return;
        }
        var doc = e.target.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;
        var addTop = 0;
        var addLeft = 0;
        var frame = win.frameElement;
        if(frame) {
          var frameRect = frame.getBoundingClientRect(); // maybe to cache ?!?
          addTop = frameRect.top || 0;
          addLeft = frameRect.left || 0;
        }
        var hStyle = this.dragHelper.style;
        hStyle.left = (e.pageX - win.pageXOffset + addLeft) + 'px';
        hStyle.top = (e.pageY - win.pageYOffset + addTop) + 'px';
      },


      /**
       * Returns true if the element matches with selector
       * @param {Element} el
       * @param {String} selector
       * @return {Boolean}
       */
      matches: function(el, selector, useBody) {
        var startEl = el.parentNode || document.body;
        //startEl = useBody ? startEl.ownerDocument.body : startEl;
        var els = startEl.querySelectorAll(selector);
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
       * @param {HTMLElement} trg
       * */
      startSort: function(trg){
        this.moved = 0;
        this.eV = trg;

        if(trg && !this.matches(trg, this.itemSel + ',' + this.containerSel))
          this.eV = this.closest(trg, this.itemSel);

        // Create placeholder if not exists
        if(!this.plh) {
          this.plh = this.createPlaceholder();
          this.getContainerEl().appendChild(this.plh);
        }

        if(this.eV) {
          this.eV.className += ' ' + this.freezeClass;
          this.$document.on('mouseup', this.endMove);
        }

        this.$el.on('mousemove', this.onMove);
        $(document).on('keydown', this.rollback);
        this.$document.on('keydown', this.rollback);

        if(typeof this.onStart === 'function')
          this.onStart();

        // Avoid strange effects on dragging
        if(this.em) {
          this.em.clearSelection();
        }

        this.toggleSortCursor(1);
      },

      /**
       * During move
       * @param {Event} e
       * */
      onMove: function(e) {
        this.moved = 1;

        // Turn placeholder visibile
        var plh = this.plh;
        var dsp = plh.style.display;
        if(!dsp || dsp === 'none')
          plh.style.display = 'block';

        // Cache all necessary positions
        var eO = this.offset(this.el);
        this.elT = this.wmargin ? Math.abs(eO.top) : eO.top;
        this.elL = this.wmargin ? Math.abs(eO.left): eO.left;
        this.rY = (e.pageY - this.elT) + this.el.scrollTop;
        this.rX = (e.pageX - this.elL) + this.el.scrollLeft;
        var dims = this.dimsFromTarget(e.target, this.rX, this.rY);
        this.lastDims = dims;
        var pos = this.findPosition(dims, this.rX, this.rY);
        // If there is a significant changes with the pointer
        if( !this.lastPos ||
            (this.lastPos.index != pos.index || this.lastPos.method != pos.method)){
          this.movePlaceholder(this.plh, dims, pos, this.prevTargetDim);
          if(!this.$plh)
            this.$plh = $(this.plh);
          if(this.offTop)
            this.$plh.css('top', '+=' + this.offTop + 'px');
          if(this.offLeft)
            this.$plh.css('left', '+=' + this.offLeft + 'px');
          this.lastPos = pos;
        }

        if(typeof this.onMoveClb === 'function')
          this.onMoveClb(e);
      },

      /**
       * Returns true if the elements is in flow, so is not in flow where
       * for example the component is with float:left
       * @param  {HTMLElement} el
       * @param  {HTMLElement} parent
       * @return {Boolean}
       * @private
       * */
      isInFlow:  function(el, parent) {
          if(!el)
            return false;

          parent = parent || document.body;
          var ch = -1, h;
          var elem = el;
          h = elem.offsetHeight;
          if (/*h < ch || */!this.styleInFlow(elem, parent))
            return false;
          else
            return true;
      },

      /**
       * Check if el has style to be in flow
       * @param  {HTMLElement} el
       * @param  {HTMLElement} parent
       * @return {Boolean}
       * @private
       */
      styleInFlow: function(el, parent) {
        var style = el.style;
        var $el = $(el);
        if (style.overflow && style.overflow !== 'visible')
            return;
        if ($el.css('float') !== 'none')
            return;
        if(parent && $(parent).css('display') == 'flex')
          return;
        switch (style.position) {
            case 'static': case 'relative': case '':
                break;
            default:
                return;
        }
        switch (el.tagName) {
            case 'TR': case 'TBODY': case 'THEAD': case 'TFOOT':
                return true;
        }
        switch ($el.css('display')) {
            case 'block':
            case 'list-item':
            case 'table':
            case 'flex':
                return true;
        }
        return;
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

        // Select the first valuable target
        // TODO: avoid this check for every standard component,
        // which generally is ok
        if(!this.matches(target, this.itemSel + ',' + this.containerSel))
          target = this.closest(target, this.itemSel);

        // If draggable is an array the target will be one of those
        if(this.draggable instanceof Array){
            target = this.closest(target, this.draggable.join(','));
        }

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
        this.lastPos = null;
        return dims;
      },

      /**
       * Returns dimensions and positions about the element
       * @param {HTMLElement} el
       * @return {Array<number>}
       */
      getDim: function(el){
        var o = this.offset(el);
        var top = this.relative ? el.offsetTop : o.top - (this.wmargin ? -1 : 1) * this.elT;
        var left = this.relative ? el.offsetLeft : o.left - (this.wmargin ? -1 : 1) * this.elL;
        return [top, left, el.offsetHeight, el.offsetWidth];
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
          var dir = this.direction;

          if(dir == 'v')
            dir = true;
          else if(dir == 'h')
            dir = false;
          else
            dir = this.isInFlow(el, elem);

          dim.push(dir);
          dim.push(el);
          dims.push(dim);
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
              (yLimit && yCenter >= yLimit) || // >= avoid issue with clearfixes
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
        un = 'px', margI = 5, brdCol = '#62c462', brd = 3,
        method = pos.method;
        var elDim = dims[pos.index];
        plh.style.borderColor = 'transparent ' + brdCol;
        plh.style.borderWidth = brd + un + ' ' + (brd + 2) + un;
        plh.style.margin = '-' + brd + 'px 0 0';
        if(elDim){
          // If it's not in flow (like 'float' element)
          if(!elDim[4]){
            w = 'auto';
            h = elDim[2] - (marg * 2) + un;
            t = elDim[0] + marg;
            l = (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
            plh.style.borderColor = brdCol + ' transparent';
            plh.style.borderWidth = (brd + 2) + un + ' ' + brd + un;
            plh.style.margin = '0 0 0 -' + brd + 'px';
          }else{
            w = elDim[3] + un;
            h = 'auto';
            t = (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
            l = elDim[1];
          }
        }else{
          if(!this.nested){
            plh.style.display = 'none';
            return;
          }
          if(trgDim){
            t = trgDim[0] + margI;
            l = trgDim[1] + margI;
            w = (parseInt(trgDim[3]) - margI * 2) + un;
            h = 'auto';
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
        var created;
        this.$el.off('mousemove', this.onMove);
        this.$document.off('mouseup', this.endMove);
        this.$document.off('keydown', this.rollback);
        this.plh.style.display = 'none';
        var clsReg = new RegExp('(?:^|\\s)'+this.freezeClass+'(?!\\S)', 'gi');
        if(this.eV)
          this.eV.className = this.eV.className.replace(clsReg, '');
        if(this.moved)
          created = this.move(this.target, this.eV, this.lastPos);
        if(this.plh)
          this.plh.style.display = 'none';

        if(typeof this.onEndMove === 'function')
          this.onEndMove(created);

        var dragHelper = this.dragHelper;
        if(dragHelper) {
          dragHelper.remove();
          this.dragHelper = null;
        }
        this.toggleSortCursor();
      },

      /**
       * Move component to new position
       * @param {HTMLElement} dst Destination target
       * @param {HTMLElement} src Element to move
       * @param {Object} pos Object with position coordinates
       * */
      move: function(dst, src, pos) {
        var index = pos.index;
        var model = $(src).data('model');
        var $dst = $(dst);
        var targetCollection = $dst.data('collection');
        var targetModel = $dst.data('model');

        // Check if the elemenet is DRAGGABLE to the target
        var drag = model && model.get('draggable');
        var draggable = typeof drag !== 'undefined' ? drag : 1;
        var toDrag = draggable;

        if (this.dropContent instanceof Object) {
          draggable = this.dropContent.draggable;
          draggable = typeof draggable !== 'undefined' ? draggable : 1;
        } else if (typeof this.dropContent === 'string' && targetCollection) {
          var sandboxOpts = {silent: true};
          var sandboxModel = targetCollection.add(this.dropContent, sandboxOpts);
          draggable = sandboxModel.get && sandboxModel.get('draggable');
          draggable = typeof draggable !== 'undefined' ? draggable : 1;
          targetCollection.remove(sandboxModel, sandboxOpts);
        }

        if(draggable instanceof Array) {
          toDrag = draggable.join(', ');
          draggable = this.matches(dst, toDrag);
        }else if(typeof draggable === 'string') {
          toDrag = draggable;
          draggable = this.matches(dst, toDrag, 1);
        }

        // Check if the target could accept the element to be DROPPED inside
        var accepted = 1;
        var droppable = targetModel ? targetModel.get('droppable') : 1;
        var toDrop = draggable;
        if(droppable instanceof Array) {
          // When I drag blocks src is the HTMLElement of the block
          toDrop = droppable.join(', ');
          accepted = this.matches(src, toDrop);
        }else if(typeof droppable === 'string') {
          toDrop = droppable;
          accepted = this.matches(src, toDrop);
        }

        if(targetCollection && droppable && accepted && draggable) {
          index = pos.method === 'after' ? index + 1 : index;
          var modelToDrop, modelTemp;
          var opts = {at: index, noIncrement: 1};
          if(!this.dropContent){
            modelTemp = targetCollection.add({}, opts);
            if(model)
              modelToDrop = model.collection.remove(model);

          }else{
            modelToDrop = this.dropContent;
            opts.silent = false;
          }
          var created = targetCollection.add(modelToDrop, opts);
          if(!this.dropContent){
            targetCollection.remove(modelTemp);
          }else{
            this.dropContent = null;
          }
          // This will cause to recalculate children dimensions
          this.prevTarget = null;
          return created;
        } else {
          var warns = [];
          if(!targetCollection){
            warns.push('target collection not found');
          }
          if(!droppable){
            warns.push('target is not droppable');
          }
          if(!draggable){
            warns.push('component not draggable, accepted only by [' + toDrag + ']');
          }
          if(!accepted){
            warns.push('target accepts only [' + toDrop + ']');
          }
          console.warn('Invalid target position: ' + warns.join(', '));
        }
      },

      /**
       * Rollback to previous situation
       * @param {Event}
       * @param {Bool} Indicates if rollback in anycase
       * */
      rollback: function(e) {
        $(document).off('keydown', this.rollback);
        this.$document.off('keydown', this.rollback);
        var key = e.which || e.keyCode;

        if (key == 27) {
          this.moved = false;
          this.endMove();
        }
        return;
      },

    });
});
