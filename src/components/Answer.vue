<!-- Pug Template -->
<template lang="pug">
.Answer(
  :class="answerClass"
  @click="question.answer=value"
)
  .Answer__Control.custom-control.custom-radio

    input.custom-control-input(
      required
      type="radio"
      v-model="question.answer"
      :value="value"
      :name="`${name}`"
      :id="`${id}`"
    )
    
    label.custom-control-label(
      :for="`${id}`"
    ) {{ text }}


  transition(
    name="fade"
  )
    .Answer__Selected(
      v-if="selected"
    ) Your Answer
</template>

<!-- Script -->
<script>
export default {

  name : 'Answer',

  props : {
    text : {
      type : String
    },
    value : {
      type : String,
      default: ''
    },
    id : {
      type : String
    },
    name : {
      type : String
    },
    question : {
      type : Object
    }
  },

  computed : {
    answerClass(){
      return {
        '-selected' : this.selected
      }
    },
    selected(){
      return this.question.answer == this.value;
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss" scoped>
@import '../scss/base';
.Answer {
  padding: 1rem 1rem;
  border: 3px solid transparent;
  border-radius: 0.4rem;
  transition: 0.2s all;
  position: relative;
  &, * {
    cursor: pointer;
  }
  
  &:hover {
    background: #f8f8f8;
  }
  .form-check-input {
    margin-top: 0.3rem;
  }

  &.-selected {
    margin: 1rem;
    border: 3px solid $blue;
    &:hover {
      background: inherit;
    }
  }
  &__Selected {
    position: absolute;
    top: 0;
    left: 15%;
    background: $white;
    font-weight: 300;
    font-size: 0.85rem;
    border: 1px solid $blue;
    height: 2em;
    color: $blue;
    padding: 0.1rem 1rem;
    transform: translate(0%, -50%);
    border-radius: 0.25rem;
    opacity: 1;
  }
}
/*
.fade-enter-active{
  transition: all .1s;
}
.fade-leave-active {
  transition: all .05s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  height: 0;
}
*/
</style>