const traitInputAttr = { placeholder: 'eg. Text here' };

export default {
  assetManager: {
    addButton: 'Προσθήκη Εικόνας',
    inputPlh: 'http://διαδρομή/μέχρι/την/εικόνα.jpg',
    modalTitle: 'Επιλογή Εικόνας',
    uploadTitle: 'Αφήστε τα αρχεία εδώ ή κάντε κλικ για ανέβασμα',
  },
  // Εδώ υπάρχει απλά αναφορά, ο πυρήνας του GrapesJS δεν διαθέτει κανένα πλαίσιο,
  // οπότε αυτό θα πρέπει να αγνοηθεί από τα υπόλοιπα αρχεία μετάφρασης
  blockManager: {
    labels: {
      // 'block-id': 'Ετικέτα Πλαισίου',
    },
    categories: {
      // 'category-id': 'Ετικέτα Κατηγορίας',
    },
  },
  domComponents: {
    names: {
      '': 'Κουτί',
      wrapper: 'Κορμός',
      text: 'Κείμενο',
      comment: 'Σχόλιο',
      image: 'Εικόνα',
      video: 'Βίντεο',
      label: 'Ετικέτα',
      link: 'Σύνδεσμος',
      map: 'Χάρτης',
      tfoot: 'Υποσέλιδο πίνακα',
      tbody: 'Κορμός πίνακα',
      thead: 'Κεφαλίδα πίνακα',
      table: 'Πίνακας',
      row: 'Γραμμή πίνακα',
      cell: 'Κελί πίνακα',
    },
  },
  deviceManager: {
    device: 'Συσκευή',
    devices: {
      desktop: 'Σθαθερός Υπολογιστής',
      tablet: 'Τάμπλετ',
      mobileLandscape: 'Κινητό Οριζόντια',
      mobilePortrait: 'Κινητό Κάθετα',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Προεπισκόπηση',
        fullscreen: 'Πλήρη Οθόνη',
        'sw-visibility': 'Προβολή συστατικών',
        'export-template': 'Προβολή κώδικα',
        'open-sm': 'Άνοιγμα Του Διαχειριστή Μορφοποίησης',
        'open-tm': 'Ρυθμίσεις',
        'open-layers': 'Άνοιγμα Του Διαχειριστή Επιπέδων',
        'open-blocks': 'Άνοιγμα Πλαισίων',
      },
    },
  },
  selectorManager: {
    label: 'Κλάσεις',
    selected: 'Επιλεγμένο',
    emptyState: '- Κατάσταση -',
    states: {
      hover: 'Αιώρηση',
      active: 'Κλικ',
      'nth-of-type(2n)': 'Μονές/Ζυγές',
    },
  },
  styleManager: {
    empty: 'Επιλέξτε ένα στοιχεία πριν χρησιμοποιήσετε τον διαχειριστή μορφοποίησης',
    layer: 'Επίπεδο',
    fileButton: 'Εικόνες',
    sectors: {
      general: 'Γενικά',
      layout: 'Δομή',
      typography: 'Τυπογραφία',
      decorations: 'Μορφοποίηση',
      extra: 'Επιπρόσθετα',
      flex: 'Φλεξ',
      dimension: 'Διάσταση',
    },
    // Η βασική βιβλιοθήκη παράγει το όνομα από την δικού του `ιδιότητα` name
    properties: {
      // float: 'Float',
    },
  },
  traitManager: {
    empty: 'Επιλέξτε ένα στοιχεία πριν χρησιμοποιήσετε τον Διαχειριστή Χαρακτηριστικών',
    label: 'Ρυθμίσεις Συστατικού',
    traits: {
      // Η βασική βιβλιοθήκη παράγει το όνομα από την δικού του `ιδιότητα` name
      labels: {
        // id: 'Id',
        // alt: 'Εναλλακτικό Κείμενο',
        // title: 'Τίτλος',
        // href: 'Href',
      },
      // Σε ένα απλό χαρακτηριστικό, όπως ένα πεδίο κείμενο, χρησιμοποιούνται στις ιδιότητες του πεδίου εισαγωγής
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'πχ. https://google.gr' },
      },
      // Σε χαρακτηριστικό όπως το select, αυτά χρησιμοποιούνται για την μετάφραση των ονομάτων των επιλογών
      options: {
        target: {
          false: 'Στο ίδιο παράθυρο',
          _blank: 'Σε νέο παράθυρο',
        },
      },
    },
  },
};
