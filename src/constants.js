// The link components reference name, ie. the block's name and the component's name
export const reactLinkRef = 'react-link';
export const abstractRef = 'abstract';
export const sectionRef = 'section';
export const containerRef = 'container';
export const columnRef = 'column';
export const columnsRef = 'columns';
export const listRef = 'list';
export const listItemRef = 'list-item';
export const buttonRef = 'button';
export const headingRef = 'heading';
export const paragraphRef = 'paragraph';
export const blockQuoteRef = 'blockquote';
export const imageRef = 'kreebox-image';
export const eventCountdownRef = 'event-countdown';
export const formRef = 'formX';
export const formTextRef = 'formXText';
export const formTextAreaRef = 'formXTextarea';
export const formCheckboxRef = 'formXCheckbox';
export const formCheckboxFieldRef = 'formXCheckboxField';
export const formSelectRef = 'formXSelect';
export const formRadioRef = 'formXRadio';
export const formRadioFieldRef = 'formXRadioField';
export const formSubmitRef = 'formXSubmit';
export const embedRef = 'embed';
export const embedFacebookRef = 'facebook';
export const embedIframeRef = 'iframex';
export const embedVimeoRef = 'vimeo';
export const embedYoutubeRef = 'youtube';
export const embedCalendarRef = 'calendar';
export const textRef = 'textX';
export const linkRef = 'linkX';
export const dynamicListRef = 'dynamicList';
export const dynamicItemRef = 'dynamicItem';
export const cmsPostListRef = 'cmsPostList';
export const cmsPostItemRef = 'cmsPostItem';
export const categoriesRef = 'categories';
export const tagCloudRef = 'tagCloud';
export const tagItemRef = 'tagItem';
export const relatedPostsRef = 'relatedPosts';
export const componentRef = 'component';
export const customCodeRef = 'customCode';
export const carouselRef = 'carousel';
export const carouselIndicatorsRef = 'carouselIndicators';
export const carouselIndicatorItemRef = 'carouselIndicatorItem';
export const carouselInnerRef = 'carouselInner';
export const carouselItemRef = 'carouselItem';
export const carouselControlRef = 'carouselControl';
export const tabsRef = 'tabs';
export const tabMenuRef = 'tabMenu';
export const tabLinkRef = 'tabLink';
export const tabContentRef = 'tabContent';
export const tabPaneRef = 'tabPane';
export const navRef = 'nav';
export const adsenseRef = 'adsense';
export const searchRef = 'search';
export const searchInputRef = 'searchInput';
export const searchButtonRef = 'searchButton';
export const searchItemListRef = 'searchItemList';
export const searchItemRef = 'searchItem';

// Commands
export const openQuickSettings = 'open-quick-settings';
export const showSpacing = 'show-spacing';

