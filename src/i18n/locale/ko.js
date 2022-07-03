const traitInputAttr = { placeholder: 'eg. 텍스트 입력' };

export default {
  assetManager: {
    addButton: '이미지 추가',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: '이미지 선택',
    uploadTitle: '원하는 파일을 여기에 놓거나 업로드를 위해 클릭',
  },
  // Here just as a reference, GrapesJS core doesn't contain any block,
  // so this should be omitted from other local files
  blockManager: {
    labels: {
      // 'block-id': 'Block Label',
    },
    categories: {
      // 'category-id': 'Category Label',
    },
  },
  domComponents: {
    names: {
      '': '상자',
      wrapper: 'Body',
      text: '텍스트',
      comment: 'Comment',
      image: '이미지',
      video: '동영상',
      label: 'Label',
      link: '링크',
      map: '지도',
      tfoot: 'Table foot',
      tbody: 'Table body',
      thead: 'Table head',
      table: 'Table',
      row: 'Table row',
      cell: 'Table cell',
    },
  },
  deviceManager: {
    device: 'Device',
    devices: {
      desktop: '데스크탑',
      tablet: '태블릿',
      mobileLandscape: '모바일 환경',
      mobilePortrait: '모바일 Portrait',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: '미리보기',
        fullscreen: '전체화면',
        'sw-visibility': 'components 보기',
        'export-template': '코드 보기',
        'open-sm': 'Style Manager 열기',
        'open-tm': '설정',
        'open-layers': 'Layer Manager 열기',
        'open-blocks': 'Blocks 열기',
      },
    },
  },
  selectorManager: {
    label: 'Classes',
    selected: '선택된',
    emptyState: '- 상태 -',
    states: {
      hover: 'Hover',
      active: 'Click',
      'nth-of-type(2n)': '짝수/홀수',
    },
  },
  styleManager: {
    empty: 'Style Manager 사용하려면, 먼저 element를 선택해주세요',
    layer: '레이어',
    fileButton: 'Images',
    sectors: {
      general: '기본설정',
      layout: '레이아웃',
      typography: '글꼴',
      decorations: '꾸미기',
      extra: 'Extra',
      flex: 'Flex',
      dimension: '크기 및 위치',
    },
    // The core library generates the name by their `property` name
    properties: {
      // float: 'Float',
    },
  },
  traitManager: {
    empty: 'Trait Manager 사용하려면, 먼저 element를 선택해주세요',
    label: 'Component 설정',
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
        href: { placeholder: 'eg. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: '현재 창',
          _blank: '새 창',
        },
      },
    },
  },
};
