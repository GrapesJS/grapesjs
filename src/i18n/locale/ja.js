const traitInputAttr = { placeholder: '例: ここにテキストを入力' };

export default {
    // 'key': 'value',
  assetManager: {
    addButton: '画像を追加する',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: '画像を選択する',
    uploadTitle: '画像をドロップするか、選択するにはクリックしてください。',
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
      '': 'Box',
      wrapper: 'Body',
      text: 'テキスト',
      comment: 'コメント',
      image: '画像',
      video: '動画',
      label: 'ラベル',
      link: 'リンク',
      map: 'マップ',
      tfoot: 'テーブルフッター',
      tbody: 'テーブルボディ',
      thead: 'テーブルヘッダー',
      table: 'テーブル',
      row: 'テーブル行',
      cell: 'テーブルセル',
    },
  },
  deviceManager: {
    device: 'デバイス',
    devices: {
      desktop: 'デスクトップ',
      tablet: 'タブレット',
      mobileLandscape: 'スマホ(横)',
      mobilePortrait: 'スマホ(縦)',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'プレビュー',
        fullscreen: '全画面',
        'sw-visibility': 'コンポーネントを見る',
        'export-template': 'コードを見る',
        'open-sm': 'スタイルマネージャを開く',
        'open-tm': 'コンポーネント設定',
        'open-layers': 'レイヤーマネージャを開く',
        'open-blocks': 'ブロック一覧を開く',
      },
    },
  },
  selectorManager: {
    label: 'Classes',
    selected: '選択中',
    emptyState: '- ステート -',
    states: {
      hover: 'ホバー時',
      active: 'クリック時',
      'nth-of-type(2n)': '偶数/奇数',
    },
  },
  styleManager: {
    empty: 'スタイルマネージャを使用するには、要素を選択してください',
    layer: 'レイヤー',
    fileButton: '画像',
    sectors: {
      general: '一般',
      layout: 'レイアウト',
      typography: '書式',
      decorations: '装飾',
      extra: 'エクストラ',
      flex: 'Flex',
      dimension: '寸法',
    },
    // Default names for sub properties in Composite and Stack types.
    // Other labels are generated directly from their property names (eg. 'font-size' will be 'Font size').
    properties: {
      'display': '表示(display)',
      'float': 'フロート(float)',
      'position': '位置指定(position)',
      'font-family': 'フォントの種類',
      'font-size': 'フォントの大きさ',
      'font-weight': 'フォントの太さ',
      'letter-spacing': 'フォントの大きさ',
      'color': '色',
      'line-height': '行の高さ',
      'text-align': '文字の並び方',
      'text-shadow':'文字の影',
      'width': '幅',
      'height': '高さ',
      'max-width': '最大の幅',
      'min-height' :'最小の高さ',
      'margin': 'マージン',
      'padding': 'パディング',
      'background-color': '背景色',
      'border-radius':'境界線の半径',
      'border': '境界線',
      'opacity': '透明度',
      'transition': '遷移',
      'transform': '変形',
      'text-shadow-h': '水平方向',
      'text-shadow-v': '垂直方向',
      'text-shadow-blur': 'ぼかし',
      'text-shadow-color': '色',
      'box-shadow-h': '水平方向',
      'box-shadow-v': '垂直方向',
      'box-shadow-blur': 'ぼかし',
      'box-shadow-spread': '広がり',
      'box-shadow-color': '色',
      'box-shadow-type': 'タイプ',
      'margin-top-sub': '上',
      'margin-right-sub': '右',
      'margin-bottom-sub': '下',
      'margin-left-sub': '左',
      'padding-top-sub': '上',
      'padding-right-sub': '右',
      'padding-bottom-sub': '下',
      'padding-left-sub': '左',
      'border-width-sub': '幅',
      'border-style-sub': 'スタイル',
      'border-color-sub': '色',
      'border-top-left-radius-sub': '左上',
      'border-top-right-radius-sub': '右上',
      'border-bottom-right-radius-sub': '右下',
      'border-bottom-left-radius-sub': '左下',
      'transform-rotate-x': 'X軸を回転',
      'transform-rotate-y': 'Y軸を回転',
      'transform-rotate-z': 'Z軸を回転',
      'transform-scale-x': 'X軸のスケール',
      'transform-scale-y': 'Y軸のスケール',
      'transform-scale-z': 'Z軸のスケール',
      'transition-property-sub': 'プロパティ',
      'transition-duration-sub': '持続時間',
      'transition-timing-function-sub': 'タイミング',
      'background-image-sub': '画像',
      'background-repeat-sub': '繰り返し',
      'background-position-sub': '位置',
      'background-attachment-sub': 'アタッチメント',
      'background-size-sub': 'サイズ',
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
    empty: 'トレイトマネージャを使用するには要素を選択してください',
    label: 'コンポーネント設定',
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
        href: { placeholder: '例. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: '同じウィンドウ',
          _blank: '新しいウィンドウ',
        },
      },
    },
  },
  storageManager: {
    recover: '保存されていない変更を復元しますか?',
  },

};