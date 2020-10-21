<!-- Pug Template -->
<template lang="pug">
.MaturityAssessment(
  :id="config.fields.id"
)
  .container
    template(
      v-if="!loaded"
    )
      .MaturityAssessment__Loading.d-flex.align-items-center.justify-content-center(
        :style="loadingStyle"
      )
        .mdi.mdi-loading.mdi-spin
    template(
      v-else
    )
      smooth-reflow(
      )
        .MaturityAssessment__Panel(
          key="intro"
          v-if="panel=='intro'"
        )
          intro(
            :user="user"
            :dropdown="industryDropdown"
            :config="config"
            @next="next"
            @populate-demo-values="populateDemoValues"
          )

        .MaturityAssessment__Panel(
          key="quiz"
          ref="quiz"
          v-if="panel=='quiz'"
        )
            
          quiz(
            :categories="categories"
            @next="next"
            @previous="previous"
          )

      .MaturityAssessment__Panel(
        key="results"
        ref="results"
        v-if="panel=='results'"
      )
        results.MaturityAssessment__Results(
          :categories="categories"
          :questions="questions"
          :benchmarks="benchmarks"
          :industries="industries"
          :industryDropdown="industryDropdown"
          :sizeDropdown="sizeDropdown"
          :user="user"
          :config="config"
          :recommendations="recommendations"
          :nonce="config.nonce"
          :fontBase="config.font_base"
          :pdfUrl="pdfUrl"
          @previous="previous"
        )

</template>

<!-- Script -->
<script>
import axios from 'axios';
import Category from './Category';
import Quiz from './Quiz';
import Results from './Results';
import SmoothReflow from './SmoothReflow';
import Intro from './Intro';
import StickyEvents from 'sticky-events';
import {loadLanguageStrings, translate as _} from '../lang';
import smoothReflow from 'vue-smooth-reflow';

const $ = jQuery;

export default {

  name: 'MaturityAssessment',

  components : {
    SmoothReflow,
    Category,
    Results,
    Quiz,
    Intro
  },

  props : {
    config : {
      type: Object
    }
  },

  data() {
    return {
      loaded : false,
      lastPanelHeight : null,
      panel : 'intro',
      panels : ['intro','quiz','results'],
      user : {
        industry: '',
        size: '',
        email: '',
        showResults: false
      },
      categories: [],
      questions: [],
      industries: {},
      benchmarks: [],
      industryDropdown: [],
      sizeDropdown : [],
      recommendations: {},
      pdfUrl: (window.location.pathname.replace(/\/$/,''))+'/report-pdf/'
    }
  },

  computed: {
    loadingStyle(){
      const h = $('header').height() + $('body').offset().top;
      return {
        'min-height' : `calc(100vh - ${h}px)`
      }
    }
  },

  created(){
    this.loadData();
  },

  mounted(){

  },

  methods : {
    async loadData(){
      this.loaded = false;
      this.questions = [];
      this.categories = [];
      const sheetUrl = this.config.fields.google_sheet_url;
      const match = sheetUrl.match(/\/spreadsheets\/d\/([^\/]+)/);
      const sheetId = match[1];
      const apiKey = 'AIzaSyCd6mEhF440loFFsDj6LkpoORbFgprKM68';
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet/?ranges=Questions&ranges=Copy&ranges=Organization Sizes&ranges=Industry Dropdown&ranges=Benchmarks&ranges=Recommendations&key=${apiKey}`;
      const response = await axios.get(url);
      this.loadQuestions( response.data.valueRanges[0] );
      this.loadCopy( response.data.valueRanges[1] );
      this.loadOrganizationSizes( response.data.valueRanges[2] );
      this.loadDropdown( response.data.valueRanges[3] );
      this.loadBenchmarks( response.data.valueRanges[4] );
      this.loadRecommendations( response.data.valueRanges[5] );
      this.loaded = true;
    },

    loadQuestions( sheet ){
      let category = null;
      let headers = null;
      sheet.values.forEach( (row, i) => {
        if( 0===i ){
          headers = row;
          return;
        }
        const isCategory = row.slice(1).reduce( (str, v, j) => {
          return str += j > 0 ? v : '';
        }, '') == '';
        if( isCategory ){
          if( !row[0] ){
            return;
          }
          category = {
            title: row[0],
            questions: []
          };
          this.categories.push(category);
          return;
        }
        const answers = row.slice(1).map( (v, j) => {
          return {
            value: headers[j+1],
            text: v
          };
        }).filter( v => !!v.text );

        const question = {
          number: this.questions.length,
          category: category.title,
          question: row[0],
          answers,
          answer:''
        };

        this.questions.push(question);
        category.questions.push( question );

      });
    },

    loadCopy(sheet){
      const lang = {};
      sheet.values.forEach( row => lang[row[0]] = row[1]);
      loadLanguageStrings( lang );
    },

    loadOrganizationSizes(sheet){
      this.sizeDropdown = sheet.values.map( row => {
        return {
          value: row[0],
          text: row[1]
        }
      });
    },

    loadDropdown(sheet){
      this.industryDropdown = sheet.values.map( row => {
        return {
          value: row[0],
          text: row[1]
        }
      });
    },

    loadBenchmarks(sheet){
      this.benchmarks = [];
      sheet.values.forEach( (row, i) => {
        if( i === 0 ){
          row.slice(1).forEach( (industry, j) => this.benchmarks[j] ={industry});
          return;
        }
        if( i === 1 ){
          row.slice(1).forEach( (size, j) => this.benchmarks[j].size = size);
          return;
        }
        const category = row[0];
        row.slice(1).forEach( (score, j) => this.benchmarks[j][category] = score );
      });
    },

    loadRecommendations(sheet){
      this.recommendations = {};
      let industries = false;
      sheet.values.forEach( (row,i) => {
        if( !industries ){
          industries = row.slice(1);
          industries.forEach( industry => {
            this.recommendations[industry] = {};
          });
          return;
        }
        const category = row[0];
        row.slice(1).forEach( (recommendation,j)=> {
          this.recommendations[industries[j]][category] = recommendation;
        });
      });
    },

    next(){
      const i = this.panels.indexOf( this.panel );
      this.panel = this.panels[i+1];
      this.resetScroll();
    },

    previous(){
      const i = this.panels.indexOf( this.panel );
      this.panel = this.panels[i-1];
      this.resetScroll();
    },

    resetScroll(){
      const headroom = $('header').data('headroom');
      if( headroom ){
        headroom.unpin();
        headroom.freeze();
      }
      const scrollTop = Math.round($(this.$el).offset().top )+'px';
      $('html,body').animate({
        scrollTop
      }, 500, () => {
        if( headroom ) setTimeout(()=>headroom.unfreeze(), 1000 );
      })
    },

    populateDemoValues(){
      this.questions.forEach(q => {
        const a = Math.floor( Math.min( q.answers.length-1, Math.random() * q.answers.length) );
        q.answer = q.answers[a].value;
      });
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
.MaturityAssessment {
  // background: $gray-200;
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);

  &__Loading {
    @include font-size(5rem);
    color: $blue;
  }

  &__Header {
    position: sticky;
    width: 100%;
    // this should match the transition for the header
    transition: 0.6s;
    z-index: 3;

    .headroom--unpinned + main & {
      top: 32px !important;
    }
  }

  &__HeaderBody {
    position: relative;
    background: $blue;
    color: $white;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>