// Polyfills - remove if unecessary
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Vue from 'vue';
import App from './components/App';
import config from './config';

new Vue({
  el: '#app',
  render: h => h(App, {
    props: { config }
  })
});
