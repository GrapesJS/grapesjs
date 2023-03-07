const traitInputAttr = { placeholder: 'ví dụ: chữ ở đây' };

export default {
  assetManager: {
    addButton: 'Thêm ảnh',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: 'Chọn ảnh',
    uploadTitle: 'Kéo thả file vào đây hoặc click để upload',
  },
  // Here just as a reference, GrapesJS core doesn't contain any block,
  // so this should be omitted from other local files
  blockManager: {
    labels: {
      // 'block-id': 'Nhãn khố',
    },
    categories: {
      // 'category-id': 'Nhãn nhóm',
    },
  },
  domComponents: {
    names: {
      '': 'Box',
      wrapper: 'Body',
      text: 'Text',
      comment: 'Bình luận',
      image: 'Hình ảnh',
      video: 'Video',
      label: 'Nhãn',
      link: 'Liên kết',
      map: 'Sơ đồ',
      tfoot: 'Chân bảng biểu',
      tbody: 'Thân bảng biểu',
      thead: 'Đầu bảng biểu',
      table: 'Bảng biểu',
      row: 'Dòng',
      cell: 'Ô',
    },
  },
  deviceManager: {
    device: 'Thiết bị',
    devices: {
      desktop: 'Máy tính',
      tablet: 'Máy tính bảng',
      mobileLandscape: 'Di động ngang',
      mobilePortrait: 'Di động dọc',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Xem thử',
        fullscreen: 'Toàn màn hình',
        'sw-visibility': 'Xem thành phần',
        'export-template': 'Xem mã',
        'open-sm': 'Mở trình soạn thảo style',
        'open-tm': 'Thiết lập',
        'open-layers': 'Mở trình soạn thảo lớp',
        'open-blocks': 'Mở khối',
      },
    },
  },
  selectorManager: {
    label: 'Classes',
    selected: 'Đã chọn',
    emptyState: '- Trạng thái -',
    states: {
      hover: 'Hover',
      active: 'Click',
      'nth-of-type(2n)': 'Chẵn/Lẻ',
    },
  },
  styleManager: {
    empty: 'Chọn 1 phần tử trước khi sử dụng quản lý style',
    layer: 'Lớp',
    fileButton: 'Hình ảnh',
    sectors: {
      general: 'Chung',
      layout: 'Bố cục',
      typography: 'Kiểu chữ',
      decorations: 'Trang trí',
      extra: 'Extra',
      flex: 'Flex',
      dimension: 'Kích thước',
    },
    // Default names for sub properties in Composite and Stack types.
    // Other labels are generated directly from their property names (eg. 'font-size' will be 'Font size').
    properties: {
      'text-shadow-h': 'X',
      'text-shadow-v': 'Y',
      'text-shadow-blur': 'Mờ',
      'text-shadow-color': 'Màu',
      'box-shadow-h': 'X',
      'box-shadow-v': 'Y',
      'box-shadow-blur': 'Mờ',
      'box-shadow-spread': 'Spread',
      'box-shadow-color': 'Màu',
      'box-shadow-type': 'Loại',
      'margin-top-sub': 'Đầu',
      'margin-right-sub': 'Phải',
      'margin-bottom-sub': 'Dưới',
      'margin-left-sub': 'Trái',
      'padding-top-sub': 'Đầu',
      'padding-right-sub': 'Phải',
      'padding-bottom-sub': 'Dưới',
      'padding-left-sub': 'Trái',
      'border-width-sub': 'Rộng',
      'border-style-sub': 'Phong cách',
      'border-color-sub': 'Màu',
      'border-top-left-radius-sub': 'Trên góc trái',
      'border-top-right-radius-sub': 'Trên góc phải',
      'border-bottom-right-radius-sub': 'Dưới góc phải',
      'border-bottom-left-radius-sub': 'Dưới góc trái',
      'transform-rotate-x': 'Rotate X',
      'transform-rotate-y': 'Rotate Y',
      'transform-rotate-z': 'Rotate Z',
      'transform-scale-x': 'Scale X',
      'transform-scale-y': 'Scale Y',
      'transform-scale-z': 'Scale Z',
      'transition-property-sub': 'Thuộc tính',
      'transition-duration-sub': 'Duration',
      'transition-timing-function-sub': 'Timing',
      'background-image-sub': 'Hình ảnh',
      'background-repeat-sub': 'Lặp lại',
      'background-position-sub': 'Vị trí',
      'background-attachment-sub': 'Đính kèm',
      'background-size-sub': 'Kích thước',
    },
    // Translate options in style properties
    // options: {
    //   float: { // Id of the property
    //     ...
    //     left: 'Left', // {option id}: {Option label}
    //   }
    // }
  },
  traitManager: {
    empty: 'Chọn 1 thành phần trước khi sử dụng bộ quản lý lưu vết',
    label: 'Thiết lập thành phần',
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
        href: { placeholder: 'Ví dụ: https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'Cửa sổ hiện tại',
          _blank: 'Cửa sổ mới',
        },
      },
    },
  },
  storageManager: {
    recover: 'Bạn có muốn khôi phục những thay đổi chưa được lưu?',
  },
};