export const allBlocks = {
  [reactLinkRef]: {
    icon: stylePrefix =>
      `<div class="${stylePrefix}"><i class="fa fa-link"></i></div>`,
    keyword: 'React Link Block'
  },
  [sectionRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path class="${stylePrefix}block-svg-path" d="M24 20.1991H0V18.201H24V20.1991Z"/>
    <path class="${stylePrefix}block-svg-path" d="M0.200989 3.80103H5.24999V5.79903H2.19899V8.40003H0.200989V3.80103ZM7.94999 3.80103H16.05V5.79903H7.94999V3.80103ZM18.75 3.80103H23.799V8.40003H21.801V5.79903H18.75V3.80103ZM0.200989 10.8H2.19899V13.401H5.24999V15.399H0.200989V10.8ZM23.799 10.8V15.399H18.75V13.401H21.801V10.8H23.799ZM16.05 15.399H7.94999V13.401H16.05V15.399Z"/>
    </svg>`,
    keyword: 'Section'
  },
  [containerRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path class="${stylePrefix}block-svg-path" d="M0.800995 2.00098H5.62499V3.99898H2.79899V6.37498H0.800995V2.00098ZM8.17499 2.00098H15.825V3.99898H8.17499V2.00098ZM18.375 2.00098H23.199V6.37498H21.201V3.99898H18.375V2.00098ZM0.800995 15.375V8.62498H2.79899V15.375H0.800995ZM23.199 8.62498V15.375H21.201V8.62498H23.199ZM0.800995 17.625H2.79899V20.001H5.62499V21.999H0.800995V17.625ZM23.199 17.625V21.999H18.375V20.001H21.201V17.625H23.199ZM15.825 21.999H8.17499V20.001H15.825V21.999Z"/>
    </svg>`,
    keyword: 'Container'
  },
  [columnsRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path class="${stylePrefix}block-svg-path" d="M12.801 0.801025H16.95V2.79903H14.799V5.62503H12.801V0.801025ZM19.05 0.801025H23.199V5.62503H21.201V2.79903H19.05V0.801025ZM12.801 15.825V8.17502H14.799V15.825H12.801ZM23.199 8.17502V15.825H21.201V8.17502H23.199ZM12.801 18.375H14.799V21.201H16.95V23.199H12.801V18.375ZM23.199 18.375V23.199H19.05V21.201H21.201V18.375H23.199Z"/>
    <path class="${stylePrefix}block-svg-path" d="M0.801025 0.801025H4.95003V2.79903H2.79903V5.62503H0.801025V0.801025ZM7.05002 0.801025H11.199V5.62503H9.20103V2.79903H7.05002V0.801025ZM0.801025 15.825V8.17502H2.79903V15.825H0.801025ZM11.199 8.17502V15.825H9.20103V8.17502H11.199ZM0.801025 18.375H2.79903V21.201H4.95003V23.199H0.801025V18.375ZM11.199 18.375V23.199H7.05002V21.201H9.20103V18.375H11.199Z"/>
    </svg>`,
    keyword: 'Column'
  },
  [listRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path class="${stylePrefix}block-svg-path" d="M24 18.1801H4.19995V20.1601H24V18.1801Z"/>
    <path class="${stylePrefix}block-svg-path" d="M2.4 18.1801H0V20.1601H2.4V18.1801Z"/>
    <path class="${stylePrefix}block-svg-path" d="M24 13.38H4.19995V15.36H24V13.38Z"/>
    <path class="${stylePrefix}block-svg-path" d="M2.4 13.38H0V15.36H2.4V13.38Z"/>
    <path class="${stylePrefix}block-svg-path" d="M24 8.58008H4.19995V10.5601H24V8.58008Z"/>
    <path class="${stylePrefix}block-svg-path" d="M2.4 8.58008H0V10.5601H2.4V8.58008Z"/>
    <path class="${stylePrefix}block-svg-path" d="M24 3.78003H4.19995V5.76003H24V3.78003Z"/>
    <path class="${stylePrefix}block-svg-path" d="M2.4 3.78003H0V5.76003H2.4V3.78003Z"/>
    </svg>`,
    keyword: 'List'
  },
  [listItemRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M10.998 10.998V13.602H22.002V10.998H10.998ZM10.2 9C9.53726 9 9 9.53726 9 10.2V14.4C9 15.0627 9.53726 15.6 10.2 15.6H22.8C23.4627 15.6 24 15.0627 24 14.4V10.2C24 9.53726 23.4627 9 22.8 9H10.2Z"/>
      <path class="${stylePrefix}block-svg-path" d="M1.998 10.998V13.602H4.602V10.998H1.998ZM1.2 9C0.537258 9 0 9.53726 0 10.2V14.4C0 15.0627 0.537258 15.6 1.2 15.6H5.4C6.06274 15.6 6.6 15.0627 6.6 14.4V10.2C6.6 9.53726 6.06274 9 5.4 9H1.2Z"/>
    </svg>`,
    keyword: 'List Item'
  },
  [linkRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M3.18005 3.42004C1.50005 3.42004 0.180054 4.74004 0.180054 6.42004V12C0.180054 13.68 1.50005 15 3.18005 15H12.6601L12.2401 13.02H3.18005C2.64005 13.02 2.16005 12.6 2.16005 12V6.42004C2.22005 5.88004 2.64005 5.40004 3.18005 5.40004H20.7601C21.3001 5.40004 21.7801 5.82004 21.7801 6.42004V11.1L23.7601 12.3C23.7601 12.18 23.7601 12.12 23.7601 12V6.42004C23.7601 4.74004 22.4401 3.42004 20.7601 3.42004H3.18005Z"/>
      <path class="${stylePrefix}block-svg-path" d="M16.38 20.5801C16.32 20.5801 16.26 20.5801 16.2 20.5801C15.78 20.5201 15.42 20.1601 15.36 19.7401L13.44 10.2001C13.38 9.78007 13.5 9.36007 13.86 9.12007C14.22 8.88007 14.64 8.88007 15 9.06007L22.98 13.8601C23.34 14.1001 23.52 14.4601 23.46 14.8801C23.4 15.3001 23.1 15.6601 22.74 15.7801L19.26 16.9201L17.22 20.1001C17.1 20.4001 16.74 20.5801 16.38 20.5801ZM15.84 11.8201L16.86 16.9801L18 15.1801L18.36 15.0601L20.22 14.4601L15.84 11.8201Z"/>
    </svg>`,
    keyword: 'Link'
  },
  [buttonRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M3.18005 3.42004C1.50005 3.42004 0.180054 4.74004 0.180054 6.42004V12C0.180054 13.68 1.50005 15 3.18005 15H12.6601L12.2401 13.02H3.18005C2.64005 13.02 2.16005 12.6 2.16005 12V6.42004C2.22005 5.88004 2.64005 5.40004 3.18005 5.40004H20.7601C21.3001 5.40004 21.7801 5.82004 21.7801 6.42004V11.1L23.7601 12.3C23.7601 12.18 23.7601 12.12 23.7601 12V6.42004C23.7601 4.74004 22.4401 3.42004 20.7601 3.42004H3.18005Z"/>
      <path class="${stylePrefix}block-svg-path" d="M16.38 20.5801C16.32 20.5801 16.26 20.5801 16.2 20.5801C15.78 20.5201 15.42 20.1601 15.36 19.7401L13.44 10.2001C13.38 9.78007 13.5 9.36007 13.86 9.12007C14.22 8.88007 14.64 8.88007 15 9.06007L22.98 13.8601C23.34 14.1001 23.52 14.4601 23.46 14.8801C23.4 15.3001 23.1 15.6601 22.74 15.7801L19.26 16.9201L17.22 20.1001C17.1 20.4001 16.74 20.5801 16.38 20.5801ZM15.84 11.8201L16.86 16.9801L18 15.1801L18.36 15.0601L20.22 14.4601L15.84 11.8201Z"/>
    </svg>`,
    keyword: 'Button'
  },
  [headingRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M7.92005 20.8801H6.66005C6.42005 20.8801 6.30005 20.7601 6.30005 20.5201V3.54005C6.30005 3.30005 6.42005 3.18005 6.66005 3.18005H7.92005C8.16005 3.18005 8.28005 3.30005 8.28005 3.54005V10.8001C8.28005 10.9801 8.40005 11.0401 8.58005 11.0401H15.4201C15.6001 11.0401 15.7201 10.9801 15.7201 10.8001V3.54005C15.7201 3.30005 15.84 3.18005 16.08 3.18005H17.34C17.5801 3.18005 17.7001 3.30005 17.7001 3.54005V20.5201C17.7001 20.7601 17.5801 20.8801 17.34 20.8801H16.08C15.84 20.8801 15.7201 20.7601 15.7201 20.5201V13.0201C15.7201 12.8401 15.6001 12.7801 15.4201 12.7801H8.58005C8.40005 12.7801 8.28005 12.8401 8.28005 13.0201V20.4601C8.28005 20.7601 8.16005 20.8801 7.92005 20.8801Z"/>
    </svg>`,
    keyword: 'Heading'
  },
  [paragraphRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M16.2 18.1801H0V20.1601H16.2V18.1801Z"/>
      <path class="${stylePrefix}block-svg-path" d="M24 13.38H0V15.36H24V13.38Z"/>
      <path class="${stylePrefix}block-svg-path" d="M24 8.58008H0V10.5601H24V8.58008Z"/>
      <path class="${stylePrefix}block-svg-path" d="M24 3.78003H0V5.76003H24V3.78003Z"/>
    </svg>`,
    keyword: 'Paragraph'
  },
  [blockQuoteRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M15 18H0V19.98H15V18Z"/>
      <path class="${stylePrefix}block-svg-path" d="M18.9 16.2V16.74C18.9 17.1 18.78 17.58 18.48 18.18L17.52 19.98C17.46 20.1 17.34 20.16 17.16 20.16C16.98 20.16 16.86 20.04 16.86 19.8V16.2C16.86 15.96 16.98 15.84 17.22 15.84H18.54C18.78 15.84 18.9 15.96 18.9 16.2ZM21.78 16.2V16.74C21.78 17.1 21.66 17.58 21.36 18.18L20.4 19.98C20.34 20.1 20.22 20.16 20.04 20.16C19.86 20.16 19.74 20.04 19.74 19.8V16.2C19.74 15.96 19.86 15.84 20.1 15.84H21.42C21.66 15.84 21.78 15.96 21.78 16.2Z"/>
      <path class="${stylePrefix}block-svg-path" d="M24 12H0V13.98H24V12Z"/>
      <path class="${stylePrefix}block-svg-path" d="M22.8 6H7.80005V7.98H22.8V6Z"/>
      <path class="${stylePrefix}block-svg-path" d="M3.60003 7.79996V7.25997C3.60003 6.83997 3.72003 6.35997 4.02003 5.81997L4.98003 4.01997C5.04003 3.89997 5.16003 3.83997 5.28003 3.83997C5.52003 3.83997 5.58003 3.95997 5.58003 4.19997V7.79996C5.58003 8.03996 5.46003 8.15997 5.22003 8.15997H3.96003C3.72003 8.15997 3.60003 8.03996 3.60003 7.79996ZM0.660034 7.79996V7.25997C0.660034 6.83997 0.780034 6.35997 1.08003 5.81997L2.04003 4.01997C2.10003 3.89997 2.22003 3.83997 2.34003 3.83997C2.58003 3.83997 2.64003 3.95997 2.64003 4.19997V7.79996C2.64003 8.03996 2.52003 8.15997 2.28003 8.15997H1.02003C0.780034 8.15997 0.660034 8.03996 0.660034 7.79996Z"/>
    </svg>`,
    keyword: 'Block Quote'
  },
  [imageRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M3.19795 3C2.09449 3 1.19995 3.89453 1.19995 4.998V19.002C1.19995 20.1055 2.09449 21 3.19795 21H20.8019C21.9054 21 22.7999 20.1055 22.7999 19.002V4.998C22.7999 3.89453 21.9054 3 20.8019 3H3.19795ZM3.37141 17.5851L8.86045 11.8507C9.09589 11.6047 9.48871 11.6038 9.72535 11.8487L13.6766 15.938C13.9124 16.1822 14.3037 16.1822 14.5396 15.938L16.3522 14.062C16.5881 13.8178 16.9794 13.8178 17.2152 14.062L20.6174 17.5831C20.9854 17.9639 20.7155 18.6 20.1859 18.6H3.80484C3.2766 18.6 3.00614 17.9667 3.37141 17.5851Z"/>
    </svg>`,
    keyword: 'Image'
  },
  [eventCountdownRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M0.201172 6.79778C0.201172 5.14258 1.54297 3.80078 3.19817 3.80078H20.8022C22.4574 3.80078 23.7992 5.14258 23.7992 6.79778V20.8018C23.7992 22.457 22.4574 23.7988 20.8022 23.7988H3.19817C1.54298 23.7988 0.201172 22.457 0.201172 20.8018V6.79778ZM3.19817 5.79878C2.64644 5.79878 2.19917 6.24605 2.19917 6.79778V20.8018C2.19917 21.3535 2.64644 21.8008 3.19817 21.8008H20.8022C21.3539 21.8008 21.8012 21.3535 21.8012 20.8018V6.79778C21.8012 6.24605 21.3539 5.79878 20.8022 5.79878H3.19817Z"/>
      <path class="${stylePrefix}block-svg-path" d="M6.99898 0.599609V4.19961H5.00098V0.599609H6.99898Z"/>
      <path class="${stylePrefix}block-svg-path" d="M18.999 0.599609V4.19961H17.001V0.599609H18.999Z"/>
      <path class="${stylePrefix}block-svg-path" d="M1.2002 4.7998H22.8002V10.1998H1.2002V4.7998Z"/>
      <path class="${stylePrefix}block-svg-path" d="M15.5996 15H19.7996V19.2H15.5996V15Z"/>
    </svg>`,
    keyword: 'Event Countdown'
  },
  [formRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0)">
        <path class="${stylePrefix}block-svg-path" d="M0 18.7978C0 17.6943 0.894535 16.7998 1.998 16.7998H10.002C11.1055 16.7998 12 17.6943 12 18.7978V19.6018C12 20.7053 11.1055 21.5998 10.002 21.5998H1.998C0.894535 21.5998 0 20.7053 0 19.6018V18.7978Z"/>
        <path class="${stylePrefix}block-svg-path" d="M1.998 8.59761V13.0016H22.002V8.59761H1.998ZM1.2 6.59961C0.537258 6.59961 0 7.13687 0 7.79961V13.7996C0 14.4624 0.537259 14.9996 1.2 14.9996H22.8C23.4627 14.9996 24 14.4624 24 13.7996V7.79961C24 7.13687 23.4627 6.59961 22.8 6.59961H1.2Z"/>
        <path class="${stylePrefix}block-svg-path" d="M18 4.59859H0L0 2.60059H18V4.59859Z"/>
      </g>
    </svg>`,
    keyword: 'Form'
  },
  [formTextRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M20.8197 19.0205H3.17969C1.49969 19.0205 0.179688 17.7005 0.179688 16.0205V7.98047C0.179688 6.30047 1.49969 4.98047 3.17969 4.98047H20.7597C22.4397 4.98047 23.7597 6.30047 23.7597 7.98047V15.9605C23.8197 17.6405 22.4397 19.0205 20.8197 19.0205ZM3.17969 7.02047C2.63969 7.02047 2.15969 7.44047 2.15969 8.04047V16.0205C2.15969 16.5605 2.57969 17.0405 3.17969 17.0405H20.7597C21.2997 17.0405 21.7797 16.6205 21.7797 16.0205V7.98047C21.7797 7.44047 21.3597 6.96047 20.7597 6.96047H3.17969V7.02047Z"/>
      <path class="${stylePrefix}block-svg-path" d="M5.7593 8.40039H3.7793V15.6004H5.7593V8.40039Z"/>
    </svg>`,
    keyword: 'Text Field'
  },
  [formTextAreaRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M20.8197 22.0205H3.17969C1.49969 22.0205 0.179688 20.7005 0.179688 19.0205V4.98047C0.179688 3.30047 1.49969 1.98047 3.17969 1.98047H20.7597C22.4397 1.98047 23.7597 3.30047 23.7597 4.98047V18.9605C23.8197 20.6405 22.4397 22.0205 20.8197 22.0205ZM3.17969 4.02047C2.63969 4.02047 2.15969 4.44047 2.15969 5.04047V19.0205C2.15969 19.5605 2.57969 20.0405 3.17969 20.0405H20.7597C21.2997 20.0405 21.7797 19.6205 21.7797 19.0205V4.98047C21.7797 4.44047 21.3597 3.96047 20.7597 3.96047H3.17969V4.02047Z"/>
      <path class="${stylePrefix}block-svg-path" d="M20.6058 16.3454L18.1875 18.7637L19.036 19.6122L21.4543 17.1939L20.6058 16.3454Z"/>
      <path class="${stylePrefix}block-svg-path" d="M20.5446 12.807L14.5625 18.7891L15.411 19.6376L21.3931 13.6555L20.5446 12.807Z"/>
      <path class="${stylePrefix}block-svg-path" d="M5.7593 5.40039H3.7793V12.0004H5.7593V5.40039Z"/>
    </svg>`,
    keyword: 'Text Area'
  },
  [formCheckboxFieldRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M32.7 37.6998H7.29999C4.49999 37.6998 2.29999 35.4998 2.29999 32.6998V7.2998C2.29999 4.4998 4.49999 2.2998 7.29999 2.2998H32.6C35.4 2.2998 37.6 4.4998 37.6 7.2998V32.5998C37.7 35.3998 35.4 37.6998 32.7 37.6998ZM7.29999 5.6998C6.39999 5.6998 5.59999 6.39981 5.59999 7.39981V32.6998C5.59999 33.5998 6.29999 34.3998 7.29999 34.3998H32.6C33.5 34.3998 34.3 33.6998 34.3 32.6998V7.2998C34.3 6.3998 33.6 5.5998 32.6 5.5998H7.29999V5.6998Z"/>
      <path class="${stylePrefix}block-svg-path" d="M16.5 29.3998L7.79999 20.6998L10.2 18.2998L16.5 24.5998L30.3 10.7998L32.7 13.1998L16.5 29.3998Z"/>
    </svg>`,
    keyword: 'Checkbox'
  },
  [formSelectRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M20.8197 19.0205H3.17969C1.49969 19.0205 0.179688 17.7005 0.179688 16.0205V7.98047C0.179688 6.30047 1.49969 4.98047 3.17969 4.98047H20.7597C22.4397 4.98047 23.7597 6.30047 23.7597 7.98047V15.9605C23.8197 17.6405 22.4397 19.0205 20.8197 19.0205ZM3.17969 7.02047C2.63969 7.02047 2.15969 7.44047 2.15969 8.04047V16.0205C2.15969 16.5605 2.57969 17.0405 3.17969 17.0405H20.7597C21.2997 17.0405 21.7797 16.6205 21.7797 16.0205V7.98047C21.7797 7.44047 21.3597 6.96047 20.7597 6.96047H3.17969V7.02047Z"/>
      <path class="${stylePrefix}block-svg-path" d="M11.9996 10.9805H3.59961V12.9605H11.9996V10.9805Z"/>
      <path class="${stylePrefix}block-svg-path" d="M19.8 10.8008H15L17.4 13.2008L19.8 10.8008Z"/>
    </svg>`,
    keyword: 'Select Dropdown'
  },
  [formRadioFieldRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M11.9999 22.6199C6.17988 22.6199 1.37988 17.8799 1.37988 11.9999C1.37988 6.17988 6.11988 1.37988 11.9999 1.37988C17.8199 1.37988 22.6199 6.11988 22.6199 11.9999C22.6199 17.8199 17.8199 22.6199 11.9999 22.6199ZM11.9999 3.41988C7.25988 3.41988 3.41988 7.25988 3.41988 11.9999C3.41988 16.7399 7.25988 20.5799 11.9999 20.5799C16.7399 20.5799 20.5799 16.7399 20.5799 11.9999C20.5799 7.25988 16.7399 3.41988 11.9999 3.41988Z"/>
      <path class="${stylePrefix}block-svg-path" d="M12 6C15.3 6 18 8.7 18 12C18 15.3 15.3 18 12 18C8.7 18 6 15.3 6 12C6 8.7 8.7 6 12 6Z"/>
    </svg>`,
    keyword: 'Radio Button'
  },
  [formSubmitRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M20.8197 18.7203H3.17969C1.49969 18.7203 0.179688 17.4003 0.179688 15.7203V8.28027C0.179688 6.60027 1.49969 5.28027 3.17969 5.28027H20.7597C22.4397 5.28027 23.7597 6.60027 23.7597 8.28027V15.6603C23.8197 17.3403 22.4397 18.7203 20.8197 18.7203ZM3.17969 7.32027C2.63969 7.32027 2.15969 7.74027 2.15969 8.34027V15.7203C2.15969 16.2603 2.57969 16.7403 3.17969 16.7403H20.7597C21.2997 16.7403 21.7797 16.3203 21.7797 15.7203V8.28027C21.7797 7.74027 21.3597 7.26027 20.7597 7.26027H3.17969V7.32027Z"/>
      <path class="${stylePrefix}block-svg-path" d="M8.94039 15.4802L15.9604 12.4802C16.2604 12.3602 16.2604 11.8802 15.9604 11.7602L8.94039 8.76024C8.70039 8.64024 8.40039 8.82024 8.40039 9.12024V10.9802C8.40039 11.1602 8.52039 11.3402 8.76039 11.4002L14.4004 12.1802L8.76039 12.9602C8.58039 12.9602 8.40039 13.1402 8.40039 13.3802V15.2402C8.40039 15.3602 8.70039 15.6002 8.94039 15.4802Z"/>
    </svg>`,
    keyword: 'Form Button'
  },
  [embedFacebookRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M20 2.00098C29.9411 2.00098 38 10.0599 38 20.001C38 28.9853 31.4177 36.432 22.8125 37.7822V25.2041H27.0066L27.8047 20.001H22.8125V16.6245C22.8125 16.4465 22.8234 16.2692 22.8468 16.095C23.0109 14.8758 23.7893 13.8135 25.7458 13.8135H28.0156V9.38379C28.0156 9.38379 27.8869 9.36182 27.663 9.32886C26.9913 9.22998 25.4634 9.03223 23.9863 9.03223C19.8748 9.03223 17.1875 11.5241 17.1875 16.0354V20.001H12.6172V25.2041H17.1875V37.7822C8.58234 36.432 2 28.9853 2 20.001C2 10.0599 10.0589 2.00098 20 2.00098Z"/>
    </svg>`,
    keyword: 'Facebook'
  },
  [embedVimeoRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" class="${stylePrefix}block-svg-path" d="M17 0C7.6112 0 0 7.6112 0 17C0 26.3888 7.6112 34 17 34C26.3888 34 34 26.3888 34 17C34 7.6112 26.3888 0 17 0ZM22.7002 21.0231C24.6103 18.5727 25.8499 16.5002 26.418 14.8057C26.6876 13.8995 26.7789 13.3529 26.7795 12.3176C26.691 10.2074 25.722 9.1244 23.8725 9.0703C21.1024 8.9818 19.2258 10.5394 18.2437 13.7482C18.7512 13.5309 19.2447 13.421 19.7226 13.421C20.74 13.421 21.1885 13.9908 21.0688 15.1279C21.0081 15.8173 20.5597 16.82 19.7226 18.1382C18.8848 19.4557 18.2568 20.114 17.8387 20.114C17.2993 20.114 16.8066 19.0999 16.3582 17.0676C16.2073 16.4724 15.9384 14.9492 15.5498 12.5012C15.1907 10.2312 14.2332 9.1712 12.678 9.3204C12.0197 9.3802 11.0319 9.9762 9.7169 11.11C8.7513 11.9818 7.7789 12.8462 6.80001 13.7031L7.7412 14.9115C8.6372 14.2868 9.1602 13.9728 9.3094 13.9728C9.9956 13.9728 10.6367 15.0459 11.2352 17.1897L12.8469 23.0882C13.652 25.2337 14.639 26.3051 15.8031 26.3051C17.6838 26.3051 19.9825 24.5442 22.7002 21.0231Z"/>
    </svg>`,
    keyword: 'Vimeo'
  },
  [embedYoutubeRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M35.2 1.20039C36.9 1.70039 38.2 3.00039 38.6 4.60039C39.4 7.60039 39.4 14.0004 39.4 14.0004C39.4 14.0004 39.4 20.3004 38.6 23.4004C38.1 25.1004 36.8 26.4004 35.2 26.8004C32.2 27.6004 20 27.6004 20 27.6004C20 27.6004 7.80001 27.6004 4.80001 26.8004C3.10001 26.3004 1.80001 25.0004 1.40001 23.4004C0.600006 20.4004 0.600006 14.0004 0.600006 14.0004C0.600006 14.0004 0.600006 7.70039 1.40001 4.60039C1.90001 2.90039 3.20001 1.60039 4.80001 1.20039C7.80001 0.40039 20 0.400391 20 0.400391C20 0.400391 32.2 0.40039 35.2 1.20039ZM26.2 14.0004L16.1 19.9004V8.20039L26.2 14.0004Z"/>
    </svg>`,
    keyword: 'Youtube'
  },
  [embedCalendarRef]: {
    icon: stylePrefix => `      
    <svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M0.334991 11.33C0.334991 8.5713 2.57133 6.33496 5.32999 6.33496H34.67C37.4287 6.33496 39.665 8.5713 39.665 11.33V34.67C39.665 37.4286 37.4287 39.665 34.67 39.665H5.32999C2.57133 39.665 0.334991 37.4286 0.334991 34.67V11.33ZM5.32999 9.66496C4.41044 9.66496 3.66499 10.4104 3.66499 11.33V34.67C3.66499 35.5895 4.41044 36.335 5.32999 36.335H34.67C35.5895 36.335 36.335 35.5895 36.335 34.67V11.33C36.335 10.4104 35.5895 9.66496 34.67 9.66496H5.32999Z"/>
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M11.665 1V7H8.33499V1H11.665Z"/>
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M31.665 1V7H28.335V1H31.665Z"/>
      <path class="${stylePrefix}block-svg-path" d="M13.0943 21.625H14.7486C15.5363 21.625 16.12 21.4281 16.4995 21.0342C16.8791 20.6403 17.0689 20.1175 17.0689 19.4658C17.0689 18.8356 16.8791 18.3451 16.4995 17.9941C16.1271 17.6432 15.6115 17.4678 14.9527 17.4678C14.3583 17.4678 13.8605 17.6325 13.4595 17.9619C13.0585 18.2842 12.8579 18.7067 12.8579 19.2295H9.75345C9.75345 18.4131 9.97187 17.6826 10.4087 17.0381C10.8527 16.3864 11.4686 15.8779 12.2564 15.5127C13.0513 15.1475 13.925 14.9648 14.8775 14.9648C16.5318 14.9648 17.828 15.3623 18.7661 16.1572C19.7043 16.945 20.1734 18.0335 20.1734 19.4229C20.1734 20.139 19.9549 20.7979 19.5181 21.3994C19.0812 22.001 18.5083 22.4629 17.7993 22.7852C18.6802 23.1003 19.3355 23.5729 19.7652 24.2031C20.202 24.8333 20.4204 25.5781 20.4204 26.4375C20.4204 27.8268 19.912 28.9404 18.8951 29.7783C17.8853 30.6162 16.5461 31.0352 14.8775 31.0352C13.3163 31.0352 12.038 30.6234 11.0425 29.7998C10.0542 28.9762 9.56009 27.8877 9.56009 26.5342H12.6646C12.6646 27.1214 12.883 27.6012 13.3199 27.9736C13.7639 28.346 14.3081 28.5322 14.9527 28.5322C15.6903 28.5322 16.2668 28.3389 16.6822 27.9521C17.1047 27.5583 17.3159 27.0391 17.3159 26.3945C17.3159 24.8333 16.4566 24.0527 14.7378 24.0527H13.0943V21.625Z"/>
      <path class="${stylePrefix}block-svg-path" d="M30.4399 30.8203H27.3354V18.8535L23.6293 20.0029V17.4785L30.1069 15.1582H30.4399V30.8203Z"/>
    </svg>`,
    keyword: 'Google Calendar'
  },
  [textRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path class="${stylePrefix}block-svg-path" d="M2.5 5.5C2.5 6.33 3.17 7 4 7h3.5v10.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V7H14c.83 0 1.5-.67 1.5-1.5S14.83 4 14 4H4c-.83 0-1.5.67-1.5 1.5zM20 9h-6c-.83 0-1.5.67-1.5 1.5S13.17 12 14 12h1.5v5.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12H20c.83 0 1.5-.67 1.5-1.5S20.83 9 20 9z"/>
    </svg>`,
    keyword: 'Text'
  },
  [categoriesRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M0.201172 4.99798C0.201172 3.34278 1.54297 2.00098 3.19817 2.00098H20.8022C22.4574 2.00098 23.7992 3.34278 23.7992 4.99798V19.002C23.7992 20.6572 22.4574 21.999 20.8022 21.999H3.19817C1.54298 21.999 0.201172 20.6572 0.201172 19.002V4.99798ZM3.19817 3.99898C2.64644 3.99898 2.19917 4.44624 2.19917 4.99798V19.002C2.19917 19.5537 2.64644 20.001 3.19817 20.001H20.8022C21.3539 20.001 21.8012 19.5537 21.8012 19.002V4.99798C21.8012 4.44624 21.3539 3.99898 20.8022 3.99898H3.19817Z"/>
      <path class="${stylePrefix}block-svg-path" d="M6.90039 7.59859H3.90039V5.60059H6.90039V7.59859Z"/>
      <path class="${stylePrefix}block-svg-path" d="M6.90039 12.999H3.90039V11.001H6.90039V12.999Z"/>
      <path class="${stylePrefix}block-svg-path" d="M6.90039 18.3994H3.90039V16.4014H6.90039V18.3994Z"/>
      <path class="${stylePrefix}block-svg-path" d="M13.5 7.59859H10.5V5.60059H13.5V7.59859Z"/>
      <path class="${stylePrefix}block-svg-path" d="M20.0996 7.59859H17.0996V5.60059H20.0996V7.59859Z"/>
      <path class="${stylePrefix}block-svg-path" d="M13.5 12.999H10.5V11.001H13.5V12.999Z"/>
      <path class="${stylePrefix}block-svg-path" d="M20.0996 12.999H17.0996V11.001H20.0996V12.999Z"/>
      <path class="${stylePrefix}block-svg-path" d="M13.5 18.3994H10.5V16.4014H13.5V18.3994Z"/>
      <path class="${stylePrefix}block-svg-path" d="M20.0996 18.3994H17.0996V16.4014H20.0996V18.3994Z"/>
      </svg>`,
    keyword: 'Categories'
  },
  [tagCloudRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M4.39909 4.1878C4.2799 4.18153 4.18153 4.2799 4.1878 4.39909L4.5404 11.0985C4.55337 11.3449 4.65711 11.5778 4.83162 11.7523L12.5991 19.5199C12.9893 19.91 13.6218 19.91 14.0119 19.5199L19.5199 14.0119C19.91 13.6218 19.91 12.9893 19.5199 12.5991L11.7523 4.83162C11.5778 4.65711 11.3449 4.55337 11.0985 4.5404L4.39909 4.1878ZM2.19256 4.5041C2.12393 3.20011 3.2001 2.12393 4.5041 2.19256L11.2035 2.54516C11.9428 2.58408 12.6416 2.89529 13.1651 3.41882L20.9327 11.1863C22.1031 12.3567 22.1031 14.2543 20.9327 15.4247L15.4247 20.9327C14.2543 22.1031 12.3567 22.1031 11.1863 20.9327L3.41882 13.1651C2.89529 12.6416 2.58408 11.9428 2.54516 11.2035L2.19256 4.5041Z"/>
      <path class="${stylePrefix}block-svg-path" d="M9.21289 7.47168C9.21289 8.30011 8.54132 8.97168 7.71289 8.97168C6.88446 8.97168 6.21289 8.30011 6.21289 7.47168C6.21289 6.64325 6.88446 5.97168 7.71289 5.97168C8.54132 5.97168 9.21289 6.64325 9.21289 7.47168Z"/>
    </svg>`,
    keyword: 'Tag cloud'
  },
  [cmsPostListRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M30.7 37.1994H9.3C6.5 37.1994 4.3 34.9994 4.3 32.1994V25.8994C4.3 23.0994 6.5 20.8994 9.3 20.8994H30.6C33.4 20.8994 35.6 23.0994 35.6 25.8994V32.1994C35.7 34.8994 33.4 37.1994 30.7 37.1994ZM9.3 24.1994C8.4 24.1994 7.6 24.8994 7.6 25.8994V32.1994C7.6 33.0994 8.3 33.8994 9.3 33.8994H30.6C31.5 33.8994 32.3 33.1994 32.3 32.1994V25.8994C32.3 24.9994 31.6 24.1994 30.6 24.1994H9.3Z" />
      <path class="${stylePrefix}block-svg-path" d="M12.5 31.5C13.8807 31.5 15 30.3807 15 29C15 27.6193 13.8807 26.5 12.5 26.5C11.1193 26.5 10 27.6193 10 29C10 30.3807 11.1193 31.5 12.5 31.5Z" />
      <path class="${stylePrefix}block-svg-path" d="M30.7 19.1998H9.3C6.5 19.1998 4.3 16.9998 4.3 14.1998V7.7998C4.3 4.9998 6.5 2.7998 9.3 2.7998H30.6C33.4 2.7998 35.6 4.9998 35.6 7.7998V14.0998C35.7 16.8998 33.4 19.1998 30.7 19.1998ZM9.3 6.1998C8.4 6.1998 7.6 6.89981 7.6 7.89981V14.1998C7.6 15.0998 8.3 15.8998 9.3 15.8998H30.6C31.5 15.8998 32.3 15.1998 32.3 14.1998V7.7998C32.3 6.8998 31.6 6.0998 30.6 6.0998H9.3V6.1998Z" />
      <path class="${stylePrefix}block-svg-path" d="M12.5 13.5C13.8807 13.5 15 12.3807 15 11C15 9.61929 13.8807 8.5 12.5 8.5C11.1193 8.5 10 9.61929 10 11C10 12.3807 11.1193 13.5 12.5 13.5Z" />
    </svg>`,
    keyword: 'Post List'
  },
  [customCodeRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 17">
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M6.91809 15.9873L15.3318 0.962891L17.0593 1.93032L8.64564 16.9548L6.91809 15.9873ZM5.88035 14.8199L0.360352 9.29992L5.88035 3.77992L7.32035 5.21992L3.24035 9.29992L7.32035 13.3799L5.88035 14.8199ZM18.1203 14.8199L16.6803 13.3799L20.7603 9.29992L16.6803 5.21992L18.1203 3.77992L23.6403 9.29992L18.1203 14.8199Z"/>
    </svg>`,
    keyword: 'Custom Code'
  },
  [carouselRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M6.77999 17.2199H17.22C18.84 17.2199 20.22 15.8399 20.16 14.1599V3.77991C20.16 2.09991 18.84 0.779907 17.16 0.779907H6.77999C5.09999 0.779907 3.77999 2.09991 3.77999 3.77991V14.2199C3.77999 15.8999 5.09999 17.2199 6.77999 17.2199ZM5.75999 3.83991C5.75999 3.23991 6.23999 2.81991 6.77999 2.81991V2.75991H17.16C17.76 2.75991 18.18 3.23991 18.18 3.77991V14.2199C18.18 14.8199 17.7 15.2399 17.16 15.2399H6.77999C6.17999 15.2399 5.75999 14.7599 5.75999 14.2199V3.83991ZM2.4 6.60002L0 9.00002L2.4 11.4V6.60002ZM21.6 6.60002L24 9.00002L21.6 11.4V6.60002Z"/>
    </svg>`,
    keyword: 'Carousel'
  },
  [adsenseRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M9.76077 5.3354C10.3639 4.30298 10.0058 2.98354 8.96096 2.38722C7.91569 1.79175 6.57954 2.14475 5.97636 3.17717C5.94978 3.22343 5.92477 3.27058 5.9014 3.31854L3.86226 6.80692C3.81714 6.87627 3.77539 6.94775 3.73717 7.02112L1.75651 10.4391C1.70826 10.5052 1.66321 10.5745 1.6217 10.6471C1.02153 11.6958 1.39037 13.0092 2.42965 13.615C3.46849 14.2203 4.82135 13.8343 5.4211 12.7852C5.4526 12.7301 5.48139 12.6739 5.50754 12.6175L7.51043 9.17292C7.55634 9.10407 7.59811 9.03255 7.63552 8.95873L9.67466 5.46992C9.70422 5.42622 9.73378 5.38167 9.76077 5.3354Z" />
      <path class="${stylePrefix}block-svg-path" d="M11.9482 5.81033C12.5014 5.66258 13.0906 5.74016 13.5867 6.02606C13.8322 6.16717 14.0474 6.35532 14.2201 6.57975C14.3928 6.80418 14.5195 7.06046 14.5929 7.33393C14.6664 7.60739 14.6852 7.89267 14.6482 8.1734C14.6112 8.45414 14.5193 8.72483 14.3775 8.96996L12.2176 12.7025C11.9302 13.1979 11.4581 13.5591 10.9048 13.7069C10.3515 13.8548 9.76214 13.7772 9.26596 13.4912C9.02042 13.3501 8.80513 13.162 8.63244 12.9376C8.45974 12.7132 8.33303 12.4569 8.25956 12.1834C8.1861 11.9099 8.16733 11.6246 8.20432 11.3439C8.24131 11.0631 8.33335 10.7924 8.47515 10.5473L10.6355 6.8143C10.923 6.31911 11.395 5.95809 11.9482 5.81033Z" />
    </svg>`,
    keyword: 'AdSense'
  },
  [tabsRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M20.8197 20.8197H3.17969C1.49969 20.8197 0.179688 19.4997 0.179688 17.8197V6.17969C0.179688 4.49969 1.49969 3.17969 3.17969 3.17969H9.35969V7.97969H23.7597V17.7597C23.8197 19.4397 22.4397 20.8197 20.8197 20.8197ZM3.17969 5.21969C2.63969 5.21969 2.15969 5.63969 2.15969 6.23969V17.8197C2.15969 18.3597 2.57969 18.8397 3.17969 18.8397H20.7597C21.2997 18.8397 21.7797 18.4197 21.7797 17.8197V10.0197H8.99969C8.09969 10.0197 7.37969 9.29969 7.37969 8.39969V5.21969H3.17969Z"/>
      <path class="${stylePrefix}block-svg-path" d="M23.8204 8.99969H21.8404V6.17969C21.8404 5.63969 21.4204 5.15969 20.8204 5.15969H8.40039V3.17969H20.8204C22.5004 3.17969 23.8204 4.49969 23.8204 6.17969V8.99969Z"/>
      <path class="${stylePrefix}block-svg-path" d="M16.5601 4.7998H14.5801V8.9998H16.5601V4.7998Z"/>
    </svg>`,
    keyword: 'Tabs'
  },
  [tabMenuRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M3.66502 19.33C3.66502 18.4104 4.41047 17.665 5.33002 17.665H12.335V23C12.335 24.4718 13.5282 25.665 15 25.665H37C38.4719 25.665 39.665 24.4718 39.665 23V19.33C39.665 16.5713 37.4287 14.335 34.67 14.335H5.33002C2.57136 14.335 0.335022 16.5713 0.335022 19.33V24C0.335022 24.9195 1.08047 25.665 2.00002 25.665C2.91958 25.665 3.66502 24.9195 3.66502 24V19.33ZM15.665 22.335V17.665H24.335V22.335H15.665ZM27.665 22.335H36.335V19.33C36.335 18.4104 35.5896 17.665 34.67 17.665H27.665V22.335Z" />
    </svg>`,
    keyword: 'Tab Menu'
  },
  [tabLinkRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M8.00002 21.665H24V18.335H8.00002V21.665Z"/>
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M5.33002 10.335C2.57136 10.335 0.335022 12.5713 0.335022 15.33V24.67C0.335022 27.4287 2.57136 29.665 5.33002 29.665H34.67C37.4287 29.665 39.665 27.4287 39.665 24.67V15.33C39.665 12.5713 37.4287 10.335 34.67 10.335H5.33002ZM3.66502 15.33C3.66502 14.4104 4.41047 13.665 5.33002 13.665H34.67C35.5896 13.665 36.335 14.4104 36.335 15.33V24.67C36.335 25.5895 35.5896 26.335 34.67 26.335H5.33002C4.41047 26.335 3.66502 25.5895 3.66502 24.67V15.33Z" />
    </svg>`,
    keyword: 'Tab Link'
  },
  [tabContentRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M0.335022 10.33C0.335022 7.57133 2.57136 5.33499 5.33002 5.33499H10.67C13.4287 5.33499 15.665 7.57133 15.665 10.33V13.335H34.67C37.4287 13.335 39.665 15.5713 39.665 18.33V29.67C39.665 32.4287 37.4287 34.665 34.67 34.665H5.33002C2.57136 34.665 0.335022 32.4287 0.335022 29.67V10.33ZM5.33002 8.66499C4.41047 8.66499 3.66502 9.41044 3.66502 10.33V29.67C3.66502 30.5895 4.41047 31.335 5.33002 31.335H34.67C35.5896 31.335 36.335 30.5895 36.335 29.67V18.33C36.335 17.4104 35.5896 16.665 34.67 16.665H15C13.5282 16.665 12.335 15.4718 12.335 14V10.33C12.335 9.41044 11.5896 8.66499 10.67 8.66499H5.33002Z" />
    </svg>`,
    keyword: 'Tab Content'
  },
  [tabPaneRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M26 24.665H9.00002V21.335H26V24.665Z" />
      <path class="${stylePrefix}block-svg-path" d="M9.00002 17.665H21V14.335H9.00002V17.665Z" />
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M0.335022 12.33C0.335022 9.57133 2.57136 7.33499 5.33002 7.33499H34.67C37.4287 7.33499 39.665 9.57133 39.665 12.33V27.67C39.665 30.4287 37.4287 32.665 34.67 32.665H5.33002C2.57136 32.665 0.335022 30.4287 0.335022 27.67V12.33ZM5.33002 10.665C4.41047 10.665 3.66502 11.4104 3.66502 12.33V27.67C3.66502 28.5895 4.41047 29.335 5.33002 29.335H34.67C35.5896 29.335 36.335 28.5895 36.335 27.67V12.33C36.335 11.4104 35.5896 10.665 34.67 10.665H5.33002Z" />
    </svg>`,
    keyword: 'Tab Pane'
  },
  [navRef]: {
    icon: stylePrefix => `<svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" d="M20.8197 17.8202H3.17969C1.49969 17.8202 0.179688 16.5002 0.179688 14.8202V9.24023C0.179688 7.56023 1.49969 6.24023 3.17969 6.24023H20.7597C22.4397 6.24023 23.7597 7.56023 23.7597 9.24023V14.8202C23.8197 16.4402 22.4397 17.8202 20.8197 17.8202ZM3.17969 8.22023C2.63969 8.22023 2.15969 8.64023 2.15969 9.24023V14.8202C2.15969 15.3602 2.57969 15.8402 3.17969 15.8402H20.7597C21.2997 15.8402 21.7797 15.4202 21.7797 14.8202V9.24023C21.7797 8.70023 21.3597 8.22023 20.7597 8.22023H3.17969Z"/>
      <path class="${stylePrefix}block-svg-path" d="M20.3992 10.9805H13.1992V12.9605H20.3992V10.9805Z"/>
      <path class="${stylePrefix}block-svg-path" d="M4.8598 13.9205V12.6005H5.8798V13.9205C5.8798 14.0405 5.9998 14.1605 6.1198 14.1605H6.8998C7.0198 14.1605 7.1398 14.0405 7.1398 13.9205V12.1205H7.5598C7.6798 12.1205 7.7398 12.0005 7.6198 11.8805L5.4598 9.90047C5.3398 9.84047 5.2198 9.84047 5.0998 9.90047L2.9398 11.8805C2.8798 11.9405 2.8798 12.1205 2.9998 12.1205H3.5998V13.9205C3.5998 14.0405 3.7198 14.1605 3.8398 14.1605H4.6198C4.7398 14.1605 4.8598 14.0405 4.8598 13.9205Z"/>
    </svg>`,
    keyword: 'Navbar'
  },
  [relatedPostsRef]: {
    icon: stylePrefix => `
  <svg class="${stylePrefix}block-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="${stylePrefix}block-svg-path" d="M0.201172 4.99798C0.201172 3.34278 1.54297 2.00098 3.19817 2.00098H20.8022C22.4574 2.00098 23.7992 3.34278 23.7992 4.99798V19.002C23.7992 20.6572 22.4574 21.999 20.8022 21.999H3.19817C1.54298 21.999 0.201172 20.6572 0.201172 19.002V4.99798ZM3.19817 3.99898C2.64644 3.99898 2.19917 4.44624 2.19917 4.99798V19.002C2.19917 19.5537 2.64644 20.001 3.19817 20.001H20.8022C21.3539 20.001 21.8012 19.5537 21.8012 19.002V4.99798C21.8012 4.44624 21.3539 3.99898 20.8022 3.99898H3.19817Z"/>
    <path class="${stylePrefix}block-svg-path" d="M6.20117 20.7V3H8.19917V20.7H6.20117Z"/>
    <path class="${stylePrefix}block-svg-path" d="M22.8002 9.99902L1.2002 9.99902L1.2002 8.00102L22.8002 8.00102L22.8002 9.99902Z"/>
    <path class="${stylePrefix}block-svg-path" d="M22.8002 15.999L1.2002 15.999L1.2002 14.001L22.8002 14.001L22.8002 15.999Z"/>
  </svg>`,
    keyword: 'Related post'
  },
  [searchRef]: {
    icon: stylePrefix => `
  <svg class="${stylePrefix}block-svg" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M10.4101 7.51023H1.59009C0.750088 7.51023 0.0900879 6.85023 0.0900879 6.01023V1.99023C0.0900879 1.15023 0.750088 0.490234 1.59009 0.490234H10.3801C11.2201 0.490234 11.8801 1.15023 11.8801 1.99023V5.98023C11.9101 6.82023 11.2201 7.51023 10.4101 7.51023ZM1.59009 1.51023C1.32009 1.51023 1.08009 1.72023 1.08009 2.02023V6.01023C1.08009 6.28023 1.29009 6.52023 1.59009 6.52023H10.3801C10.6501 6.52023 10.8901 6.31023 10.8901 6.01023V1.99023C10.8901 1.72023 10.6801 1.48023 10.3801 1.48023H1.59009V1.51023ZM3.45009 5.50029C2.55009 5.50029 1.80009 4.75029 1.80009 3.85029C1.80009 2.95029 2.55009 2.20029 3.45009 2.20029C4.35009 2.20029 5.10009 2.95029 5.10009 3.85029C5.10009 4.18837 4.99426 4.50529 4.8144 4.76923L5.61747 5.57231L5.19321 5.99657L4.39394 5.19729C4.12513 5.38765 3.79888 5.50029 3.45009 5.50029ZM3.45009 2.80029C2.88009 2.80029 2.40009 3.28029 2.40009 3.85029C2.40009 4.42029 2.88009 4.90029 3.45009 4.90029C4.02009 4.90029 4.50009 4.42029 4.50009 3.85029C4.50009 3.28029 4.02009 2.80029 3.45009 2.80029Z"/>
  </svg>`,
    keyword: 'Search'
  },
  [searchItemListRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}block-svg" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}block-svg-path" fill-rule="evenodd" clip-rule="evenodd" d="M10.4101 7.51023H1.59009C0.750088 7.51023 0.0900879 6.85023 0.0900879 6.01023V1.99023C0.0900879 1.15023 0.750088 0.490234 1.59009 0.490234H10.3801C11.2201 0.490234 11.8801 1.15023 11.8801 1.99023V5.98023C11.9101 6.82023 11.2201 7.51023 10.4101 7.51023ZM1.59009 1.51023C1.32009 1.51023 1.08009 1.72023 1.08009 2.02023V6.01023C1.08009 6.28023 1.29009 6.52023 1.59009 6.52023H10.3801C10.6501 6.52023 10.8901 6.31023 10.8901 6.01023V1.99023C10.8901 1.72023 10.6801 1.48023 10.3801 1.48023H1.59009V1.51023ZM3.45009 5.50029C2.55009 5.50029 1.80009 4.75029 1.80009 3.85029C1.80009 2.95029 2.55009 2.20029 3.45009 2.20029C4.35009 2.20029 5.10009 2.95029 5.10009 3.85029C5.10009 4.18837 4.99426 4.50529 4.8144 4.76923L5.61747 5.57231L5.19321 5.99657L4.39394 5.19729C4.12513 5.38765 3.79888 5.50029 3.45009 5.50029ZM3.45009 2.80029C2.88009 2.80029 2.40009 3.28029 2.40009 3.85029C2.40009 4.42029 2.88009 4.90029 3.45009 4.90029C4.02009 4.90029 4.50009 4.42029 4.50009 3.85029C4.50009 3.28029 4.02009 2.80029 3.45009 2.80029Z"/>
    </svg>`,
    keyword: 'Search Item List'
  },
  [componentRef]: {
    icon: stylePrefix => `
    <svg class="${stylePrefix}component-svg" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="${stylePrefix}component-svg-path" d="M6.27441 7.22311V10.2231C6.27441 10.4981 6.49941 10.7231 6.77441 10.7231H9.77441C10.0494 10.7231 10.2744 10.4981 10.2744 10.2231V7.22311C10.2744 6.94811 10.0494 6.72311 9.77441 6.72311H6.77441C6.49941 6.72311 6.27441 6.94811 6.27441 7.22311ZM1.77441 10.7231H4.77441C5.04941 10.7231 5.27441 10.4981 5.27441 10.2231V7.22311C5.27441 6.94811 5.04941 6.72311 4.77441 6.72311H1.77441C1.49941 6.72311 1.27441 6.94811 1.27441 7.22311V10.2231C1.27441 10.4981 1.49941 10.7231 1.77441 10.7231ZM1.27441 2.22311V5.22311C1.27441 5.49811 1.49941 5.72311 1.77441 5.72311H4.77441C5.04941 5.72311 5.27441 5.49811 5.27441 5.22311V2.22311C5.27441 1.94811 5.04941 1.72311 4.77441 1.72311H1.77441C1.49941 1.72311 1.27441 1.94811 1.27441 2.22311ZM7.74941 1.42311L5.62441 3.54311C5.42941 3.73811 5.42941 4.05311 5.62441 4.24811L7.74941 6.37311C7.94441 6.56811 8.25941 6.56811 8.45441 6.37311L10.5794 4.24811C10.7744 4.05311 10.7744 3.73811 10.5794 3.54311L8.45941 1.42311C8.26441 1.22811 7.94441 1.22811 7.74941 1.42311Z" fill="#4CAF50"/>
    </svg>`,
    keyword: 'Component'
  }
};
