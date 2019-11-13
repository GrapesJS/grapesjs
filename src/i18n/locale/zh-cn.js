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
      testBlock: 'Block'
    },
    categories: {
      // 'category-id': 'Category Label',
    }
  },
  domComponents: {
    names: {
      '': 'Div',
      wrapper: 'Body',
      text: '文本',
      comment: '注释',
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
      cell: '单元格',
      textnode: '文字'
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
      float: '浮动',
      display: '显示',
      position: '位置',
      top: '上',
      right: '右',
      left: '左',
      bottom: '下',
      width: '宽度',
      height: '高度',
      'max-width': '最大宽度',
      'max-height': '最大高度',
      'min-height': '最小高度',
      margin: '外边距',
      'margin-top': '上',
      'margin-right': '右',
      'margin-bottom': '下',
      'margin-left': '左',
      padding: '内边距',
      'padding-top': '上',
      'padding-right': '右',
      'padding-bottom': '下',
      'padding-left': '左',
      'font-family': '字体',
      'font-size': '字号',
      'font-weight': '粗细',
      'letter-spacing': '字符间距',
      color: '颜色',
      'line-height': '行高',
      'text-shadow': '文本阴影',
      'text-shadow-h': '水平',
      'text-shadow-v': '垂直',
      'text-shadow-blur': '位置',
      'text-shadow-color': '颜色',
      'border-radius': '圆角边框',
      'border-top-left-radius': '左上角',
      'border-top-right-radius': '右上角',
      'border-bottom-left-radius': '左下角',
      'border-bottom-right-radius': '右下角',
      border: '边框',
      'border-width': '宽度',
      'border-style': '样式',
      'border-color': '颜色',
      'background-color': '背景色',
      'box-shadow': '盒阴影',
      'box-shadow-v': '垂直',
      'box-shadow-h': '水平',
      'box-shadow-blur': '距离',
      'box-shadow-spread': '尺寸',
      'box-shadow-color': '颜色',
      'box-shadow-type': '类型',
      background: '背景',
      'background-image': '图片',
      'background-repeat': '重复',
      'background-position': '开始位置',
      'background-attachment': 'attacthment',
      'background-size': '尺寸',
      transform: '旋转',
      'transform-rotate-x': '2Dx轴',
      'transform-rotate-y': '2Dy轴',
      'transform-rotate-z': '2Dz轴',
      'transform-scale-x': '3Dx轴',
      'transform-scale-y': '3Dy轴',
      'transform-scale-z': '3Dz轴',
      transition: '过度',
      'transition-property': '属性',
      'transition-duration': '时间',
      'transition-timing-function': '速度曲线',
      'align-items': 'align-items',
      'align-content': 'align-content',
      order: 'order',
      'flex-direction': 'flex-direction',
      'flex-wrap': 'flex-wrap',
      'flex-basis': 'flex-basis',
      'flex-grow': 'flex-grow',
      'flex-shrink': 'flex-shrink',
      'align-self': 'align-self',
      'justify-content': 'justify-content',
      perspective: 'perspective'
    }
  },
  traitManager: {
    empty: '选择元素进行设置',
    label: '组件设置',
    traits: {
      // The core library generates the name by their `name` property
      labels: {
        id: 'Id',
        alt: 'Alt',
        title: 'Title',
        href: 'Href',
        target: 'Target'
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
