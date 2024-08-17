const traitInputAttr = { placeholder: 'cth. Ketik disini' };

export default {
  assetManager: {
    addButton: 'Tambah gambar',
    inputPlh: 'http://path/menuju/gambar.jpg',
    modalTitle: 'Pilih Gambar',
    uploadTitle: 'Tarik gambar kesini atau klik upload',
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
      '': 'Kotak',
      wrapper: 'Badan',
      text: 'Teks',
      comment: 'Komentar',
      image: 'Gambar',
      video: 'Video',
      label: 'Label',
      link: 'Link',
      map: 'Peta',
      tfoot: 'Kaki tabel',
      tbody: 'Badan tabel',
      thead: 'Kepala tabel',
      table: 'Tabel',
      row: 'Baris tabel',
      cell: 'Cell tabel',
    },
  },
  deviceManager: {
    device: 'Perangkat',
    devices: {
      desktop: 'Desktop',
      tablet: 'Tablet',
      mobileLandscape: 'Mobile Landscape',
      mobilePortrait: 'Mobile Portrait',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Pra-tayang',
        fullscreen: 'Tampilan penuh',
        'sw-visibility': 'Lihat komponen',
        'export-template': 'Lihat kode',
        'open-sm': 'Buka Manajemen Style',
        'open-tm': 'Pengaturan',
        'open-layers': 'Buka Layer Manager',
        'open-blocks': 'Buka Blocks',
      },
    },
  },
  selectorManager: {
    label: 'Class',
    selected: 'Terpilih',
    emptyState: '- State -',
    states: {
      hover: 'Hover',
      active: 'Klik',
      'nth-of-type(2n)': 'Rata/Ganjil',
    },
  },
  styleManager: {
    empty: 'Pilih elemen sebelum menggunakan Manajemen Style',
    layer: 'Layer',
    fileButton: 'Gambar',
    sectors: {
      general: 'Umum',
      layout: 'Pemetaan',
      typography: 'Tipografi',
      decorations: 'Dekorasi',
      extra: 'Ekstra',
      flex: 'Flex',
      dimension: 'Dimensi',
    },
    // Default names for sub properties in Composite and Stack types.
    // Other labels are generated directly from their property names (eg. 'font-size' will be 'Font size').
    properties: {
      'text-shadow-h': 'X',
      'text-shadow-v': 'Y',
      'text-shadow-blur': 'Blur',
      'text-shadow-color': 'Warna',
      'box-shadow-h': 'X',
      'box-shadow-v': 'Y',
      'box-shadow-blur': 'Blur',
      'box-shadow-spread': 'Spread',
      'box-shadow-color': 'Warna',
      'box-shadow-type': 'Tipe',
      'margin-top-sub': 'Atas',
      'margin-right-sub': 'Kanan',
      'margin-bottom-sub': 'Bawah',
      'margin-left-sub': 'Kiri',
      'padding-top-sub': 'Atas',
      'padding-right-sub': 'Kanan',
      'padding-bottom-sub': 'Bawah',
      'padding-left-sub': 'Kiri',
      'border-width-sub': 'Panjang',
      'border-style-sub': 'Gaya',
      'border-color-sub': 'Warna',
      'border-top-left-radius-sub': 'Atas Kiri',
      'border-top-right-radius-sub': 'Atas Kanan',
      'border-bottom-right-radius-sub': 'Bawah Kanan',
      'border-bottom-left-radius-sub': 'Bawah Kiri',
      'transform-rotate-x': 'Putar X',
      'transform-rotate-y': 'Putar Y',
      'transform-rotate-z': 'Putar Z',
      'transform-scale-x': 'Scale X',
      'transform-scale-y': 'Scale Y',
      'transform-scale-z': 'Scale Z',
      'transition-property-sub': 'Properti',
      'transition-duration-sub': 'Durasi',
      'transition-timing-function-sub': 'Timing',
      'background-image-sub': 'Gambar',
      'background-repeat-sub': 'Berulang',
      'background-position-sub': 'Posisi',
      'background-attachment-sub': 'Lampiran',
      'background-size-sub': 'Ukuran',
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
    empty: 'Pilih elemen terlebih dulu sebelum menggunakan Manajemen Trait',
    label: 'Pengaturan komponen',
    categories: {
      categoryId: 'Label kategori',
    },
    traits: {
      // The core library generates the name by their `name` property
      labels: {
        title: 'Judul',
        href: 'Url (href)',
        // id: 'Id',
        // alt: 'Alt',
      },
      // In a simple trait, like text input, these are used on input attributes
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'cth. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'Jendela ini',
          _blank: 'Jendela baru',
        },
      },
    },
  },
  storageManager: {
    recover: 'Apakah kamu ingin mengembalikan draft yang belum tersimpan?',
  },
};
