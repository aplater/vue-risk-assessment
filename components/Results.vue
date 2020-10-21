<!-- Pug Template -->
<template lang="pug">
.Results
  .Results__Banner.position-relative(
    ref="banner"
    :class="{'-half-banner': !config.fields.results_header}"
  )
    .Results__BannerImage(
      :style="bannerImageStyles"
    )
    .row
      .Results__BannerTitle.col-12.col-md-6
        h1 {{ t('Your Results') }}
  
  template(
    v-if="!user.showResults"
  )

    .Results__Section.bg-white.py-4
      .container
        .Results__Loading.d-flex.align-items-center.justify-content-center(
          :style="loadingStyle"
          v-if="!marketoLoaded"
        )
          .mdi.mdi-loading.mdi-spin

        .b-marketo-form(
          v-show="marketoLoaded"
        )
          .Results__FormText(
            v-html="formText"
          )
          form.mktoForm(
            :id="marketoFormId"
            :data-formId="config.fields.market_form_id"
          )

  template(
    v-else
  )
    .Results__Section.bg-white.py-3.py-md-6
      .container
        .row.align-items-center.mx-0.mx-md-n5
          .col-12.col-lg-6.px-0.px-md-5.pb-5.pb-lg-0
            .Results__PartnerLogo(
              v-if="config.fields.partner_logo"
            )
              img(
                :src="config.fields.partner_logo.sizes.large"
              )
            .Results__Text(
              v-html="resultsText"
            )
            .text-center
              results-pdf.Results__Section.Results__Pdf.py-6(
                :recommendations="industryRecommendations"
                :scores="scores"
                :benchmark="benchmark"
                :nonce="nonce"
                :fontBase="fontBase"
                :chartData="chartData"
                :pdfUrl="companyPdfUrl"
                :config="config"
                @download="onDownload"
              )

          .col-12.col-lg-6.px-0.px-md-5
            div.Results__ChartContainer
              radar-chart(
                ref='radarChart'
                :chartdata="chartData"
                :options="chartOptions"
              )

            .Results__ChartText(
              v-html="chartText"
            )
    .Results__Section.Results__SectionRecommendations.py-md-6
      div(
        :class="responsiveClasses('','container')"
      )
        recommendations(
          :recommendations="industryRecommendations"
          :scores="scores"
          :benchmark="benchmark"
        )

</template>

<!-- Script -->
<script>
import RadarChart from './RadarChart';
import Recommendations from './Recommendations';
import Color from 'color';
import markdown from 'markdown';
import debounce from 'debounce';
import _ from '../lang';
import sharer from 'sharer';

if( window && window.irisColor ){
  window.Color = window.irisColor
}

const $ = jQuery;

