require(['config/require-config'], function() {

  require(['grapesjs/main'],function (grapesjs){

    var editor  = grapesjs.init(


    {
      allowScripts: 1,
      showOffsets: 1,
      autorender: 0,
      noticeOnUnload: 0,
      container  : '#gjs',
      height: '100%',
      fromElement: true,
      clearOnRender: 0,

      /*
      components: [{
        //script: 'var el = this; setInterval(function(){el.style.marginLeft = Math.random() * 50 +"px";}, 1000)',
        script: 'loadScript = function(){console.log("loaded INSIDE", $);}',
        style: {
          background: 'red',
          width:'500px',
          height:'100px',
          margin: '50px auto',
        }
      },{
        script: 'this.innerHTML= "test1";',
        style: {
          background: 'blue',
          width:'500px',
          height:'100px',
          margin: '50px auto',
        }
      },{
        script: 'this.innerHTML= "test2";',
        style: {
          background: 'green',
          width:'500px',
          height:'100px',
          margin: '50px auto',
        }
      },{
        style: {
          background: 'yellow',
          width:'500px',
          height:'100px',
          margin: '50px auto',
        }
      },{
        type: 'text',
        style:{
          width:'100px',
          height:'100px',
          margin: '50px auto',
        },
        traits: ['title'],
        components: [{
          type: 'textnode',
          content: 'text node row',
        },{
          type: 'textnode',
          content: ', another text node',
        },{
          type: 'link',
          content: 'someLink',
        },{
          type: 'textnode',
          content: " More text node  ---   ",
        }],
      }],
*/
      storageManager:{
        autoload: 0,
        storeComponents: 1,
        storeStyles: 1,
      },

      commands:     {
          defaults    : [{
                          id:   'open-github',
                          run:   function(editor, sender){
                            sender.set('active',false);
                            window.open('https://github.com/artf/grapesjs','_blank');
                          }
                        },{
                          id:   'undo',
                          run:   function(editor, sender){
                            sender.set('active',false);
                            editor.UndoManager.undo(true);
                          }
                        },{
                          id:   'redo',
                          run:   function(editor, sender){
                            sender.set('active',false);
                            editor.UndoManager.redo(true);
                          }
                        },{
                          id:   'clean-all',
                          run:   function(editor, sender){
                            sender.set('active',false);
                            if(confirm('Are you sure to clean the canvas?')){
                              var comps = editor.DomComponents.clear();
                            }
                          }
                        }],
      },

      assetManager: {
        storageType      : '',
        storeOnChange    : true,
        storeAfterUpload  : true,
        assets        : [
                           { type: 'image', src : 'http://placehold.it/350x250/78c5d6/fff/image1.jpg', height:350, width:250},
                           { type: 'image', src : 'http://placehold.it/350x250/459ba8/fff/image2.jpg', height:350, width:250},
                           { type: 'image', src : 'http://placehold.it/350x250/79c267/fff/image3.jpg', height:350, width:250},
                           { type: 'image', src : 'http://placehold.it/350x250/c5d647/fff/image4.jpg', height:350, width:250},
                           { type: 'image', src : 'http://placehold.it/350x250/f28c33/fff/image5.jpg', height:350, width:250},
                           { type: 'image', src : 'http://placehold.it/350x250/e868a2/fff/image6.jpg', height:350, width:250},
                           { type: 'image', src : 'http://placehold.it/350x250/cc4360/fff/image7.jpg', height:350, width:250},
                           { type: 'image', src : './img/work-desk.jpg', date: '2015-02-01',height:1080, width:1728},
                           { type: 'image', src : './img/phone-app.png', date: '2015-02-01',height:650, width:320},
                           { type: 'image', src : './img/bg-gr-v.png', date: '2015-02-01',height:1, width:1728},
                         ]
      },


      styleManager : {
        sectors: [{
          name: 'General',
          open: false,
          buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
        },{
          name: 'Dimension',
          open: false,
          buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
        },{
          name: 'Typography',
          open: false,
          buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
          properties: [{
            property: 'text-align',
            list    : [
              {value: 'left', className: 'fa fa-align-left'},
              {value: 'center', className: 'fa fa-align-center' },
              {value: 'right', className: 'fa fa-align-right'},
              {value: 'justify', className: 'fa fa-align-justify'}
            ],
          }]
        },{
          name: 'Decorations',
          open: false,
          buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
        },{
          name: 'Extra',
          open: false,
          buildProps: ['transition', 'perspective', 'transform'],
        },{
          name: 'Dimension',
          open: false,
          buildProps: ['margin'],
          properties:[{
              name: 'Marginnnn',
              property: 'margin',
              type: 'composite',
              properties:[{
                name: 'Top',
                property: 'margin-top',
              },{
                name: 'Right',
                property: 'margin-right',
              },{
                name: 'Bottom',
                property: 'margin-bottom',
              },{
                name: 'Left',
                property: 'margin-left',
              },],
            }/*{
            name    : 'Center blocksss',
            property  : 'margins',
            type    : 'select',
            defaults   : '0',
            list    :  [{
                      value     : '0',
                      name      : 'Normal',
                    },{
                      value     : '0 auto',
                      name      : 'Center',
                    }],
          }*/],
          },{
            name: 'Flex',
            open: false,
            properties: [{
              name    : 'Flex Container',
              property  : 'display',
              type    : 'select',
              defaults  : 'block',
              list    : [{
                        value     : 'block',
                        name   : 'Disable',
                      },{
                        value   : 'flex',
                        name   : 'Enable',
                      }],
            },{
              name: 'Flex Parent',
              property: 'label-parent-flex',
            },{
              name      : 'Direction',
              property  : 'flex-direction',
              type    : 'radio',
              defaults  : 'row',
              list    : [{
                        value   : 'row',
                        name    : 'Row',
                        className : 'icons-flex icon-dir-row',
                        title   : 'Row',
                      },{
                        value   : 'row-reverse',
                        name    : 'Row reverse',
                        className : 'icons-flex icon-dir-row-rev',
                        title   : 'Row reverse',
                      },{
                        value   : 'column',
                        name    : 'Column',
                        title   : 'Column',
                        className : 'icons-flex icon-dir-col',
                      },{
                        value   : 'column-reverse',
                        name    : 'Column reverse',
                        title   : 'Column reverse',
                        className : 'icons-flex icon-dir-col-rev',
                      }],
            },{
              name      : 'Wrap',
              property  : 'flex-wrap',
              type    : 'radio',
              defaults  : 'nowrap',
              list    : [{
                        value   : 'nowrap',
                        title   : 'Single line',
                      },{
                        value   : 'wrap',
                        title   : 'Multiple lines',
                      },{
                        value   : 'wrap-reverse',
                        title   : 'Multiple lines reverse',
                      }],
            },{
              name      : 'Justify',
              property  : 'justify-content',
              type    : 'radio',
              defaults  : 'flex-start',
              list    : [{
                        value   : 'flex-start',
                        className : 'icons-flex icon-just-start',
                        title   : 'Start',
                      },{
                        value   : 'flex-end',
                        title    : 'End',
                        className : 'icons-flex icon-just-end',
                      },{
                        value   : 'space-between',
                        title    : 'Space between',
                        className : 'icons-flex icon-just-sp-bet',
                      },{
                        value   : 'space-around',
                        title    : 'Space around',
                        className : 'icons-flex icon-just-sp-ar',
                      },{
                        value   : 'center',
                        title    : 'Center',
                        className : 'icons-flex icon-just-sp-cent',
                      }],
            },{
              name      : 'Align',
              property  : 'align-items',
              type    : 'radio',
              defaults  : 'center',
              list    : [{
                        value   : 'flex-start',
                        title    : 'Start',
                        className : 'icons-flex icon-al-start',
                      },{
                        value   : 'flex-end',
                        title    : 'End',
                        className : 'icons-flex icon-al-end',
                      },{
                        value   : 'stretch',
                        title    : 'Stretch',
                        className : 'icons-flex icon-al-str',
                      },{
                        value   : 'center',
                        title    : 'Center',
                        className : 'icons-flex icon-al-center',
                      }],
            },{
              name: 'Flex Children',
              property: 'label-parent-flex',
            },{
              name:     'Order',
              property:   'order',
              type:     'integer',
              defaults :  0,
              min: 0
            },{
              name    : 'Flex',
              property  : 'flex',
              type    : 'composite',
              properties  : [{
                      name:     'Grow',
                      property:   'flex-grow',
                      type:     'integer',
                      defaults :  0,
                      min: 0
                    },{
                      name:     'Shrink',
                      property:   'flex-shrink',
                      type:     'integer',
                      defaults :  0,
                      min: 0
                    },{
                      name:     'Basis',
                      property:   'flex-basis',
                      type:     'integer',
                      units:    ['px','%',''],
                      unit: '',
                      defaults :  'auto',
                    }],
            },{
              name      : 'Align',
              property  : 'align-self',
              type      : 'radio',
              defaults  : 'auto',
              list    : [{
                        value   : 'auto',
                        name    : 'Auto',
                      },{
                        value   : 'flex-start',
                        title    : 'Start',
                        className : 'icons-flex icon-al-start',
                      },{
                        value   : 'flex-end',
                        title    : 'End',
                        className : 'icons-flex icon-al-end',
                      },{
                        value   : 'stretch',
                        title    : 'Stretch',
                        className : 'icons-flex icon-al-str',
                      },{
                        value   : 'center',
                        title    : 'Center',
                        className : 'icons-flex icon-al-center',
                      }],
            }]
          }

        ],

      },
    }


    );


    window.editor = editor;

    var pnm = editor.Panels;
    pnm.addButton('options', [{
      id: 'undo',
      className: 'fa fa-undo icon-undo',
      command: function(editor, sender) {
        sender.set('active', 0);
        editor.UndoManager.undo(1);
      },
      attributes: { title: 'Undo (CTRL/CMD + Z)'}
    },{
      id: 'redo',
      className: 'fa fa-repeat icon-redo',
      command: function(editor, sender) {
        sender.set('active', 0);
        editor.UndoManager.redo(1);
      },
      attributes: { title: 'Redo (CTRL/CMD + SHIFT + Z)' }
    },{
      id: 'clean-all',
      className: 'fa fa-trash icon-blank',
      command:  function(editor, sender) {
        if(sender) sender.set('active', false);
        if(confirm('Are you sure to clean the canvas?')) {
          var comps = editor.DomComponents.clear();
          localStorage.setItem('gjs-css', '');
          localStorage.setItem('gjs-html', '');
        }
      },
      attributes: { title: 'Empty canvas' }
    }]);

    // Blocks
    var bm = editor.BlockManager;
    bm.add('timer', {
      label: 'timer',
      attributes: {class:'gjs-fonts gjs-f-text'},
      content: {
        type: 'timer',
        startfrom: 'May 5, 2018 20:00:00',
        activeOnRender: 1,
      }
    });

    var domc = editor.DomComponents;
    var defaultType = domc.getType('default');
    var defaultModel = defaultType.model;
    var defaultView = defaultType.view;

    domc.addType('timer', {
      model: defaultModel.extend({
        defaults: _.extend({}, defaultModel.prototype.defaults, {
          startfrom: 'Nov 25, 2018 15:00:00',
          droppable: false,
          traits: [{
            label: 'Start',
            name: 'startfrom',
            changeProp: 1,
          }],
        }),

        init: function () {
          this.listenTo(this, 'change:startfrom', this.buildScript);
          this.listenTo(this, 'active', this.buildScript);
          this.get('components').add('<span id="timer-c"></span>');
        },

        buildScript: function() {
          var startfrom = this.get('startfrom');
          var fn = function () {
            var startfrom = $startfrom$;
            var countDownDate = new Date(startfrom).getTime();
            var el = this.querySelector('#timer-c');
            var moveTimer = function() {
              var now = new Date().getTime();
              var distance = countDownDate - now;
              // Time calculations for days, hours, minutes and seconds
              var days = Math.floor(distance / (1000 * 60 * 60 * 24));
              var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              var seconds = Math.floor((distance % (1000 * 60)) / 1000);

              el.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
              // If the count down is finished, write some text
              if (distance < 0) {
                clearInterval(x);
                el.innerHTML = "EXPIRED";
              }
            };
            var x = setInterval(moveTimer, 1000);
            moveTimer();
          };
          var fnStr = this.getScriptString(fn);
          fnStr = fnStr.replace('$startfrom$', '"'+startfrom+'"');
          this.set('script', fnStr);
        },

      }, {
        isComponent: function(el) {
          if(el.getAttribute &&
            el.getAttribute('data-gjs-type') == 'timer') {
            return {type: 'timer'};
          }
        },
      }),
      view: defaultView,
    });

    editor.render();
  });
});
