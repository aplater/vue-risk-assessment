// SmoothReflow.vue
<template>
    <component :is="tag">
        <slot/>
    </component>
</template>

<script>
import smoothReflow from 'vue-smooth-reflow'
export default {
    name: 'SmoothReflow',
    mixins: [smoothReflow],
    props: {
        tag: {
            type: String,
            default: 'div'
        },
        options: Object,
        enabled: {
            type: Boolean,
            default: true
        }
    },
    mounted () {
        this.$smoothReflow(this.options)
    },
    watch : {
        enabled(v){
            if( !v ) this.$unsmoothReflow(this.options);
            else this.$smoothReflow(this.options);
        }
    }
}
</script>