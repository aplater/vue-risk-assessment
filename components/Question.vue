<!-- Pug Template -->
<template lang="pug">
.Question(
  :class="questionClass"
)
  .Question__Question(
    
  )
    .Question__Number 
      span {{ question.number+1 }}
    .Question__Text(
      v-html="text"
    )
  ul.Question__Answers
    li.Question__Answer(
      v-for="(answer, i) in question.answers"
      :class="{'-selected': question.answer==answer.value}"
    )
      answer(
        :question="question"
        :text="answer.text"
        :value="answer.value"
        :name="`question-${question.number}`"
        :id="`question-${question.number}-${i}`"
      )

</template>

<!-- Script -->
<script>
import Answer from './Answer';
export default {

  name : 'Question',

  components : {
    Answer
  },

  props : {
    question : {
      type: Object
    }
  },

  data() {
    return {
      value : '',
      hasAnswer: false
    };
  },

  watch : {
    ['question.answer']() {
      this.hasAnswer = true;
    }
  },

  computed: {
    questionClass(){
      return this.hasAnswer ? '-selected' : '-unselected';
    },
    text(){
      return this.question.question.replace(/\n/gi,'<br />');
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss" scoped>
@import '../../../scss/_variables';
@import '~bootstrap/scss/_functions';
@import '~bootstrap/scss/_variables';
@import '~bootstrap/scss/_mixins';
.Question {
  background: #fff;
  &__Question {
    padding: 2rem 1rem 2rem;
    display: flex;
  }
  &__Number {
    background: $blue;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    line-height: 1;
    font-size: 1.25rem;
    font-family: $headings-font-family;
    flex-shrink: 0;
  }
  &__Text {
    padding-left: 1.5rem;
    font-size: 1.1rem;
    font-weight: 500;
  }
  &__Answers {
    margin: 0rem 0 0 0;
    padding: 0;
  }
  &__Answer {
    list-style: none;
    border-top: 1px solid #f2f2f2;
    &.-selected {
      border-top-color: transparent;
    }
    &.-selected + & {
      border-top-color: transparent;
    }
  }
}
</style>