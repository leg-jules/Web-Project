import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Register from '../components/Auth/Register.vue';
import Login from '../components/Auth/Login.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/admin-dashboard', component: AdminDashboard, meta:{requiresAuth: true, requiredRole: 'admin'} }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const currentUserRole = localStorage.getItem('userRole'); 
  const isAuthenticated = !!currentUserRole; 

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiredRole && currentUserRole !== to.meta.requiredRole) {
    alert("Accès refusé. Vous n'êtes pas un administrateur.");
    next({ name: 'Home' }); 
  } else {
    next();
  }
});

export default router;
