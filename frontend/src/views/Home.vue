<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
    <h1 class="text-3xl font-bold">Bienvenue</h1>
    <p class="text-lg text-center">Veuillez choisir une option :</p>

    <div class="flex gap-4">
      <RouterLink to="/login" class="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition">
        Se connecter
      </RouterLink>

      <RouterLink to="/register" class="px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition">
        S'inscrire
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
// Pas de logique supplémentaire nécessaire
</script>

<style scoped>
</style>
