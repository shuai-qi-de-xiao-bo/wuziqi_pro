import Vue from 'vue'
import Router from 'vue-router'
import DefaultLayout from './layouts/Default.vue'
import Index from './views/Index.vue'
import magicCube from './views/magicCube.vue'
import About from './views/About.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Index
        },
        {
          path: '/magic_cube',
          name: '/magicCube',
          component: magicCube
        },
        {
          path: '/about',
          name: 'about',
          component: About
        }
      ]
    }
  ]
})
