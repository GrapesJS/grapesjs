const traitInputAttr = { placeholder: 'Прим. Текст здесь' };

export default {
  assetManager: {
    addButton: 'Добавить изображение',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: 'Выбрать изображение',
    uploadTitle: 'Перетащите файлы сюда или нажмите, чтобы загрузить',
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
      '': 'Область',
      wrapper: 'Тело',
      text: 'Текст',
      comment: 'Комментарий',
      image: 'Изобраение',
      video: 'Визео',
      label: 'Ярлык',
      link: 'Ссылка',
      map: 'Карта',
      tfoot: 'Подвал таблицы',
      tbody: 'Тело таблицы',
      thead: 'Заголовок таблицы',
      table: 'Таблица',
      row: 'Строка таблицы',
      cell: 'Ячейка таблицы',
    },
  },
  deviceManager: {
    device: 'Устройство',
    devices: {
      desktop: 'Десктоп',
      tablet: 'Планшет',
      mobileLandscape: 'Мобильный горизонтально',
      mobilePortrait: 'Мобильный верикально',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Предварительный просмотр',
        fullscreen: 'Полноэкранный режим',
        'sw-visibility': 'Просмотр компонентов',
        'export-template': 'Просмотреть код',
        'open-sm': 'Открыть диспетчер стилей',
        'open-tm': 'Настройки',
        'open-layers': 'Открыть диспетчер слоев',
        'open-blocks': 'Открытые блоки',
      },
    },
  },
  selectorManager: {
    label: 'Классы',
    selected: 'Выбрано',
    emptyState: '- Состояние -',
    states: {
      hover: 'Наведение',
      active: 'Клик',
      'nth-of-type(2n)': 'Четный/Нечетный',
    },
  },
  styleManager: {
    empty: 'Выберите элемент перед использованием Диспетчера стилей',
    layer: 'Слой',
    fileButton: 'Изображения',
    sectors: {
      general: 'Общее',
      layout: 'Макет',
      typography: 'Шрифты',
      decorations: 'Оформление',
      extra: 'Дополнительно',
      flex: 'Flex-атрибуты',
      dimension: 'Измерение',
    },
    // Default names for sub properties in Composite and Stack types.
    // Other labels are generated directly from their property names (eg. 'font-size' will be 'Font size').
    properties: {
      'text-shadow-h': 'X',
      'text-shadow-v': 'Y',
      'text-shadow-blur': 'Размытие',
      'text-shadow-color': 'Цвет',
      'box-shadow-h': 'X',
      'box-shadow-v': 'Y',
      'box-shadow-blur': 'Размытие',
      'box-shadow-spread': 'Распространение',
      'box-shadow-color': 'Цвет',
      'box-shadow-type': 'Тип',
      'margin-top-sub': 'Сверху',
      'margin-right-sub': 'Справа',
      'margin-bottom-sub': 'Снизу',
      'margin-left-sub': 'Слева',
      'padding-top-sub': 'Сверху',
      'padding-right-sub': 'Справа',
      'padding-bottom-sub': 'Снизу',
      'padding-left-sub': 'Слева',
      'border-width-sub': 'Ширина',
      'border-style-sub': 'Стиль',
      'border-color-sub': 'Цвет',
      'border-top-left-radius-sub': 'Вверху слева',
      'border-top-right-radius-sub': 'Вверху справа',
      'border-bottom-right-radius-sub': 'Внизу справа',
      'border-bottom-left-radius-sub': 'Внизу слева',
      'transform-rotate-x': 'Повернуть X',
      'transform-rotate-y': 'Повернуть Y',
      'transform-rotate-z': 'Повернуть Z',
      'transform-scale-x': 'Масштаб X',
      'transform-scale-y': 'Масштаб Y',
      'transform-scale-z': 'Масштаб Z',
      'transition-property-sub': 'Свойство',
      'transition-duration-sub': 'Продолжительность',
      'transition-timing-function-sub': 'Время',
      'background-image-sub': 'Изображение',
      'background-repeat-sub': 'Повтор',
      'background-position-sub': 'Позиция',
      'background-attachment-sub': 'Вложение',
      'background-size-sub': 'Размер',
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
    empty: 'Выберите элемент перед использованием Trait Manager',
    label: 'Настройки компонента',
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
        href: { placeholder: 'Прим. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'Это окно',
          _blank: 'Новое окно',
        },
      },
    },
  },
  storageManager: {
    recover: 'Вы хотите восстановить несохраненные изменения?',
  },
};
