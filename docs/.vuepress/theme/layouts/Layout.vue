<template>
  <Layout>
    <CarbonAds slot="sidebar-top"/>
  </Layout>
</template>

<script>
// var Layout = require('@vuepress/theme-vue/layouts/Layout.vue').default;
// var CarbonAds = require('./CarbonAds.vue').default;
// import Layout from '@vuepress/theme-default/layouts/Layout.vue';
// import CarbonAds from './CarbonAds.vue';
import Layout from '@parent-theme/layouts/Layout.vue'
import CarbonAds from './CarbonAds.vue';

export default {
  components: {
    Layout,
    CarbonAds,
  }
}
</script>
