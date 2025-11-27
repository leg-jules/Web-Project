<template>
  <div class="home-container">
    <div class="card">
      <h1 class="logo">📅 MyPlanning</h1>
      <p class="subtitle">Streamlined appointment management for professionals.</p>
      
      <div class="actions">
        <RouterLink to="/login" class="btn btn-login">
          Log In
        </RouterLink>
        
        <RouterLink to="/register" class="btn btn-register">
          Create Account
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f4f6f9;
  font-family: 'Segoe UI', sans-serif;
  padding: 20px;
}

.card {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  text-align: center;
  width: 100%;
  max-width: 400px;
  border: 1px solid #e2e8f0;
}

.logo {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 800;
}

.subtitle {
  color: #7f8c8d;
  margin-bottom: 40px;
  font-size: 1.1rem;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  display: block;
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-login {
  background-color: #3498db;
  color: white;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}
.btn-login:hover {
  background-color: #2980b9;
}

.btn-register {
  background-color: white;
  color: #3498db;
  border: 2px solid #3498db;
}
.btn-register:hover {
  background-color: #f0f8ff;
}
</style>