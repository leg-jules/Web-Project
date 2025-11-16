<template>
  <form @submit.prevent="submit">
    <input v-model="form.email" type="email" placeholder="Email" required />
    <input v-model="form.password" type="password" placeholder="Mot de passe" required />
    <button>Connexion</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import api from '../../services/api';
const form = reactive({ email: '', password: '' });
const submit = async () => {
  try {
    await api.post('/auth/login', form);
    alert('Connecté !');
  } catch (e) {
    alert(e?.response?.data?.error || 'Erreur');
  }
};
</script>
