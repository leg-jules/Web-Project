<template>
  <div>
    <h2>Home Page</h2>
    <img :src="imageUrl" :alt="imageAlt" width="200">
    <p v-if="showMessage">Welcome to our Vue app!</p>
    <button @click="toggleMessage">Toggle Message</button>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      imageUrl: 'https://vuejs.org/images/logo.png',
      imageAlt: 'Vue Logo',
      showMessage: true
    }
  },
  methods: {
    toggleMessage() {
      this.showMessage = !this.showMessage
    }
  }
}
</script>

