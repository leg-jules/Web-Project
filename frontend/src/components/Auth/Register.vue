<template>
  <div class="register-container">
    
    <div class="register-card">
      <div class="header">
        <h1 class="app-title">MyPlanning<span class="dot">.</span></h1>
        <h2>Create an Account</h2>
        <p class="subtitle">Join us to manage your appointments effortlessly.</p>
      </div>

      <form @submit.prevent="submit" class="register-form">
        
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username"
            v-model="form.username" 
            type="text" 
            placeholder="JohnDoe" 
            required 
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            placeholder="name@company.com" 
            required 
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="••••••••" 
            required 
            class="input-field"
          />
        </div>

        <button type="submit" class="btn-submit">
          Sign Up
        </button>
      </form>

      <div class="footer">
        <p>Already have an account? <RouterLink to="/login">Log in</RouterLink></p>
        <RouterLink to="/" class="back-link">← Back to Home</RouterLink>
      </div>
    </div>

    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router'; // Import router for redirection
import api from '../../services/api';

const form = reactive({ username: '', email: '', password: '' });
const router = useRouter();

const submit = async () => {
  try {
    await api.post('/auth/register', form);
    alert('Registration successful! Please log in.');
    router.push('/login'); // Redirect to login page after success
  } catch (e) {
    console.error(e);
    alert(e?.response?.data?.error || 'Registration failed. Please try again.');
  }
};
</script>

<style scoped>
/* --- LAYOUT & BACKGROUND --- */
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fc;
  font-family: 'Segoe UI', sans-serif;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* --- CARD DESIGN --- */
.register-card {
  background: white;
  width: 100%;
  max-width: 420px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  z-index: 10;
  position: relative;
  border: 1px solid #f1f5f9;
}

/* --- HEADER --- */
.header {
  text-align: center;
  margin-bottom: 30px;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
  display: block;
}
.dot { color: #3b82f6; }

h2 {
  font-size: 1.8rem;
  color: #1e293b;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* --- FORM --- */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.input-field {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  background-color: #fff;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: #94a3b8;
}

/* --- BUTTON --- */
.btn-submit {
  margin-top: 10px;
  background-color: #0f172a; /* Darker button for Register differentiation */
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-submit:hover {
  background-color: #1e293b;
}

.btn-submit:active {
  transform: scale(0.98);
}

/* --- FOOTER --- */
.footer {
  margin-top: 25px;
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.footer a:hover {
  text-decoration: underline;
}

.back-link {
  color: #94a3b8 !important;
  font-size: 0.85rem;
}

/* --- DECORATION (BLOBS) --- */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 1;
  opacity: 0.5;
}

.blob-1 {
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: #dbeafe;
}

.blob-2 {
  bottom: -50px;
  left: -50px;
  width: 300px;
  height: 300px;
  background: #e0e7ff;
}
</style>