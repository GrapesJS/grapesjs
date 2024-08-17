<template>
  <iframe :width="width" :height="height" :src="src" allowfullscreen="allowfullscreen" frameborder="0" />
</template>

<script>
export default {
  name: 'DemoViewer',
  props: {
    value: {
      type: String,
      default: '',
    },
    user: {
      type: String,
      default: 'artur_arseniev',
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '300',
    },
    darkcode: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    src() {
      const { value, user, darkcode, show } = this;
      const tabs = show ? 'result,js,html,css' : 'js,html,css,result';
      const dcStr = darkcode ? '/dark/?menuColor=fff&fontColor=333&accentColor=e67891' : '';
      return `//jsfiddle.net/${user}/${value}/embedded/${tabs}${dcStr}`;
    },
  },
};
</script>
