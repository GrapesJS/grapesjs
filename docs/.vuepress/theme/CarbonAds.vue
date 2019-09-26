<script>
export default {
  render (h) {
    return h('div', { class: 'carbon-ads', attrs: { id: 'native-carbon' }})
  },
  mounted () {
    window.BSANativeCallback = (a) => {
      const total = a.ads.length;

      if (!total) {
        const src = document.createElement('script');
        src.src = `//cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=grapesjscom`;
        src.setAttribute('id', '_carbonads_js');
        const adCont = document.getElementById('native-carbon');
        adCont && adCont.appendChild(src);
      }
    };
    this.load();
  },
  watch: {
    '$route' (to, from) {
      if (
        to.path !== from.path &&
        this.$el.querySelector('#carbonads')
      ) {
        this.$el.innerHTML = '';
        this.load();
      }
    }
  },
  methods: {
    initCarbon() {
      const { _bsa } = window;
      if(typeof _bsa !== 'undefined' && _bsa) {
        _bsa.init('default', 'CK7I62QJ', 'placement:grapesjscomdocs', {
          target: '#native-carbon',
        });
      }
    },
    load () {
      const s = document.createElement('script');
      // s.id = '_carbonads_js';
      // s.src = `//cdn.carbonads.com/carbon.js?serve=CKYI5KJU&placement=grapesjscom`;
      s.src = `//m.servedby-buysellads.com/monetization.js`;
      s.onload = () => this.initCarbon();
      this.$el.appendChild(s);
    }
  }
}
</script>

<style lang="stylus">
@import "~@default-theme/styles/config.styl"

.carbon-ads
  min-height 102px
  padding 1.5rem 1.5rem 0
  margin-bottom -0.5rem
  font-size 0.75rem
  a
    color #444
    font-weight normal
    display inline
  .carbon-img
    float left
    margin-right 1rem
    border 1px solid $borderColor
    img
      display block
  .carbon-poweredby
    color #999
    display block
    margin-top 0.5em

@media (max-width: $MQMobile)
  .carbon-ads
    .carbon-img img
      width 100px
      height 77px
</style>
