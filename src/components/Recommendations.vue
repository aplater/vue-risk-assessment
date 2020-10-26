<!-- Pug Template -->
<template lang="pug">
.Recommendations.row.mx-0
  .col-auto.px-0
    ul.Recommendations__Nav.nav.flex-column.d-none.d-md-block
      li.Recommendations__NavItem.nav-item(
        v-for="(recommendation, category, index) in recommendations"
      )
        a.Recommendations__NavLink.nav-link(
          data-toggle="collapse"
          :class="itemClass(category)"
          @click="active = category"
        ) 
          span.category-name {{ category }}
          span.category-score(
            
          ) {{ scores[index]}}%

  .col-12.col-md.px-0
    div(
      :class="smallClass('accordion')"
      id="recommendations-accordion"
    )
      template(
        v-for="(recommendation, category, index) in recommendations"
      )
        .Recommendations__Recommendation(
          v-if="active == category || small"
          :class="smallClass('card')"
        )
          div(
            :class="smallClass('card-header')"
            :id="`recommendation-${index}-header`"
          )
            h2 
              span(
                v-if="!small"
              ) {{ category }}
              button.btn.btn-link.btn-block.text-left(
                v-else
                type="button"
                data-toggle="collapse"
                :data-target="`#recommendation-${index}`"
                aria-expanded="false"
                :aria-controls="`recommendation-${index}`"
              ) 
                span.category-name {{ category }}
                span.category-score(
                  :class="categoryColor(index)"
                ) {{ scores[index]}}%
                span
                  span.mdi.mdi-chevron-down

          div(
            :id="`recommendation-${index}`"
            :class="smallClass('collapse')"
            :aria-labelled-by="`recommendation-${index}-header`"
            data-parent="#recommendations-accordion"
          )
            div(
              :class="smallClass('card-body')"
            )
              table.Recommendations__Bars
                tbody
                  tr.score(
                    :class="{'red' : scores[index] < benchmark[index]}"
                  )
                    th
                      strong Score:
                      | &nbsp;
                      strong(
                        :class="{'text-green': scores[index] >= benchmark[index], 'text-red': scores[index]<benchmark[index]}"
                      ) {{ scores[index] }}%
                    td
                      .Recommendations__Bar
                        .Recommendations__BarFill(
                          :style="barFill(scores[index])"
                        )
                  tr.industry
                    th
                      strong Industry:
                      | &nbsp;
                      strong.text-gray-600 {{ benchmark[index] }}%
                    td
                      .Recommendations__Bar
                        .Recommendations__BarFill(
                          :style="barFill(benchmark[index])"
                        )
              div.Recommendations__Text(
                v-html="markdown.parse(recommendation)"
              )

</template>

<!-- Script -->
<script>

import markdown from 'markdown';
import debounce from 'debounce';
const $ = jQuery;

export default {

  name : 'Recommendations',

  props : {
    recommendations : {
      type : Object
    },
    scores : {
      type : Array
    },
    benchmark : {
      type : Array
    }
  },

  data(){
    const active = Object.keys( this.recommendations )[0];
    let windowWidth = $(window).width();
    $(window).on('resize orientationchange', debounce( e=> this.windowWidth = $(window).width(), 20) );
    return {
      active,
      markdown,
      windowWidth
    };
  },

  computed:{
    small(){
      return this.windowWidth < 768;
    }
  },

  methods : {
    itemClass( category ){
      return {
        'active' : category == this.active
      }
    },
    smallClass(cls){
      return this.small ? cls : '';
    },
    barFill(percent){
      return {
        width: percent+'%'
      }
    },
    categoryColor( index ){
      return {
        'text-red' : this.scores[index] < this.benchmark[index],
        'text-green' : this.scores[index] >= this.benchmark[index]
      };
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss">
@import '/scss/base';
.Recommendations{
  &__Nav {
    margin-top: 2rem;
    position: relative;
    z-index: 1;
  }
  &__NavLink {
    cursor: pointer;
    display: table;
    width: 100%;
    span {
      display: table-cell;
    }
    span.category-name {
      padding-right: 2rem;
    }
    span.category-score {
      text-align: right;
      font-weight: 600;
      font-size: 0.85em;
      vertical-align: middle;
    }
    @include media-breakpoint-up(lg){
    }
    padding-top: 1rem;
    padding-bottom: 1rem;
    position: relative;
    &:after {
      content: '';
      display: block;
      position: absolute;
      left: 100%;
      top: 0;
      width: 0rem;
      background: transparent;
      height: 100%;
      transition: 0.3s;
    }
    &.active {
      background: #606368;
      color: #fff !important;
      &:after {
        width: 0.5rem;
        background: $blue;
      }
    }
  }

  &__Recommendation {
    background: #fff;
    @include media-breakpoint-up(md) {
      padding: 2rem;
    }
    box-shadow: 0 0 20px rgba(0,0,0,.05);
    & + & {
      
    }
  }
  &__Bars {
    width: 100%;
    margin-bottom: 2rem;
    th {
      width: 1%;
      white-space: nowrap;
      padding-right: 2rem;
    }
    th,td {
      padding-top: 0.05em;
      padding-bottom: 0.05em;
    }
  }
  &__Bar {
    background-color: #EFEFF0;
    height: 1em;
    .green {
      color: #48AB9A;
    }
    .red {
      color: $red;
    }
    &Fill {
      height: 1em;
      background: #5F6269;
      .score & {
        background: #48AB9A;
      }
      .score.red & {
        background: $red;
      }
    }
  }
  .card-header {
    padding: 0;
    button {
      padding: 0.5em 1em;
      &:active {
        box-shadow: 0 0 0;
        text-decoration: none;
      }
      &:focus {
        text-decoration: none;
      }
      display: flex;
      .category-name {
        padding-right: 0.5em;
        color: $gray-800;
      }
      .category-score {
        color: $gray-600;
      }
      .mdi {
        display: inline-block;
        color: $gray-800;
        transition: 0.2s transform;
      }
      &[aria-expanded="true"] .mdi {
        transform: rotate(180deg);
      }
      > span {

        &:last-child {
          display: block;
          flex: 1;
          text-align: right;
        }
      }
    }
  }
}
</style>