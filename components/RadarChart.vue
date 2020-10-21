<!-- Script -->
<script>
import {Radar, mixins} from 'vue-chartjs';
export default {
  
  extends : Radar,

  mixins : [mixins.reactiveData],

  props : {
    chartdata: {
      type: Object
    },
    options : {
      type: Object
    }
  },

  mounted() {
    this.options.animation = {
      onComplete: () => {
        this.$emit('chart:image', this.$data._chart.toBase64Image());
      }
    }
    this.renderChart( this.chartdata, this.options ); 
  }
};
</script>

<!-- SCSS Style -->
<style lang="scss">

</style>