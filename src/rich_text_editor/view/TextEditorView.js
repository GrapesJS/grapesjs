var readFileIntoDataUrl = fileInfo => {
  var loader = $.Deferred(),
    fReader = new FileReader();
  fReader.onload = e => {
    loader.resolve(e.target.result);
  };
  fReader.onerror = loader.reject;
  fReader.onprogress = loader.notify;
  fReader.readAsDataURL(fileInfo);
  return loader.promise();
};
$.fn.cleanHtml = function () {
  var html = $(this).html();
  return html && html.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, '');
};
$.fn.wysiwyg = function (userOptions) {
  var editor = this,
    selectedRange,
    options,
    toolbarBtnSelector,
    updateToolbar = () => {
      var actCls = options.activeToolbarClass;
      if (actCls) {
        $(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
          var el = $(this);
          var command = el.data(options.commandRole);
          var doc = editor.get(0).ownerDocument;
          if (doc.queryCommandState(command)) {
            el.addClass(actCls);
          } else {
            el.removeClass(actCls);
          }
        });
      }
    },
    execCommand = (commandWithArgs, valueArg) => {
      var commandArr = commandWithArgs.split(' '),
        command = commandArr.shift(),
        args = commandArr.join(' ') + (valueArg || '');
      //document.execCommand("insertHTML", false, "<span class='own-class'>"+ document.getSelection()+"</span>");
      editor.get(0).ownerDocument.execCommand("styleWithCSS", false, true);
      editor.get(0).ownerDocument.execCommand(command, 0, args);
      updateToolbar();
      editor.trigger('change');
    },
    /*
    bindHotkeys = function (hotKeys) {
      $.each(hotKeys, function (hotkey, command) {
        editor.keydown(hotkey, function (e) {
          if (editor.attr('contenteditable') && editor.is(':visible')) {
            e.preventDefault();
            e.stopPropagation();
            execCommand(command);
          }
        }).keyup(hotkey, function (e) {
          if (editor.attr('contenteditable') && editor.is(':visible')) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });
    },
    */
    getCurrentRange = () => {
      var sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0);
      }
    },
    saveSelection = () => {
      selectedRange = getCurrentRange();
    },
    restoreSelection = () => {
      var selection = window.getSelection();
      if (selectedRange) {
        try {
          selection.removeAllRanges();
        } catch (ex) {
          document.body.createTextRange().select();
          document.selection.empty();
        }

        selection.addRange(selectedRange);
      }
    },
    insertFiles = files => {
      editor.focus();
      $.each(files, (idx, fileInfo) => {
        if (/^image\//.test(fileInfo.type)) {
          $.when(readFileIntoDataUrl(fileInfo)).done(dataUrl => {
            execCommand('insertimage', dataUrl);
          }).fail(e => {
            options.fileUploadError("file-reader", e);
          });
        } else {
          options.fileUploadError("unsupported-file-type", fileInfo.type);
        }
      });
    },
    markSelection = (input, color) => {
      restoreSelection();
      if (document.queryCommandSupported('hiliteColor')) {
        document.execCommand('hiliteColor', 0, color || 'transparent');
      }
      saveSelection();
      input.data(options.selectionMarker, color);
    },
    bindToolbar = (toolbar, options) => {
      toolbar.find(toolbarBtnSelector).unbind().click(function () {
        restoreSelection();
        //editor.focus(); // cause defocus on selects
        var doc = editor.get(0).ownerDocument;
        var el = $(this);
        var comm = el.data(options.commandRole);
        var args = el.data('args');
        if(args){
          args = args.replace('${content}', doc.getSelection());
          execCommand(comm, args);
        }else{
          doc.execCommand(comm);
        }
        saveSelection();
      });
      toolbar.find('[data-toggle=dropdown]').click(restoreSelection);
      var dName = '[data-' + options.commandRole + ']';
      toolbar.find('select'+dName).on('webkitspeechchange change', function(){
        var newValue = this.value;
        restoreSelection();
        if (newValue) {
          editor.focus();
          execCommand($(this).data(options.commandRole), newValue);
        }
        saveSelection();
      });
      toolbar.find('input[type=text]'+dName,', select'+dName).on('webkitspeechchange change', function () {
        var newValue = this.value; /* ugly but prevents fake double-calls due to selection restoration */
        this.value = '';
        restoreSelection();
        if (newValue) {
          editor.focus();
          execCommand($(this).data(options.commandRole), newValue);
        }
        saveSelection();
      }).on('focus', function () {
        var input = $(this);
        if (!input.data(options.selectionMarker)) {
          markSelection(input, options.selectionColor);
          input.focus();
        }
      }).on('blur', function () {
        var input = $(this);
        if (input.data(options.selectionMarker)) {
          markSelection(input, false);
        }
      });
      toolbar.find('input[type=file][data-' + options.commandRole + ']').change(function () {
        restoreSelection();
        if (this.type === 'file' && this.files && this.files.length > 0) {
          insertFiles(this.files);
        }
        saveSelection();
        this.value = '';
      });
    },
    initFileDrops = () => {
      editor.on('dragenter dragover', false)
        .on('drop', e => {
          var dataTransfer = e.originalEvent.dataTransfer;
          e.stopPropagation();
          e.preventDefault();
          if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
            insertFiles(dataTransfer.files);
          }
        });
    };
  /** Disable the editor
   * @date 2015-03-19 */
  if(typeof userOptions=='string' && userOptions=='destroy'){
    editor.attr('contenteditable', false).unbind('mouseup keyup mouseout dragenter dragover');
    $(window).unbind('touchend');
    return this;
  }
  options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
  var dName = '[data-' + options.commandRole + ']';
  toolbarBtnSelector = 'a'+dName+',button'+dName+',input[type=button]'+dName+', select'+dName;
  //bindHotkeys(options.hotKeys);
  if (options.dragAndDropImages) {
    initFileDrops();
  }
  bindToolbar($(options.toolbarSelector), options);
  editor.attr('contenteditable', true).on('mouseup keyup mouseout', () => {
      saveSelection();
      updateToolbar();
    });
  $(window).bind('touchend', e => {
    var isInside = (editor.is(e.target) || editor.has(e.target).length > 0),
      currentRange = getCurrentRange(),
      clear = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);
    if (!clear || isInside) {
      saveSelection();
      updateToolbar();
    }
  });
  return this;
};
$.fn.wysiwyg.defaults = {
  /*
  hotKeys: {
    'ctrl+b meta+b': 'bold',
    'ctrl+i meta+i': 'italic',
    'ctrl+u meta+u': 'underline',
    'ctrl+z meta+z': 'undo',
    'ctrl+y meta+y meta+shift+z': 'redo',
    'ctrl+l meta+l': 'justifyleft',
    'ctrl+r meta+r': 'justifyright',
    'ctrl+e meta+e': 'justifycenter',
    'ctrl+j meta+j': 'justifyfull',
    'shift+tab': 'outdent',
    'tab': 'indent'
  },
  */
  toolbarSelector: '[data-role=editor-toolbar]',
  commandRole: 'edit',
  activeToolbarClass: 'btn-info',
  selectionMarker: 'edit-focus-marker',
  selectionColor: 'darkgrey',
  dragAndDropImages: true,
  fileUploadError(reason, detail) { console.log("File upload error", reason, detail); }
};

module.exports = $;
