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
      alert(`Connecté en tant qu'administrateur ! Redirection vers le tableau de bord admin...`);
      router.push('/admin-dashboard');
    } else if (userRole === 'normal') {
      alert('Connecté en tant qu\'utilisateur normal ! Redirection vers le tableau de bord utilisateur...');
      router.push('/dashboard');
    } else {
      alert(`Connecté ! Rôle inconnu (${userRole}). Redirection par défaut...`); 
      router.push('/dashboard'); 
    }

  } catch (e) {
    alert(e?.response?.data?.error || 'Erreur de connexion (Serveur non joignable ou erreur interne)'); 
  }
};
</script>