<!-- Pug Template -->
<template lang="pug">
li.QuizHeaderItem
  h4(
    v-if="i===index"
  ) {{ category.title }}

  a(
    :class="anchorClass"
    :title="category.title"
    @click="canGoTo?$emit('goto', i):null"
    v-if="i!==index"
  )
    span.circle
</template>

<!-- Script -->
<script>
export default {

  name : 'QuizHeaderItem',

  props : {
    categories : {
      type : Array
    },
    category : {
      type : Object
    },
    index : {
      type : Number
    },
    i : {
      type : Number
    }
  },

  data(){
    return {
      seen: false
    };
  },

  created(){
    this.maybeSendGoogleEvent();
  },

  watch : {
    isActive(v){
      this.maybeSendGoogleEvent();
    }
  },

  computed : {
    anchorClass() {
      return {
        '-can-go-to' : this.canGoTo,
        '-is-complete' : this.isCompleted,
        '-is-last-complete' : this.isLastCompleted
      }
    },
    isActive(){
      return this.i == this.index;
    },
    isCompleted(){
      return this.isCategoryCompleted(this.i);
    },
    isLastCompleted(){
      if( !this.canGoTo || this.i === 0){
        return false;
      }
      if( this.categories[this.i+1] && !this.canGoToIndex(this.i+1) ){
        return true;
      }
      return false;
    },
    canGoTo(){
      return this.canGoToIndex(this.i);
    }
  },

  methods : {
    canGoToIndex(i){
      return i===0 || this.isCategoryCompleted(i) || this.categories[i-1] && this.isCategoryCompleted(i-1);
    },
    isCategoryCompleted(i){
      return this.categories[i] && this.categories[i].questions.filter(q => q.answer == '').length === 0;
    },
    maybeSendGoogleEvent(){
      if( this.isActive && !this.seen && typeof window.ga == 'function' ){
        window.ga('send', 'event', 'Risk Assessment', 'Progress', `${this.i+2}: ${this.category.title}` );
        this.seen = true;
      }
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss" scoped>
@import '../scss/base';
.QuizHeaderItem {
  list-style: none;
  display: flex;
  align-items: center;
  a {
    display: flex;
    align-items: center;
    color: #aaa;
    &:before, &:after {
      content: '';
      width: 0.75em;
      @include media-breakpoint-up(md){
        width: 1.5em;
      }
      display: block;
      height: 3px;
      background: #ccc;
    }
    .circle {
      display: block;
      height: 1rem;
      width: 1rem;
      border-radius: 50%;
      background: #ccc;
    }
    &.-can-go-to{
      cursor: pointer;
      &:before,&:after,.circle {
        background: $blue;
      }
    }
    &.-is-last-complete {
      &:after {
        background: #ccc;
      }
    }
  }
  &:first-child {
    a {
      &:before {
        display: none;
      }
    }
  }
  &:last-child {
    a {
      &:after {
        display: none;
      }
    }
  }
}
</style>