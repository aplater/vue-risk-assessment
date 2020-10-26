<!-- Pug Template -->
<template lang="pug">
transition(
  name="panel"
  mode="out-in"
  @leave="leave"
  @before-enter="beforeEnter"
  @enter="enter"
  @after-enter="afterEnter"
)
  div(
    ref="container"
  )
    slot
</template>

<!-- Script -->
<script>
const $ = jQuery;
export default {

  props : {
    
  },
  
  data(){
    return {
      previous: null,
      next: null
    }
  },
  
  methods : {

    leave(el){
      this.previous = el.scrollHeight;
      el.style.opacity = 0;
    },

    beforeEnter(el){
      this.next = el.scrollHeight;
      el.style.height = this.previous+'px';
    },
    
    enter(el){
      const h = this.$refs.container.scrollHeight;
      el.style.height = h+'px';
    },

    afterEnter(el){
      el.style.height = '';
    }
  }

};
</script>

<style lang="scss" scoped>
.panel-enter-active{ 
  transition: all 1s;
}
.panel-leave-active{ 
  transition: all 0.25s;
}
.panel-enter, .panel-leave-to {
  opacity: 0;
}
</style>