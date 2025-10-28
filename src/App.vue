<template>
  <div id="app">
    <h1>Our second Vue App</h1>
    
    <!-- Navigation -->
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/users">Users</router-link>
    </nav>

    <!-- Router view displays components -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
nav {
  padding: 20px;
}
nav a {
  margin: 0 10px;
  text-decoration: none;
  color: blue;
}
.router-link-active {
  font-weight: bold;
  color: red;
}
</style>


