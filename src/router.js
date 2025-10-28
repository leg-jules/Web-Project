import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import About from './components/About.vue'
import UserList from './components/UserList.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/users', component: UserList }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router


