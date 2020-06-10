import Vue from 'vue'
import App from './App.vue'
import router from './router'

import HyperOdyssey from 'HyperOdyssey';
import Axios from "axios";

Vue.config.productionTip = false;

const axios = Axios.create( {} );
Vue.prototype.$hyperOdyssey = new HyperOdyssey( axios );

new Vue( {
    router,
    render : h => h( App )
} ).$mount( '#app' );
