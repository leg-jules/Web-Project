<template>
  <form @submit.prevent="submit">
    <input v-model="form.username" placeholder="Pseudo" required />
    <input v-model="form.email" type="email" placeholder="Email" required />
    <input v-model="form.password" type="password" placeholder="Mot de passe" required />
    <button>Inscription</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import api from '../../services/api';
const form = reactive({ username: '', email: '', password: '' });
const submit = async () => {
  try {
    await api.post('/auth/register', form);
    alert('Inscrit !');
  } catch (e) {
    alert(e?.response?.data?.error || 'Erreur');
  }
};
</script>
