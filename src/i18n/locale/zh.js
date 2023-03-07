const traitInputAttr = { placeholder: '例子. 输入文字' };

export default {
  assetManager: {
    addButton: '添加图片',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: '选择图片',
    uploadTitle: '点击或者拖拽图片上传',
  },
  domComponents: {
    names: {
      '': 'Box',
      wrapper: 'Body',
      text: '文字',
      comment: '评论',
      image: '图片',
      video: '视频',
      label: '文本',
      link: '超链接',
      map: '地图',
      tfoot: '表格末尾',
      tbody: '表格主体',
      thead: '表头',
      table: '表格',
      row: '行',
      cell: '单元格',
    },
  },
  deviceManager: {
    device: '设备',
    devices: {
      desktop: '桌面',
      tablet: '平板',
      mobileLandscape: 'Mobile Landscape',
      mobilePortrait: 'Mobile Portrait',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: '预览',
        fullscreen: '全屏',
        'sw-visibility': '查看组件',
        'export-template': '查看代码',
        'open-sm': '打开样式管理器',
        'open-tm': '设置',
        'open-layers': '打开布局管理器',
        'open-blocks': '打开块',
      },
    },
  },
  selectorManager: {
    label: 'Classes',
    selected: 'Selected',
    emptyState: '- State -',
    states: {
      hover: 'Hover',
      active: 'Click',
      'nth-of-type(2n)': 'Even/Odd',
    },
  },
  styleManager: {
    empty: '设置样式前选择请一个元素',
    layer: '层级',
    fileButton: '图片',
    sectors: {
      general: '常规',
      layout: '布局',
      typography: '版式',
      decorations: '装饰',
      extra: '扩展',
      flex: '盒子模型',
      dimension: '尺寸',
    },
    // The core library generates the name by their `property` name
    properties: {
      // float: 'Float',
    },
  },
  traitManager: {
    empty: '用设置项前选择一个组件',
    label: '组件设置',
    traits: {
      // In a simple trait, like text input, these are used on input attributes
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'eg. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: '本窗口',
          _blank: '新窗口',
        },
      },
    },
  },
};
