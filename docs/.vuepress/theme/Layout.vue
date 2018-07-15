<template>
  <Layout>
    <CarbonAds slot="sidebar-top"/>
  </Layout>
</template>

<script>
var Layout = require('@default-theme/Layout.vue').default;
var CarbonAds = require('./CarbonAds.vue').default;

module.exports = {
  components: {
    Layout,
    CarbonAds,
  }
}
</script>
