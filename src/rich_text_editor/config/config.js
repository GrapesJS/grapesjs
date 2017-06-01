module.exports = {
  stylePrefix  : 'rte-',
  toolbarId  : 'toolbar',
  containerId  : 'wrapper',
  commands  : [{
    command: 'bold',
    title: 'Bold',
    class: 'fa fa-bold',
  },{
    command: 'italic',
    title: 'Italic',
    class: 'fa fa-italic',
  },{
    command: 'underline',
    title: 'Underline',
    class: 'fa fa-underline',
   },{
    command: 'strikethrough',
    title: 'Strikethrough',
    class: 'fa fa-strikethrough',
    group: 'format'
   },{
    command: 'insertHTML',
    title: 'Link',
    class: 'fa fa-link',
    args: '<a class="link" href="">${content}</a>',
   }/*,{
     command: 'fontSize',
     options: [
       {name: 'Huge', value: '7'},
       {name: 'Normal', value: '5'},
       {value: '1'}
     ]
   }*/],
};
