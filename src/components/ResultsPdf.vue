<!-- Pug Template -->
<template lang="pug">
.ResultsPdf
  form(
    target="_blank"
    :action="pdfUrl"
    method="POST"
  )
    input(
      name="nonce"
      type="hidden"
      :value="nonce"
    )
    input(
      name="pdf"
      type="hidden"
      :value="docBase64"
    )
    button.btn.btn-primary.btn-lg(
      type="submit"
      @submit="$emit('download')"
      :disabled="!ready"
    )
      template(
        v-if="ready"
      ) Download Your Report
        span.mdi.mdi-download.ml-2

      template(
        v-else
      ) Preparing Your Report
        span.mdi.mdi-spin.mdi-loading.ml-2

  radar-chart.ResultsPdf__Chart(
    ref="radarChart"
    :chartdata="chartData"
    :options="radarOptions"
    @chart:image="onChartImage"
  )
  //- iframe.ResultsPdf__Iframe(
  //-   ref="iframe"
  //-   v-if="iframeSrc"
  //-   :src="iframeSrc"
  //- )
</template>

<!-- Script -->
<script>
import pdfmake from 'pdfmake';
import html2pdfmake from 'html-to-pdfmake';
import markdown from 'markdown';

import RadarChart from './RadarChart';

import _ from '../lang';
import images from '../images';

const $ = jQuery;

const GREEN = '#48AB9A';
const RED = '#EE3124';

function html2doc( string ){
  return html2pdfmake( string, {
    defaultStyles: {
      h1: { bold: false, fontSize: 30, font: 'Tungsten', margin:[0,0,0,12] },
      h2: { bold: false, fontSize: 24, font: 'Tungsten', margin:[0,0,0,4] },
      h3: { bold: false, fontSize: 20, font: 'Tungsten', margin:[0,0,0,4] },
      h4: { bold: false, fontSize: 14, font: 'Tungsten', margin:[0,0,0,4] },
      p : {margin:[0,0,0,10]},
      ul : { margin:[0,0,0,10]}
    }
  });
}

function toDataURL(src, outputFormat) {
  return new Promise( (resolve, reject) => {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.naturalHeight;
      canvas.width = this.naturalWidth;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      return resolve(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = src;
    }
  });
}

