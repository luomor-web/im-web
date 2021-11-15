import Vue from 'vue'
import VueRouter from 'vue-router'
import {getValue} from "@/utils/local-store.js";

Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
]

const router = new VueRouter({
    routes
})


router.beforeEach((to, from, next) => {
    if(to.path === '/login'){
        next()
    }else {
        const token = getValue('token')
        if(token === undefined || token === null || token === ''){
            next('/login')
        }
        next()
    }


})

export default router
