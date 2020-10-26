<!-- Pug Template -->
<template lang="pug">
.QuizHeader
  .QuizHeader__FullWidth
    .container.px-0.px-md-3
      .d-flex.flex-column.flex-md-row
        .QuizHeader__Title.mb-2.mb-md-0
          h4 {{ t('Widget Title') }}:
        ul.QuizHeader__Steps.px-3.px-md-4
          quiz-header-item(
            v-for="(category,i) in categories"
            :categories="categories"
            :category="category"
            :index="index"
            :i="i"
            @goto="$emit('goto', i)"
          )
</template>

<!-- Script -->
<script>
const $ = jQuery;
import _ from '../lang';
import QuizHeaderItem from './QuizHeaderItem';
export default {
  
  name : 'QuizHeader',

  components : {
    QuizHeaderItem
  },

  props : {
    categories : {
      type : Array
    },
    index : {
      type : Number
    }
  },

  data() {
    return {
      t : _
    }
  },

  mounted(){
    this.updateHeight();
    $(window).on('resize orientationchange', ()=>this.updateHeight() );
  },

  methods : {
    updateHeight(){
      this.$el.style.top = ($('body').offset().top + $('header').height())+'px';
    },
    anchorClass(category,i){
      return {
        '-can-go-to' : this.canGoTo(category,i),
        '-is-complete' : this.isCompleted(category),
        '-is-last-complete' : this.isLastCompleted(category,i)
      }
    },
    isCompleted(category){
      return category.questions.filter( q => q.answer == '' ).length === 0;
    },
    isLastCompleted(category,i){
      if( !this.isCompleted(category) ){
        return false;
      }
      if( this.categories[i+1] && !this.canGoTo(this.categories[i+1]) ){
        return true;
      }
      return false;
    },
    canGoTo(category,i){
      return this.isCompleted(category) || this.categories[i-1] && this.isCompleted(this.categories[i-1]);
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss">
@import '/scss/_vue-base';
.QuizHeader {
  position: sticky;
  z-index: 2;
  width: 100%;
  transition: all 0.6s;

  .headroom--unpinned + main & {
    top: 0px !important;
    .admin-bar & {
      top: 32px !important;
      @media screen and ( max-width: 782px ) {
        top: 46px !important;
      }
    }
  }

  &__FullWidth {
    padding: 1em;
    position: relative;
    left: 50%;
    width: 100vw;
    transform: translateX(-50%);
    background: $gray-200;
  }

  &__Steps {
    display: flex;
    margin-left: -1em;
    margin-right: -1em;
    
  }
  &__Title {
    @include media-breakpoint-down(md){
      padding-left: 0;
    }
    h4 {
      color: $blue;
    }
  }
}
</style>