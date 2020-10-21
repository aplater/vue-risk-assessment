<!-- Pug Template -->
<template lang="pug">
form.Category(
  @submit.prevent="$emit('next')"
)
  .Category__Questions
    question.Category__Question(
      v-for="(question, i) in category.questions"
      :question="question"
    )

  .Category__Buttons
    button.btn.btn-white(
      type="button"
      @click="$emit('previous')"
    ) 
      span.mdi.mdi-arrow-left
      |  Previous
    button.btn.btn-primary(
      type="submit"
    ) Next
      |  
      span.mdi.mdi-arrow-right

</template>

<!-- Script -->
<script>
import debounce from 'debounce';
import Question from './Question';
const $ = jQuery;
export default {

  name: 'Category',

  components: {
    Question
  },

  props : {
    category: {
      type: Object
    }
  },

  mounted(){
    const gotoInvalid = debounce(()=>{
      const headroom = $('header').data('headroom');
      if( headroom ){
        headroom.unpin();
        headroom.freeze();
      }
      const $q = $('.Question.invalid').first();
      $('.Question.invalid').removeClass('invalid');
      const offset = $('body').offset().top;
      
      $('html, body').animate({scrollTop: $q.offset().top - offset - 80}, 0, () => {
        setTimeout(()=>{
          if( headroom ) headroom.unfreeze();
        },1000)
      });
    }, 1);
    
    setTimeout(() => {
      document.querySelectorAll('input').forEach(el => {
        
        $(el).on('invalid', (e) => {
          $(e.target).closest('.Question').addClass('invalid');
          gotoInvalid();
        });
      });
    },100);
  }
};
</script>

<!-- SCSS Style -->
<style lang="scss" scoped>
.Category {
  &__Title {
    
  }
  &__Questions {
    margin: 1rem 0;
  }
  &__Question {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    border: 1px solid #ccc;
    padding: 0rem;
    border-top: 1px solid #d8d8d8;
    &+&{
      margin-top: 1rem;
    }
  }

  &__Buttons {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    width: 100%;
    justify-content:  space-between;
  }
}
</style>