<!-- Pug Template -->
<template lang="pug">
.Introduction(
  :style="introductionStyles"
)
  .Introduction__Image.mx-n3.mx-sm-0(
    :style="imageBackgroundStyles"
  )
  .w-100.overflow-hidden
    .row.position-relative.mx-n6
      .col-12.col-lg-6.px-6.py-5
        .Introduction__PartnerLogo(
          v-if="config.fields.partner_logo"
        )
          img(
            :src="config.fields.partner_logo.sizes.large"
          )
        .Introduction__Text(
          v-html="introduction"
        )
        
        form.row(
          @submit.prevent="start"
        )
          .col-12.mt-4.text-left
            button.btn.btn-primary(
              type="submit"
              @click.alt="demoValues"
            ) Start Assessment
              span.mdi.mdi-arrow-right

</template>

<!-- Script -->
<script>
import markdown from 'markdown';
import _ from '../lang';
const $ = jQuery;
export default {
  
  name : 'Introduction',

  props : {
    user : {
      type: Object
    },
    dropdown : {
      type: Array
    },
    config : {
      type : Object
    }
  },

  data(){
    return {
      started: false
    }
  },

  computed : {
    introduction(){
      return markdown.parse(_('Introduction'));
    },
    marketoFormId(){
      return 'mktoForm_'+this.config.fields.marketo_form_id;
    },
    introductionStyles(){
      const h = $('header').height()+$('body').offset().top;
      return {
        'min-height' : `calc(100vh - ${h}px)`
      };
    },
    imageBackgroundStyles(){
      const img = this.config.fields.image.sizes['1536x1536'];
      return {
        'background-image' : `url(${img})`
      }
    }
  },

  created() {
    // MktoForms2.loadForm("//app-abj.marketo.com", "309-RHV-619", this.config.fields.marketo_form_id, function(form) {
    //     // From here we have access to the form object and can call its methods
    // });
  },

  methods : { 
    demoValues(){
      this.$emit('populate-demo-values');
    },
    start(){
      if( !this.started && typeof window.ga == 'function' ){
        window.ga('send', 'event', 'Risk Assessment', 'Progress', `1: Start Assessment` );
      }
      this.started = true;
      this.$emit('next');
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss">
@import '/scss/_vue-base.scss';
.Introduction {
  @include media-breakpoint-up( lg ){
    display: flex;
    align-items: center;
  }

  &__PartnerLogo {
    
    img {
      margin: 1em 0 2em; 
      max-height: 100px;
      max-width: 220px;
    }

  }

  &__Image {
    height: 150px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50% 50%;
    @include media-breakpoint-up( md ){
      height: 250px;
    }
    @include media-breakpoint-up( lg ){
      position: absolute;
      width: 50vw;
      left: 50%;
      height: 100%;
      top: 0;
    }
  }
}
</style>