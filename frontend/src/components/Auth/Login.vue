<template>
  <form @submit.prevent="submit">
    <input v-model="form.email" type="email" placeholder="Email" required />
    <input v-model="form.password" type="password" placeholder="Mot de passe" required />
    <button>Connexion</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const form = reactive({ email: '', password: '' });
const router = useRouter();

const submit = async () => {
  try {
    const response = await api.post('/auth/login', form);
    
    const userRole = response.data.user.role; 
    localStorage.setItem('userRole', userRole);
    
    console.log("Rôle utilisateur lu par le frontend :", userRole); 

    if (userRole === 'admin') {
      alert(`Logged in as administrator! Redirecting to the admin dashboard...`);
      router.push('/admin-dashboard');
    } else if (userRole === 'employee') {
      alert('Logged in as employee! Redirecting to the employee dashboard...');
      router.push('/employee-dashboard');
      } else if (userRole === 'client') {
      alert('Logged in as client! Redirecting to the client dashboard...');
      router.push('/client-dashboard');
    } else {
      alert(`You do not have an assigned role. Contact the admin.`); 
    }

  } catch (e) {
    alert(e?.response?.data?.error || 'Erreur de connexion (Serveur non joignable ou erreur interne)'); 
  }
};
</script>