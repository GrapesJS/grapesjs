const traitInputAttr = { placeholder: 'متن را اینجا وارد کنید' };

export default {
  assetManager: {
    addButton: 'افزودن تصویر',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: 'انتخاب تصویر',
    uploadTitle: 'فایل را انتخاب کنید یا در این مکان رها کنید',
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
      '': 'باکس',
      wrapper: 'یدنه',
      text: 'متن',
      comment: 'اظهار نظر',
      image: 'تصویر',
      video: 'ویدئو',
      label: 'برچسب',
      link: 'پیوند',
      map: 'نقشه',
      tfoot: 'پا جدول',
      tbody: 'بدنه جدول',
      thead: 'سر جدول',
      table: 'جدول',
      row: 'ردیف جدول',
      cell: 'سلول جدول',
    },
  },
  deviceManager: {
    device: 'دستگاه',
    devices: {
      desktop: 'دسک تاپ',
      tablet: 'تبلت',
      mobileLandscape: 'موبایل خوابیده',
      mobilePortrait: 'موبایل ایستاده',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'پیش نمایش',
        fullscreen: 'تمام صفحه',
        'sw-visibility': 'مشاهده اجزاء',
        'export-template': 'نمایش کد',
        'open-sm': 'باز کردن مدیریت استایل',
        'open-tm': 'تنظیمات',
        'open-layers': 'باز کردن مدیریت لایه‌ها',
        'open-blocks': 'باز کردن مدیریت بلوک‌ها',
      },
    },
  },
  selectorManager: {
    label: 'کلاس‌ها',
    selected: 'انتخاب شده',
    emptyState: '- حالت -',
    states: {
      hover: 'هاور',
      active: 'کلیک',
      'nth-of-type(2n)': 'زوج/فرد',
    },
  },
  styleManager: {
    empty: 'قبل از استفاده از مدیریت استایل یک عنصر را انتخاب کنید',
    layer: 'لایه',
    fileButton: 'تصاویر',
    sectors: {
      general: 'کلی',
      layout: 'چیدمان',
      typography: 'شیوه نگارش',
      decorations: 'تزئینات',
      extra: 'اضافی',
      flex: 'فلکس',
      dimension: 'ابعاد',
    },
    // The core library generates the name by their `property` name
    properties: {
      // float: 'Float',
    },
    traitManager: {
      empty: 'قبل از استفاده از مدیر ویژگی ، یک عنصر را انتخاب کنید',
      label: 'تنظیمات جزء',
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
          href: { placeholder: 'مثال: https://google.com' },
        },
        // In a trait like select, these are used to translate option names
        options: {
          target: {
            false: 'پنجره فعلی',
            _blank: 'پنجره جدید',
          },
        },
      },
    },
  },
};
