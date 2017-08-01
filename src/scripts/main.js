import Vue from "vue";
import revuest from "revuest";
import VueRouter from "vue-router";
import VueResource from "vue-resource";


Vue.use(revuest);
Vue.use(VueRouter);
Vue.use(VueResource);

import router from "./router.js";
import App from "./components/App.vue";

new Vue({
    el: "#app",
    router,
    render: h => h(App)
});
