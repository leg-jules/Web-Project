import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Register from '../components/Auth/Register.vue';
import Login from '../components/Auth/Login.vue';


import AdminPlanning from '../views/AdminPlanning.vue';
import ClientDashboard from '../views/ClientDashboard.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  
  { path: '/admin-planning', component: AdminPlanning, meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/client-dashboard', component: ClientDashboard, meta: { requiresAuth: true, requiredRole: 'client' } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const currentUserRole = localStorage.getItem('userRole'); 
  const isAuthenticated = !!currentUserRole; 

  if (to.meta.requiresAuth && !isAuthenticated) {
$    return next({ path: '/login' });
  } 
  
  if (to.meta.requiredRole) {
      if (currentUserRole === 'admin') {
          return next();
      }
      
      if (currentUserRole !== to.meta.requiredRole) {
          alert("Accès non autorisé.");
          return next({ path: '/' }); 
      }
  }

  next();
});

export default router;