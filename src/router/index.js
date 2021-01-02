import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/ebook'
  },
  {
    path: '/home',
    component: () => import('../views/home')
  },
  {
    path: '/ebook',
    component: () => import('../views/ebook/index'),
    children: [
      {
        path: ':fileName',
        component: () => import('../components/ebook/EbookReader')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
