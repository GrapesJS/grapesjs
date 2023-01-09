const traitInputAttr = { placeholder: 'eg. Text here' };

export default {
  assetManager: {
    addButton: 'הוספת תמונה',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: 'בחירת תמונה',
    uploadTitle: 'גררו קבצים לכאן או לחצו להעלאה',
  },
  // Here just as a reference, GrapesJS core doesn't contain any block,
  // so this should be omitted from other local files
  blockManager: {
    labels: {
      // 'block-id': 'תווית בלוק',
    },
    categories: {
      // 'category-id': 'תווית קטגוריה',
    },
  },
  domComponents: {
    names: {
      '': 'קופסה',
      wrapper: 'גוף',
      text: 'טקסט',
      comment: 'תגובה',
      image: 'תמונה',
      video: 'וידיאו',
      label: 'תווית',
      link: 'קישור',
      map: 'מפה',
      tfoot: 'תחתית טבלה',
      tbody: 'גוף טבלה',
      thead: 'ראש טבלה',
      table: 'טבלה',
      row: 'שורת טבלה',
      cell: 'תא טבלה',
    },
  },
  deviceManager: {
    device: 'מכשיר',
    devices: {
      desktop: 'מחשב שולחני',
      tablet: 'טאבלט',
      mobileLandscape: 'תצוגה רוחבית',
      mobilePortrait: 'תצוגה ישרה',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'תצוגה מקדימה',
        fullscreen: 'מסך מלא',
        'sw-visibility': 'צפייה ברכיבים',
        'export-template': 'צפייה בקוד',
        'open-sm': 'פתיחת ניהול סגנון',
        'open-tm': 'הגדרות',
        'open-layers': 'פתיחת מנהל השכבות',
        'open-blocks': 'פתיחת בלוקים',
      },
    },
  },
  selectorManager: {
    label: 'מחלקות',
    selected: 'נבחרו',
    emptyState: '- מצב -',
    states: {
      hover: 'מעבר על',
      active: 'לחיצה',
      'nth-of-type(2n)': 'זוגי/אי זוגי',
    },
  },
  styleManager: {
    empty: 'בחרו אלמנט לפני השימוש במנהל הסגנון',
    layer: 'שכבה',
    fileButton: 'תמונות',
    sectors: {
      general: 'כללי',
      layout: 'מבנה',
      typography: 'טיפוגרפיה',
      decorations: 'קישוטים',
      extra: 'נוסף',
      flex: 'גמיש',
      dimension: 'מימד',
    },
    // Default names for sub properties in Composite and Stack types.
    // Other labels are generated directly from their property names (eg. 'font-size' will be 'Font size').
    properties: {
      'text-shadow-h': 'X',
      'text-shadow-v': 'Y',
      'text-shadow-blur': 'מטושטש',
      'text-shadow-color': 'צבע',
      'box-shadow-h': 'X',
      'box-shadow-v': 'Y',
      'box-shadow-blur': 'מטושטש',
      'box-shadow-spread': 'פיזור',
      'box-shadow-color': 'צבע',
      'box-shadow-type': 'סוג',
      'margin-top-sub': 'עליון',
      'margin-right-sub': 'ימין',
      'margin-bottom-sub': 'תחתון',
      'margin-left-sub': 'שמאל',
      'padding-top-sub': 'עליון',
      'padding-right-sub': 'ימין',
      'padding-bottom-sub': 'תחתון',
      'padding-left-sub': 'שמאל',
      'border-width-sub': 'רוחב',
      'border-style-sub': 'סגנון',
      'border-color-sub': 'צבע',
      'border-top-left-radius-sub': 'שמאל עליון',
      'border-top-right-radius-sub': 'ימין עליון',
      'border-bottom-right-radius-sub': 'ימין תחתון',
      'border-bottom-left-radius-sub': 'שמאל תחלון',
      'transform-rotate-x': 'סיבוב X',
      'transform-rotate-y': 'סיבוב Y',
      'transform-rotate-z': 'סיבוב Z',
      'transform-scale-x': 'קנה מידה X',
      'transform-scale-y': 'קנה מידה Y',
      'transform-scale-z': 'קנה מידה Z',
      'transition-property-sub': 'תכונה',
      'transition-duration-sub': 'משך',
      'transition-timing-function-sub': 'תזמון',
      'background-image-sub': 'תמונה',
      'background-repeat-sub': 'חזרה',
      'background-position-sub': 'מיקום',
      'background-attachment-sub': 'נספח',
      'background-size-sub': 'גודל',
    },
    // Translate options in style properties
    // options: {
    //   float: { // Id of the property
    //     ...
    //     left: 'שמאל', // {option id}: {Option label}
    //   }
    // }
  },
  traitManager: {
    empty: 'בחר אלמנט לפני השימוש במנהל התכונות',
    label: 'הגדרות רכיב',
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
        href: { placeholder: 'דוג. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'חלון נוכחי',
          _blank: 'חלון חדש',
        },
      },
    },
  },
  storageManager: {
    recover: 'רוצה לשחזר שינויים שטרם נשמרו?',
  },
};
