const traitInputAttr = { placeholder: '文本' };

export default {
  assetManager: {
    addButton: '添加图片',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: '选择图片',
    uploadTitle: '托拽图片到这里点击上传'
  },
  // Here just as a reference, GrapesJS core doesn't contain any block,
  // so this should be omitted from other local files
  blockManager: {
    labels: {
      // 'block-id': 'Block Label',
    },
    categories: {
      // 'category-id': 'Category Label',
    }
  },
  domComponents: {
    names: {
      '': 'Box',
      wrapper: 'Body',
      text: '文本',
      comment: 'Comment',
      image: '图片',
      video: '视频',
      label: '标签',
      link: '链接',
      map: '地图',
      tfoot: '表尾',
      tbody: '表内容',
      thead: '表头',
      table: '表格',
      row: '行',
      cell: '单元格'
    }
  },
  deviceManager: {
    device: '设备',
    devices: {
      desktop: '桌面',
      tablet: '平板',
      mobileLandscape: '手机横屏',
      mobilePortrait: '手机竖屏'
    }
  },
  panels: {
    buttons: {
      titles: {
        preview: '预览',
        fullscreen: '全屏',
        'sw-visibility': '查看',
        'export-template': '查看代码',
        'open-sm': '样式管理',
        'open-tm': '设置',
        'open-layers': '层级管理',
        'open-blocks': '元素管理'
      }
    }
  },
  selectorManager: {
    label: '样式',
    selected: '当前选中',
    emptyState: '- State -',
    states: {
      hover: 'Hover',
      active: 'Click',
      'nth-of-type(2n)': 'Even/Odd'
    }
  },
  styleManager: {
    empty: '还没有选择任何元素',
    layer: 'Layer',
    fileButton: 'Images',
    sectors: {
      general: '基础',
      layout: '布局',
      typography: '字体和颜色',
      decorations: '边框',
      extra: '其他',
      flex: 'Flex',
      dimension: '宽高和边距'
    },
    // The core library generates the name by their `property` name
    properties: {
      // float: 'Float',
    }
  },
  traitManager: {
    empty: '选择元素进行设置',
    label: '组件设置',
    traits: {
      // The core library generates the name by their `name` property
      labels: {
        // id: 'Id',
        // alt: 'Alt',
        // title: 'Title',
        // href: 'Href',
      },
      // In a simple trait, like text input, these are used on input attributes
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'eg. https://www.baidu.com' }
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          '': '本窗口',
          _blank: '新窗口'
        }
      }
    }
  }
};
