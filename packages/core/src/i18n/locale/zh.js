const traitInputAttr = { placeholder: '例子. 输入文字' };

export default {
  add: '添加',
  delete: '删除',
  duplicate: '创建副本',
  rename: '重命名',
  remove: '移除',
  clear: '清空',
  select: '选择',
  selectList: '从列表中选择',
  search: '搜索',
  update: '更新',
  updated: 'Updated!',
  confirm: '确认',
  cancel: '取消',
  enable: 'Enable',
  disable: 'Disable',
  upload: '上传',
  close: '关闭',
  load: 'Load',
  copy: '复制',
  save: '保存',
  current: '当前',
  toggleCss: '切换 CSS',
  selectTarget: '目标组件',
  noCode: '没有可用的代码',
  noItems: '暂无项目',
  confirmAction: '您确认此操作吗？',
  eyeDropper: 'Eyedropper',
  noEyeDropper: 'Eyedropper not supported',
  unauthorized: '未经授权的项目',
  notItemsFound: '未找到任何项目',
  actions: {
    componentOutline: {
      title: '组件轮廓'
    },
    preview: {
      title: '预览'
    },
    fullscreen: {
      title: '全屏'
    },
    showCode: {
      title: '代码',
      exportButton: '导出到ZIP'
    },
    undo: {
      title: '撤销'
    },
    redo: {
      title: '还原'
    },
    save: {
      title: '保存项目'
    },
    store: {
      title: '保存内容'
    },
    open: {
      title: '打开项目'
    },
    importCode: {
      title: '导入代码',
      content: '将您的HTML/CSS粘贴到此处，然后单击导入',
      button: '导入'
    },
    clearCanvas: {
      title: '清空页面',
      content: '您确定要清空该页面吗？'
    },
    about: {
      title: '关于'
    },
    embed: {
      title: '嵌入 Studio'
    },
    newProject: {
      title: '加载项目'
    },
    installApp: {
      title: '安装应用',
      installed: '应用程序安装'
    }
  },
  assetManager: {
    addButton: '添加图片',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: '选择图片',
    uploadTitle: '点击或者拖拽图片上传',
    addUrl: '从URL添加',
    projectAssets: '本项目资源',
    userAssets: '我所有项目的资源',
    errorLoad: '未能加载资源',
    errorUpload: '上传失败',
    errorDelete: '删除失败',
    deleteConfirmQuestion: '删除资源?',
    deleteConfirmExplanation: '这将影响依赖此资源的现有和已发布项目（如果有的话）。'
  },
  blockManager: {
    notFound: '找不到组件',
    blocks: '组件',
    add: '添加更多组件',
    Basic:'基础',
    labels: {
      'section': '部件',
      'column1': '1 列',
      'column2': '2 列',
      'column3': '3 列',
      'column3-7': '2 列 3/7',
      'gridRow': '网格',
      'heading': '标题',
      'divider': '分隔',
      'imageBox': '图片框',
      'linkBox': '链接框',
      'text':'文本',
      'link':'链接',
      'image':'图片',
      'video':'视频',
      'icon':'图标',
      'button':'按钮',
      'map':'地图',
      'form':'表单',
      'input':'输入框',
      'textarea':'文本框',
      'select':'下拉框',
      'label':'标签',
      'checkbox':'复选框',
      'radio':'单选框',
      'navbar':'导航栏'
    },
    categories: {

    },
    symbols: {
      notFound: '找不到复合组件',
      instancesProject: 'Instance/s in the project',
      delete: '找不到复合组件',
      deleteConfirm: '您确定要删除该复合组件吗？项目中的所有实例都将被分离。'
    }
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
    allDevices: '全部设备',
    device: '设备',
    devices: {
      desktop: '桌面',
      tablet: '平板',
      mobileLandscape: 'Mobile Landscape',
      mobilePortrait: 'Mobile Portrait',
    },
  },
  modals: {
    styleCatalog: {
      title: '样式目录',
      noStyles: '未找到样式'
    },
    openProject: {
      title: '打开项目'
    }
  },
  panels: {
    buttons: {
      titles: {
        'preview': '预览',
        'fullscreen': '全屏',
        'sw-visibility': '查看组件',
        'export-template': '查看代码',
        'open-sm': '打开样式管理器',
        'open-tm': '设置',
        'open-layers': '打开布局管理器',
        'open-blocks': '打开块',
      },
    },
  },
  pluginManager: {
    plugins: '插件',
    all: '可获得的插件',
    installed: '已安装',
    install: '安装',
    uninstall: '卸载',
    allPlugins: '全部插件',
    updateStudio: '重新启动Studio进行插件更新'
  },
  globalStyleManager: {
    notFound: '未找到全局样式'
  },
  pageManager: {
    pages: '页面',
    page: '页面',
    newPage: '新页面',
    add: '新增页面',
    rename: '重命名',
    duplicate: '创建副本',
    copy: '复制',
    delete: '删除',
    deletePage: '删除页面',
    confirmDelete: '您确定要删除此页面吗？',
    settings: {
      label: '设置',
      title: '页面设置',
      global: '全局设置',
      fields: {
        name: {
          label: '名称'
        },
        slug: {
          label: '别称',
          description: '别称是url地址名称，用于生成页面的固定链接。通常都是小写，只包含字母、数字和连字符。'
        },
        favicon: {
          label: '网站图标',
          description: '网站图标是浏览器选项卡中显示的小图标。'
        },
        title: {
          label: '标题',
          description: '标题是浏览器选项卡中显示的页面的名称。'
        },
        description: {
          label: '描述',
          description: '描述是页面内容的简短摘要。'
        },
        keywords: {
          label: '关键字',
          description: '关键字是描述页面内容的字词或句子，有利于SEO优化。'
        },
        socialTitle: {
          label: '分享标题',
          description: '标题是出现在社交网络上的页面的名称。'
        },
        socialImage: {
          label: '分享图片',
          description: '图像是出现在社交网络上的图片。'
        },
        socialDescription: {
          label: '分享描述',
          description: '描述是对出现在社交网络上的页面内容的简短总结。'
        },
        customCodeHead: {
          label: '自定义 HTML head',
          description: '添加任何自定义HTML（例如，元标签，样式表，脚本），以包含在页面的<head>部分。'
        },
        customCodeBody: {
          label: '自定义 HTML body',
          description: '在</body>标签之前添加任何自定义HTML（例如，脚本，跟踪代码）。'
        }
      }
    }
  },
  projectManager: {
    existentProjects: '您的项目',
    templates: '模板',
    notAvailable: '没有可用的项目',
    projectType: '项目类型',
    projectName: '项目名称',
    pages: '页面'
  },
  templates: {
    notFound: '未找到模板'
  },
  storageManager: {
    errorLoad: '加载项目失败',
    errorStore: '保存项目失败'
  },
  selectorManager: {
    label: '类名',
    selected: '选择',
    emptyState: '- 状态 -',
    states: {
      'hover': '鼠标悬停',
      'active': '点击',
      'nth-of-type(2n)': '偶数/奇数',
    },
    noSelecton: '您没有选择任何元素。',
    selectFromCanvas: '从画布中选择一个元素。',
    selectFromList: '从样式目录中拾取任意样式。',
    selectCustom: '添加自定义样式选择器。',
    selection: '选择样式',
    selector: '选择器',
    addNewSelector: '添加新选择器',
    removeSelector: '删除选择器',
    target: '目标',
    device: '设备',
    state: '状态',
    deleteStyle: '删除样式',
    showCSS: '显示CSS代码',
    searchStyle: '搜索样式',
    applyOnSelector: '在选择器上应用样式更改',
    noSelectors: '未应用选择器',
    applyOnComponents: '在组件上应用样式更改',
    noComponents: '未选择组件',
    currentSelection: '显示样式的当前选择'
  },
  layerManager: {
    layers: '图层'
  },
  styleManager: {
    panelLabel: '样式',
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
      'gs-layout':'布局',
      'gs-size':'尺寸',
      'gs-space':'间距',
      'gs-position':'位置',
      'gs-typography':'排版',
      'gs-background':'背景',
      'gs-borders':'边框',
      'gs-effects':'效果',
    },
    layout: {
      flexChild: 'Flex 子项',
      display: {
        tips: {
          'block': 'Block生成一个块元素框，在正常流中生成元素前后的换行符。',
          'inline': 'Inline生成一个或多个不生成换行符的内联元素框。内联通常是文本内容的默认设置。',
          'inline-block': 'Inline-block 类似于内联块，但允许定义宽度和高度属性。',
          'flex': 'Flex的行为类似于块元素，并在垂直/水平轴上布局其子元素',
          'none': '该元素在布局中隐藏'
        }
      },
      direction: {
        title: {
          'row': '水平',
          'row-reverse': '水平翻转',
          'column': '垂直',
          'column-reverse': '垂直翻转'
        }
      }
    },
    position: {
      tips: {
        static: '默认位置',
        relative: '相对定位，但具有相对于自身位移的能力',
        absolute: '相对于当前非静态父节点的绝对位置',
        fixed: '固定位置（即使在滚动页面时），相对于浏览器视窗',
        sticky: '元素保持在适当的位置，但在滚动页面时根据指定的距离移动'
      },
      presets: {
        title: '预设',
        options: {
          'topLeft': '左上',
          'topRight': '右上',
          'bottomLeft': '左下',
          'bottomRight': '右下',
          'left': '左',
          'right': '右',
          'bottom': '下',
          'top': '上',
          'full': '全部'
        }
      }
    },
    // The core library generates the name by their `property` name
    properties: {
      'float': '浮动',
      'margin-top': '上',
      'margin-right': '有',
      'margin-bottom': '下',
      'margin-left': '左',
      'padding-top': '上',
      'padding-right': '右',
      'padding-bottom': '下',
      'padding-left': '左',
      'border-top-left-radius': '左上',
      'border-top-right-radius': '右上',
      'border-bottom-right-radius': '右下',
      'border-bottom-left-radius': '左下',
      'mix-blend-mode': '混合模式',
      'transform-style': '变换类型',
      'perspective': '透视',
      'backface-visibility': '背面(backface-visibility)',
      'perspective-origin': '透视原点',
      'perspective-origin-x': '左',
      'perspective-origin-y': '上',
      'transform-origin-x': '左',
      'transform-origin-y': '上',
      'align-items': '对齐',
      'align-self': '对齐',
      'justify-content': 'Justify',
      'row-gap': '行',
      'column-gap': '列',
      'font-family': '字体',
      'font-size': '大小',
      'font-weight': '字重',
      'letter-spacing': '间距',
      'text-align': '对齐',
      'text-decoration': '风格',
      'text-transform': '变换',
      'white-space': '空白符(white-space)',
      'border-top-width': '上',
      'border-right-width': '右',
      'border-bottom-width': '下',
      'border-left-width': '左',
      'border-top-style': '上',
      'border-right-style': '右',
      'border-bottom-style': '下',
      'border-left-style': '左',
      'border-top-color': '上',
      'border-right-color': '右',
      'border-bottom-color': '下',
      'border-left-color': '左',
      'background-position': '位置',
      'background-position-x': '左',
      'background-position-y': '上',
      'background-size': '大小',
      'background-size-x': '左',
      'background-size-y': '上',
      'background-repeat': '重复',
      'background-attachment': '属性',
      'background-origin': '原点',
      'background-clip': '剪切',
      'overflow-x': 'X',
      'overflow-y': 'Y',
      'width':'宽',
      'height':'高',
      'min-width':'最小宽',
      'min-height':'最小高',
      'max-width':'最大宽',
      'max-height':'最大高',
      'display':'显示',
      'padding':'内间距',
      'margin':'外间距',
      'box-shadow':'盒子阴影',
      'text-shadow':'文本阴影',
      'filter':'滤镜',
      'backdrop-filter':'背景滤镜',
      'transition':'过渡',
      'transform':'变换',
      'transform-origin':'变换原点',
      'overflow':'溢出(overflow)',
      'cursor':'光标',
      'opacity':'不透明度',
    },
    options: {
        '__background-type': {
            'image': '图片',
            'gradient': '斜率',
            'color': '颜色'
        },
        'display': {
            'block': '块(Block)',
            'inline': '内联(Inline)',
            'inline-block': '内联块(Inline block)',
            'flex': 'Flex',
            'none': '隐藏'
        },
        'overflow': {
            'visible': '显示',
            'hidden': '隐藏',
            'scroll': '滚动',
            'auto': '自动'
        },
        'flex-wrap': {
            'nowrap': '不换行',
            'wrap': '换行',
            'wrap-reverse': '反向换行'
        }
    }
  },
  traitManager: {
    empty: '选择一个组件以查看其属性',
    label: '组件设置',
    panelLabel: '属性',
    traits: {
      labels: {
        loading: '加载中',
        target: '新标签中打开',
        showList: '显示元素列表',
        customAttributes: '自定义属性',
        tagName:'标签名称'
      },
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