export default {

  components : {
    RadarChart,
    Recommendations,
    ResultsPdf : () => import('./ResultsPdf')
  },

  name : 'Results',

  props : {
    config : {
      type : Object
    },
    categories : {
      type : Array
    },
    questions : {
      type : Array
    },
    benchmarks : {
      type : Array
    },
    user : {
      type : Object
    },
    industries : {
      type : Object
    },
    company : {
      type : String
    },
    industryDropdown : {
      type : Array
    },
    sizeDropdown : {
      type : Array
    },
    recommendations : {
      type : Object
    },
    nonce : {
      type : String
    },
    fontBase : {
      type : String
    },
    pdfUrl : {
      type : String
    }
  },

  data(){
    let windowWidth = $(window).width();
    $(window).on('resize orientationchange', debounce( e=> this.windowWidth = $(window).width(), 20) );
    return {
      marketoLoaded : false,
      t : _,
      windowWidth,
      radarImage: ''
    }
  },

  watch : {
    'user.showResults'( v ) {
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
      
      if( v && typeof window.ga == 'function' ){
        window.ga('send', 'event', 'Risk Assessment', 'Progress', `${this.categories.length+3}: Show Results` );
      }
    },
    benchmark(benchmark){
      if( !benchmark ){
        return;
      }
      const $form = $(`#${this.marketoFormId}`);
      if( !$form.length ){
        return;
      }
      const scores = this.scores;
      this.categories.forEach( (category,i) => {
        let key = category.title.split(' ')[0];
        if( key == 'Government' ) key = 'Governance';
        if( key == 'Investigations' ) key = 'Response';
        const fieldName = `iTMAssessment${key}2`;
        const $field = $form.find(`[name="${fieldName}"]`);
        $field.val(
          `User: ${scores[i]} / Benchmark: ${benchmark[i]}`
        );
      });
    }
  },

  computed: {
    loadingStyle(){
      const h = $('header').height() + $('body').offset().top + $(this.$refs.banner).height();
      return {
        'min-height' : `calc(100vh - ${h}px)`
      }
    },

    companyPdfUrl(){
      return this.pdfUrl+encodeURIComponent( this.user.company.replace(/[^a-z0-9\s]/gi, '')+' - Risk Assessment' );
    },

    scores(){
      return this.categories.map( c => this.score(c) );
    },

    industryRecommendations(){
      return this.recommendations[
        this.userIndustry
      ];
    },

    categoryLabels(){
      return this.categories.map( c => c.title );
    },

    bannerImageStyles(){
      let url = this.config.fields.image.sizes['1536x1536'];
      if( this.config.fields.results_header ){
        url = this.config.fields.results_header.sizes['1536x1536'];
      }
      return {
        'background-image' : `url(${url})`
      }
    },

    marketoFormId(){
      return 'mktoForm_'+this.config.fields.marketo_form_id;
    },

    userIndustry(){
      const industry = this.industryDropdown.find( row => {
        return row.text == this.user.industry
      });
      return industry ? industry.value : false;
    },

    userSize(){
      const size = this.sizeDropdown.find( row => {
        return row.text == this.user.size;
      });
      return size ? size.value : false;
    },

    benchmark(){
      
      const benchmark = this.benchmarks.find( benchmark => {
        return benchmark.industry == this.userIndustry && (benchmark.industry == 'Other' || benchmark.size == this.userSize );
      });

      if( !benchmark ){
        return false;
      }

      return this.categories.map( c => benchmark[c.title] );
    },

    chartCategoryLabels(){
      return this.categoryLabels.map( label => {
        let lines = label.split(' & ');
        if( lines.length > 1 ){
          lines[0] += ' &';
        }
        return lines;
      });
    },

    chartData(){
      return {
        labels: this.chartCategoryLabels,
        pointLabels : {
          fontSize: 20
        },
        datasets: [{
          label: 'Industry Benchmark',
          backgroundColor: Color('#5F6269').alpha('0.2').rgb().string(),
          borderColor: Color('#5F6269').alpha('0.5').rgb().string(),
          data: this.benchmark
        },{
          label: 'Your Scores',
          data: this.scores,
          backgroundColor: Color('#009CDE').alpha('0.4').rgb().string(),
          borderColor: Color('#009CDE').alpha('0.7').rgb().string()
        }]
      };
    },

    chartOptions(){
      return {
        defaultFontFamily: '"Helvetica Neue", "HelveticaNeue-Light", "Helvetica Neue Light", Helvetica, Arial, "Lucida Grande", sans-serif',
        defaultFontSize : 14,
        legend : {
          onClick: () => {}
        },
        scale : {
          ticks : {
            suggestedMin: 0,
            suggestedMax : 100,
            stepSize: 25
          },
          pointLabels : {
            fontSize: 12
          }
        },
      };
    },

    formText(){
      return markdown.parse(_('Text above form'));
    },

    resultsText(){
      return markdown.parse(_('Results Section'));
    },

    chartText(){
      return markdown.parse(_('Text under Spider Chart'));
    },
    small(){
      return this.windowWidth < 768;
    }
  },

  mounted(){
    if( !this.user.showResults ){
      this.loadForm();
      if( typeof window.ga == 'function' ){
        window.ga('send', 'event', 'Risk Assessment', 'Progress', `${this.categories.length+2}: Marketo Form` );
      }
    }
  },

  methods : {
    score( category ){
      const filtered = category.questions.filter( q => q.answer !== '' );
      if( !filtered.length ) return 0;
      return Math.min( Math.round( filtered.reduce( (t,q) => t+Number(q.answer), 0 ) / filtered.length ), 100);
    },

    loadForm(){
      this.marketoLoaded = false;
      MktoForms2.loadForm("//app-abj.marketo.com", "309-RHV-619", this.config.fields.marketo_form_id, (form) => {
        const $form = $(`#${this.marketoFormId}`);
        if( !$form.length ){
          return;
        }
        $form.find('.mktoFieldWrap').addClass('form-group');
        $form.css('width','').find('.mktoField').addClass('form-control');
        $form.find('label').find('.mktoAsterix').each( function(){
          $(this).appendTo( $(this).parent() );
        });

        $form.find('[name="iTMAssessmentIndustry"]').on('change', e => {
          this.user.industry = $(e.target).val();
        });
        $form.find('[name="iTMAssessmentOrgSize"]').on('change', e => {
          this.user.size = $(e.target).val();
        });
        $form.find('[name="Company"]').on('change', e => {
          this.user.company = $(e.target).val();
        });
        $form.find('.mktoButton').addClass('btn btn-primary btn-lg');
        $form.find('.mktoButtonWrap').attr('style','');

        form.onSuccess( form => {
          this.user.showResults = true;
          return false;
        });

        this.marketoLoaded = true;
      });
    },

    responsiveClasses(mobile, desktop){
      return this.small ? mobile : desktop;
    },

    onDownload(){
      if( typeof window.ga == 'function' ){
        window.ga('send', 'event', 'Risk Assessment', 'PDF', 'Download' );
        this.seen = true;
      }
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
.Results {
  
  &__PartnerLogo {
    img {
      margin: 1em 0 2em; 
      max-height: 100px;
      max-width: 220px;
    }
  }

  th {
    padding-right: 1rem;
  }
  &__Loading {
    @include font-size(5rem);
    color: $blue;  
  }
  &__BannerTitle {
    padding-top: 5em;
    padding-bottom: 5em;
    color: #fff;
    display: flex;
    align-items: center;
    .-half-banner & {
      color: inherit;
    }
  }
  &__BannerImage {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    .-half-banner & {
      width: 50vw;
      left: 50%;
      transform: translateX(0);
    }
    height: 100%;
    top: 0;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50% 35%;
  }
  &__BannerPartner {
    padding-right: 2rem;
    img {
      padding: 1rem;
      background: #fff;
      max-width: 200px;
    }
  }

  &__ChartContainer {
    position: relative;
    max-width: 500px;
    margin: 0 auto;
  }

  &__ChartText {
    font-size: 0.85rem;
    color: $gray-800;
    margin-top: 2rem;
  }

  &__Section {
    position: relative;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);

    &Recommendations {
      background: #F5F5F6;
    }

    &::v-deep .b-marketo-form {
      background-color: #fff;
      max-width: 600px;
      margin: 2em auto 0;
      padding: 1em 2em;
      border: 1px solid $gray-100;
      form.mktoForm {
        .mktoGutter {
          width: 0 !important;
          display: none !important;
        }
        .mktoOffset {
          display: none !important;
        }
        .mktoLabel {
          display: block !important;
          width: auto !important;
          color: $gray-800;
        }
        .mktoAsterix {
          display: inline;
          margin-left: 0.333em !important;
          position: static !important;
        }
        .mktoButtonRow {
          display: block;
          text-align: center;
        }
        .btn {
          font-family: $headings-font-family;
        }
      }
    }
  }
}
</style>