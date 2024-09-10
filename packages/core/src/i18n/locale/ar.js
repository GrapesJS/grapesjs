const traitInputAttr = { placeholder: 'مثال. نص هنا' };

export default {
  assetManager: {
    addButton: 'إضافة',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: 'اختر الصورة',
    uploadTitle: 'قم بإسقاط الملفات هنا أو انقر للرفع',
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
      '': 'علبة',
      wrapper: 'غلاف',
      text: 'نص',
      comment: 'تعليق',
      image: 'صورة',
      video: 'فيديو',
      label: 'عنوان',
      link: 'رابط',
      map: 'خريطة',
      tfoot: 'تذييل الجدول',
      tbody: 'محتوى الجدول',
      thead: 'رأس الجدول',
      table: 'جدول',
      row: 'صف',
      cell: 'سلول جدول',
    },
  },
  deviceManager: {
    device: 'جهاز',
    devices: {
      desktop: 'مكتبي',
      tablet: 'لوحي',
      mobileLandscape: 'جوال أفقي',
      mobilePortrait: 'جوال رأسي',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'عرض',
        fullscreen: 'شاشة كاملة',
        'sw-visibility': 'إظهار الحواف',
        'export-template': 'تصدير',
        'open-sm': 'فتح إعدادات النمط',
        'open-tm': 'فتح إعدادات السمات',
        'open-layers': 'فتح إعدادات الطبقات',
        'open-blocks': 'فتح إعدادات العناصر',
      },
    },
  },
  selectorManager: {
    label: 'الفئات',
    selected: 'محدد',
    emptyState: '- الحالة -',
    states: {
      hover: 'حائم',
      active: 'مفعل',
      'nth-of-type(2n)': 'زوجي/فردي',
    },
  },
  styleManager: {
    empty: 'حدد عنصرًا قبل استخدام مدير النمط',
    layer: 'طبقة',
    fileButton: 'الصور',
    sectors: {
      general: 'عام',
      layout: 'تخطيط',
      typography: 'الكتابة',
      decorations: 'التزيين',
      extra: 'إضافي',
      flex: 'فلکس',
      dimension: 'الأبعاد',
    },
    // The core library generates the name by their `property` name
    properties: {
      // float: 'Float',
    },
  },
  traitManager: {
    empty: 'حدد عنصرًا قبل استخدام مدير السمات',
    label: 'إعدادات السمات',
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
          false: 'نفس الصفحة',
          _blank: 'صفحة أخرى',
        },
      },
    },
  },
  storageManager: {
    recover: 'هل تريد استرداد التغييرات غير المحفوظة؟',
  },
};
