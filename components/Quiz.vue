<!-- Pug Template -->
<template lang="pug">
.Quiz
  quiz-header.Quiz__Header(
    :class="headerClass"
    :categories="categories"
    :index="index"
    @goto="(i)=>index=i"
  )


  .Quiz__Body
    template(
      v-for="(category,i) in categories"
    )
      
      category.MaturityAssessment__Category(
        v-if="index === i"
        :category="category"
        @next="next"
        @previous="previous"
      )

</template>

<!-- Script -->
<script>
import Category from './Category';
import QuizHeader from './QuizHeader';
import SmoothReflow from './SmoothReflow';
const $ = jQuery;
export default {

  name : 'Quiz',

  components: {
    Category,
    QuizHeader,
    SmoothReflow
  },

  props : {
    categories : {
      type: Array
    }
  },

  data() {
    return {
      showHeader: false,
      lastPanelHeight: null,
      index: 0
    }
  },

  watch : {
    index(){
      const headroom = $('header').data('headroom');
      if( headroom ){
        headroom.unpin();
        headroom.freeze();
      }
      const scrollTop = Math.round($(this.$el).offset().top - $('body').offset().top)+'px';
      $('html,body').animate({
        scrollTop
      }, 500, () => {
        if( headroom ) setTimeout( ()=>headroom.unfreeze(), 1000 );
      } );
    }
  },

  computed : {
    headerClass(){
      return {
        '-show' : this.showHeader
      }
    }
  },

  mounted(){
    setTimeout( () => {
      this.showHeader = true;
    }, 500 );

  },

  methods : {
    next(){
      if( this.index + 1 == this.categories.length ){
        this.$emit('next');
      }
      else {
        this.index++;
      }
    },
    previous(){
      if( this.index - 1 < 0 ){
        this.$emit('previous');
      }
      else {
        this.index--;
      }
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss">
@import '../../../scss/_variables';
@import '~bootstrap/scss/_functions';
@import '~bootstrap/scss/_variables';
@import '~bootstrap/scss/_mixins';
.Quiz {
  // background: #fff;
  // color: $body-color;
  // border: 1px solid darken($blue, 10%);
  padding-bottom: 2rem;

  &__Header {
    opacity: 0;
    transition: 0.6s all;
    transform: translateY(-50%);
    &.-show {
      opacity: 1;
      transform: translateY(0%);
    }
  }

  &__Body {
    padding: 1rem 0;
  }
}
.panel-enter-active {
  transition: all 1s;
}
.panel-leave-active {
  transition: all .2s;
}
.panel-enter, .panel-leave-to {
  opacity: 0;
}
</style>