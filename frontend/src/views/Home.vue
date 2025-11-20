<template>
  <div class="home-container">
    
    <nav class="navbar">
      <div class="logo">📅 MyPlanning<span class="dot">.</span></div>
      <div class="nav-links">
        <RouterLink to="/login" class="nav-link">Log in</RouterLink>
        <RouterLink to="/register" class="btn-register-small">Sign up</RouterLink>
      </div>
    </nav>

    <main class="hero-section">
      
      <div class="text-content">
        <span class="badge">New: Simplified Management v2.0</span>
        <h1>Your time is precious,<br> <span class="highlight">optimize it.</span></h1>
        <p class="subtitle">
          The online booking solution designed for professionals. 
          Manage your schedule, clients, and appointments from a single, seamless interface.
        </p>
        
        <div class="cta-group">
          <RouterLink to="/register" class="btn-primary">
            Start for free
          </RouterLink>
        </div>

        <div class="trust-badges">
          <span>✅ No commitment</span>
          <span>✅ 24/7 Support</span>
        </div>
      </div>

      <div class="visual-content">
        <div class="calendar-card floating">
          <div class="calendar-header">
            <div class="dots">
              <span class="dot-w red"></span>
              <span class="dot-w yellow"></span>
              <span class="dot-w green"></span>
            </div>
            <div class="month">November 2025</div>
          </div>
          <div class="calendar-body">
            <div class="event-row">
              <div class="time">09:00</div>
              <div class="event-bar blue">Team Meeting</div>
            </div>
            <div class="event-row">
              <div class="time">10:30</div>
              <div class="event-bar purple">Client: Mr. Smith</div>
            </div>
            <div class="event-row">
              <div class="time">13:00</div>
              <div class="event-bar green">Lunch Break</div>
            </div>
            <div class="event-row">
              <div class="time">14:30</div>
              <div class="event-bar orange">Consultation</div>
            </div>
          </div>
          <div class="notification-card floating-delayed">
            <div class="icon">🔔</div>
            <div class="notif-text">
              <strong>New Appointment</strong>
              <small>Just confirmed</small>
            </div>
          </div>
        </div>
      </div>

    </main>

    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

  </div>
</template>

<script setup>
// No JS logic required for styling
</script>

<style scoped>
/* --- 1. GENERAL CONFIG --- */
.home-container {
  min-height: 100vh;
  background-color: #f8f9fc; /* Light SaaS background */
  font-family: 'Segoe UI', Inter, sans-serif;
  color: #1e293b;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* --- 2. NAVIGATION --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 5%;
  z-index: 10;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.logo .dot { color: #3b82f6; }

.nav-links { display: flex; align-items: center; gap: 20px; }

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  transition: color 0.3s;
}
.nav-link:hover { color: #0f172a; }

.btn-register-small {
  padding: 10px 20px;
  background-color: #0f172a;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}
.btn-register-small:hover { transform: translateY(-2px); }

/* --- 3. HERO SECTION --- */
.hero-section {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 0 5%;
  gap: 40px;
  z-index: 5;
}

/* Text Content */
.text-content { max-width: 600px; }

.badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0284c7;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 20px;
}

h1 {
  font-size: 3.5rem;
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 20px;
  color: #0f172a;
}

.highlight {
  color: #3b82f6; /* Main blue */
  background: linear-gradient(120deg, #dbeafe 0%, #dbeafe 100%);
  background-repeat: no-repeat;
  background-size: 100% 30%;
  background-position: 0 88%;
}

.subtitle {
  font-size: 1.15rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 30px;
}

.cta-group { display: flex; gap: 15px; margin-bottom: 30px; }

.btn-primary {
  padding: 15px 30px;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
  transition: all 0.3s;
}
.btn-primary:hover { background: #2563eb; transform: translateY(-2px); }

.btn-secondary {
  padding: 15px 30px;
  background: white;
  color: #334155;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s;
}
.btn-secondary:hover { border-color: #cbd5e1; background: #f1f5f9; }

.trust-badges { display: flex; gap: 20px; font-size: 0.9rem; color: #64748b; }

/* --- 4. CSS ILLUSTRATION (CALENDAR) --- */
.visual-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.calendar-card {
  width: 380px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.calendar-header {
  background: #f8fafc;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.dots { display: flex; gap: 6px; }
.dot-w { width: 10px; height: 10px; border-radius: 50%; }
.red { background: #ef4444; }
.yellow { background: #f59e0b; }
.green { background: #10b981; }
.month { font-weight: 700; color: #334155; font-size: 0.9rem; }

.calendar-body { padding: 20px; display: flex; flex-direction: column; gap: 15px; }

.event-row { display: flex; align-items: center; gap: 15px; }
.time { font-size: 0.8rem; color: #94a3b8; width: 40px; }
.event-bar {
  flex: 1;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding-left: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.blue { background: #eff6ff; color: #3b82f6; border-left: 4px solid #3b82f6; }
.purple { background: #f5f3ff; color: #8b5cf6; border-left: 4px solid #8b5cf6; }
.green { background: #ecfdf5; color: #10b981; border-left: 4px solid #10b981; }
.orange { background: #fff7ed; color: #f97316; border-left: 4px solid #f97316; }

/* Floating Notification Card */
.notification-card {
  position: absolute;
  bottom: -20px;
  left: -20px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #e2e8f0;
  width: 200px;
}

.icon { font-size: 1.5rem; background: #fffbeb; padding: 8px; border-radius: 50%; }
.notif-text { display: flex; flex-direction: column; line-height: 1.2; }
.notif-text strong { font-size: 0.9rem; color: #1e293b; }
.notif-text small { font-size: 0.75rem; color: #64748b; }

/* --- 5. ANIMATIONS & DECORATION --- */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.floating { animation: float 6s ease-in-out infinite; }
.floating-delayed { animation: float 6s ease-in-out 3s infinite; }

/* Background Blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
}
.blob-1 { width: 400px; height: 400px; background: #dbeafe; top: -100px; right: -100px; }
.blob-2 { width: 300px; height: 300px; background: #f3e8ff; bottom: 0; left: -50px; }

/* Mobile Responsive */
@media (max-width: 900px) {
  .hero-section { grid-template-columns: 1fr; text-align: center; padding-top: 40px; }
  h1 { font-size: 2.5rem; }
  .cta-group { justify-content: center; }
  .trust-badges { justify-content: center; margin-bottom: 40px; }
  .visual-content { display: none; /* Hide large calendar on mobile for simplicity */ }
}
</style>