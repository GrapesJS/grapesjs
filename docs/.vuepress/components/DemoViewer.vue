<template>
    <iframe :width="width" :height="height" :src="src" allowfullscreen="allowfullscreen" frameborder="0"/>
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
    },
    computed: {
        src() {
            const { value, user } = this;
            return `//jsfiddle.net/${user}/${value}/embedded/js,html,css,result`;
        }
    }
}
</script>