export default {

  name : 'ResultsPdf',

  components : {RadarChart},

  props : {
    nonce : {
      type : String
    },
    fontBase : {
      type : String
    },
    pdfUrl : {
      type : String
    },
    chartData : {
      type : Object
    },
    scores : {
      type : Array
    },
    benchmark : {
      type : Array
    },
    recommendations : {
      type : Object
    },
    config : {
      type: Object
    }
  },

  data(){
    return {
      radarImage: '',
      pdfHeaderImageData : null,
      iframeSrc : 'javascript:;',
      docBase64 : '',
      images: {},
      ready : false,
      radarOptions : {
        animation: { duration: 0 },
        devicePixelRatio: 2,
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
        }
      }
    }
  },

  computed : {
    async doc() {
      const introEl = document.createElement('div');
      introEl.innerHTML = markdown.parse(_('Results Section'));
      Array.prototype.forEach.call( introEl.querySelectorAll('h1,h2,h3'), node => node.parentNode.removeChild(node) );

      this.images = {
          header: images.pdfHeader,
          radar: this.radarImage
      };

      if( this.config.fields.partner_logo ){
        const dataurl = await toDataURL(this.config.fields.partner_logo.url);
        this.images.partner = dataurl;
      }

      const content = [{
        margin: [0,30,0,0],
        columnGap : 25,
        columns: [{
          width: 170,
          stack: this.toc()
          
        },{
          width: '*',
          stack: [
            html2doc(introEl.innerHTML.trim()),
            {
              margin: [0, 20],
              image: 'radar',
              width: 340,
              height: 340,
              alignment: 'center'
            }
          ]
        }]
      }];

      Object.keys( this.recommendations ).forEach( (category, i) => {
        content.push( this.recommendationPage(category, i, this.recommendations[category], this.scores[i], this.benchmark[i]));
      });

      return {
        content,
        header : (currentPage, pageCount, pageSize) => this.header(currentPage, pageCount, pageSize),
        footer : (currentPage, pageCount) => this.footer(currentPage, pageCount),
        background : (currentPage, pageSize) => this.background(currentPage, pageSize),
        pageSize : 'A4',
        pageMargins: [20, 140, 20, 0],
        defaultStyle : {
          font: 'HelveticaNeue',
          fontSize: 11,
          lineHeight: 1.25,
          color: '#0F292F'
        },
        styles : {
          
        },
        images : {
          header: images.pdfHeader,
          radar: this.radarImage
        }
      };
    },
  },

  watch : {
    radarImage(v){
      if( !v ){
        return;
      }
      this.update();
    },
    docBase64(v){
      if( v ){
        this.ready = true;
      }
    }
  },

  created(){
    pdfmake.fonts = {
      HelveticaNeue: {
        normal: `${this.fontBase}/HelveticaNeue/HelveticaNeue-Light.ttf`,
        bold: `${this.fontBase}/HelveticaNeue/HelveticaNeue-Bold.ttf`,
        italics: `${this.fontBase}/HelveticaNeue/HelveticaNeue-Italic.ttf`,
        bolditalics: `${this.fontBase}/HelveticaNeue/HelveticaNeue-BoldItalic.ttf`
      },
      Tungsten : {
        normal: `${this.fontBase}/Tungsten/Tungsten-Medium.ttf`,
        bold: `${this.fontBase}/Tungsten/Tungsten-Semibold.ttf`,
      }
    };
  },

  mounted(){
    if( this.radarImage ){
      this.update();
    }
    $(this.$refs.iframe).appendTo('body');
  },

  methods: {
    async update(){
      const pdfDoc = await this.getPdfDoc();
      pdfDoc.getBase64( base64 => this.docBase64 = base64 );
      pdfDoc.getDataUrl( url => this.iframeSrc = url );
    },
    onChartImage( image ){
      this.radarImage = image;
    }, 
    header(currentPage, pageCount, pageSize){
      return currentPage === 1  ? [{
        svg: images.proofpointLogoSvg,
        width: 120,
        margin: [20,20,20,10]
      },{
        text: 'Insider Threat Risk Assessment',
        style: {
          font: 'Tungsten',
          fontSize: 20,
          color: '#ffffff',
          lineHeight: 1.2
        },
        margin: [20,0]
      },{
        text: 'How Does Your Organization Stack Up?',
        style: {
          font: 'Tungsten',
          fontSize: 34,
          bold: true,
          color: '#ffffff',
          lineHeight: 1
        },
        margin: [20,0]
      }] : [{
        margin: 20,
        alignment: 'right',
        style : {
          fontSize: 9
        },
        text: [
          'How Does Your Organization Stack Up?'.toUpperCase(),
          '  |  ',{
            text: 'Insider Risk Assessment'.toUpperCase(),
            style: { bold: true}
          }
        ]
      }];
    },
    footer(currentPage, pageCount){
      return [
        `page ${currentPage} of ${pageCount}`
      ];
    },
    background(currentPage, pageSize){
      return currentPage === 1 ? [{
        image: 'header',
        width: pageSize.width
      }] : [];
    },

    async createDoc(){
      const introEl = document.createElement('div');
      introEl.innerHTML = markdown.parse(_('Results Section'));
      Array.prototype.forEach.call( introEl.querySelectorAll('h1,h2,h3'), node => node.parentNode.removeChild(node) );

      this.images = {
          header: images.pdfHeader,
          radar: this.radarImage
      };

      if( this.config.fields.partner_logo ){
        this.images.partner = await toDataURL(this.config.fields.partner_logo.url);
      }

      const content = [{
        margin: [0,30,0,0],
        columnGap : 25,
        columns: [{
          width: 170,
          stack: this.toc()
          
        },{
          width: '*',
          stack: [
            html2doc(introEl.innerHTML.trim()),
            {
              margin: [0, 20],
              image: 'radar',
              width: 340,
              height: 340,
              alignment: 'center'
            }
          ]
        }]
      }];

      Object.keys( this.recommendations ).forEach( (category, i) => {
        content.push( this.recommendationPage(category, i, this.recommendations[category], this.scores[i], this.benchmark[i]));
      });      

      return {
        content,
        header : (currentPage, pageCount, pageSize) => this.header(currentPage, pageCount, pageSize),
        footer : (currentPage, pageCount) => this.footer(currentPage, pageCount),
        background : (currentPage, pageSize) => this.background(currentPage, pageSize),
        pageSize : 'A4',
        pageMargins: [20, 140, 20, 0],
        defaultStyle : {
          font: 'HelveticaNeue',
          fontSize: 11,
          lineHeight: 1.25,
          color: '#0F292F'
        },
        styles : {
          
        },
        images : this.images
      };
    },

    async getPdfDoc(){
      const doc = await this.createDoc();
      return pdfmake.createPdf(doc);
    },

    toc( active ){
      const body = [];
      Object.keys(this.recommendations).forEach( (category,i) => {
        body.push([{
          text : category,
          linkToPage : i+2,
          bold : active === i,
          margin: [0,0,0,5],
          style : {
            fontSize: 10
          }
        },{
          text: this.scores[i]+'%',
          linkToPage : i+2,
          margin: [0,0,0,5],
          style : {
            fontSize: 10,
            bold: true,
            alignment: 'right',
            color: '#3561AB'
          }
        }]);
      });
      const toc = [{
        layout: 'noBorders',
        table: {
          headerRows: 0,
          widths: ['*', 30],
          body
        },
      }];
      if(this.images.partner){
        toc.push({
          image: 'partner',
          marginTop: 30,
          width: 170
        });
      }
      return toc;
    },

    recommendationPage( category, i, recommendation, score, benchmark ){
      const node = document.createElement('div');
      node.innerHTML = markdown.parse(recommendation);
      Array.prototype.forEach.call( node.querySelectorAll('h1, h2, h3'), h => {
        h.innerHTML = h.innerHTML.toUpperCase();
      });
      return {
        pageBreak: 'before',
        columnGap : 25,
        columns: [{
          width: 170,
          stack: this.toc(i)
          
        },{
          width: '*',
          style : {
            fontSize: 9,
            lineHeight: 1.2
          },
          stack: [
            {
              text: category.toUpperCase(),
              style : {
                fontSize: 30,
                font: 'Tungsten',
                lineHeight: 1
              },
              margin: [0,0,0,0]
            },{
              layout: 'noBorders',
              margin: [0, 6],
              table: {
                widths: [80,'*'],
                headerRows: 0,
                body : [
                  [{
                    style: {
                      bold: true
                    },
                    text: [{
                      text: 'Score:',
                      margin: [0,0,4,0]
                    },' ',{
                      text: `${score}%`,
                      fillColor: score >= benchmark ? GREEN : RED
                    }]
                  },{
                    layout: 'noBorders',
                    table : {
                      widths: [score+'%', '*'],
                      body: [
                        [{
                          fillColor: score >= benchmark ? GREEN : RED,
                          text: ' ',
                          style: {fontSize: 4}
                        },{
                          fillColor: '#EFEFF0',
                          text: ' ',
                          style: {fontSize: 4}
                        }]
                      ]
                    }
                  }],
                  [{
                    style: {
                      bold: true
                    },
                    text: [{
                      text: 'Industry:',
                      margin: [0,0,4,0]
                    },' ',{
                      text: `${benchmark}%`
                    }]
                  },{
                    layout: 'noBorders',
                    table : {
                      widths: [benchmark+'%', '*'],
                      body: [
                        [{
                          fillColor: '#5F6269',
                          text: ' ',
                          style: {fontSize: 4}
                        },{
                          fillColor: '#EFEFF0',
                          text: ' ',
                          style: {fontSize: 4}
                        }]
                      ]
                    }
                  }]
                ]
              }
            },
            html2doc(node.innerHTML)
          ]
        }]
      };
    }
  }

};
</script>

<!-- SCSS Style -->
<style lang="scss" scoped>
.ResultsPdf {
  display: inline-block;
  &__Chart {
    position: absolute;
    left: -1000em;
    width: 450px;
    height: 450px;

  }
  &__Iframe {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000;
    display: block;
    width: 100vw;
    height: 100vh;
  }
}

</style>