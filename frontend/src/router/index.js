import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Register from '../components/Auth/Register.vue';
import Login from '../components/Auth/Login.vue';

// 1. On supprime l'import de AdminDashboard car le fichier n'existe plus (fusionné)
// import AdminDashboard from '../views/AdminDashboard.vue'; 

// 2. On garde AdminPlanning qui contient TOUT (Users + Planning)
import AdminPlanning from '../views/AdminPlanning.vue';
import ClientDashboard from '../views/ClientDashboard.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  
  // --- Routes Admin ---
  { 
    path: '/admin-dashboard', 
    component: AdminPlanning, // <--- CORRECTION : On pointe vers AdminPlanning
    meta: { requiresAuth: true, requiredRole: 'admin' } 
  },
  // (Optionnel) On peut garder cette route aussi si vous l'utilisez ailleurs
  { 
    path: '/admin-planning', 
    component: AdminPlanning, 
    meta: { requiresAuth: true, requiredRole: 'admin' } 
  },

  // --- Route Client ---
  { 
    path: '/client-dashboard', 
    component: ClientDashboard, 
    meta: { requiresAuth: true, requiredRole: 'client' } 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const currentUserRole = localStorage.getItem('userRole'); 
  const isAuthenticated = !!currentUserRole; 

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirection vers Login si pas connecté
    return next({ path: '/login' });
  } 
  
  if (to.meta.requiredRole) {
      // L'admin a tous les droits
      if (currentUserRole === 'admin') {
          return next();
      }
      
      // Vérification stricte du rôle pour les autres
      if (currentUserRole !== to.meta.requiredRole) {
          alert("Accès non autorisé.");
          return next({ path: '/' }); 
      }
  }

  next();
});

export default router;