import Vue from "vue";
import VueRouter from "vue-router";

// Components
import App from "./components/App.vue";

const router = new VueRouter({
    routes: [{
        path: "/",
        component: App
    }, {
        path: "*",
        redirect: "/"
    }]
});

export default router;
