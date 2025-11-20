<template>
  <div class="page-wrapper" :class="{ 'dark-mode': isDarkMode }">
    <div class="dashboard-container">
      <div class="header-row">
          <div class="header-text">
            <h1 class="main-title">Espace Client</h1>
            <p class="subtitle">Bienvenue, gérez vos rendez-vous en toute simplicité.</p>
          </div>
          <button @click="toggleTheme" class="theme-toggle-btn">
              {{ isDarkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre' }}
          </button>
      </div>

      <div class="tabs">
          <button :class="{ active: currentTab === 'planning' }" @click="currentTab = 'planning'">📅 Mes Rendez-vous</button>
          <button :class="{ active: currentTab === 'booking' }" @click="currentTab = 'booking'">➕ Nouveau RDV</button>
      </div>

      <section v-if="currentTab === 'planning'" class="tab-content">
          <div class="card calendar-section">
              <h2 class="section-title">Mon Agenda</h2>
              <p class="hint-text">Vos rendez-vous confirmés. Cliquez pour annuler.</p>
              <hr class="divider">
              <FullCalendar ref="fullCalendarRef" :options="calendarOptions" class="full-calendar-custom" />
          </div>
      </section>

      <section v-if="currentTab === 'booking'" class="tab-content">
          <div class="card booking-section">
              <h2 class="section-title">Demander un rendez-vous</h2>
              <form @submit.prevent="requestAppointment" class="booking-form">
                  <div class="form-group">
                      <label>Professionnel</label>
                      <select v-model="newAppointment.employeeId" required>
                          <option disabled value="">-- Choisir --</option>
                          <option v-for="emp in employees" :key="emp.id" :value="emp.id">👤 {{ emp.username }}</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label>Prestation</label>
                      <input v-model="newAppointment.description" placeholder="Ex: Coupe Homme..." required />
                  </div>
                  <div class="form-row">
                      <div class="form-group half">
                          <label>Début</label>
                          <input v-model="newAppointment.startTime" type="datetime-local" required />
                      </div>
                      <div class="form-group half">
                          <label>Fin</label>
                          <input v-model="newAppointment.endTime" type="datetime-local" required />
                      </div>
                  </div>
                  <div class="form-actions">
                      <button type="submit" class="btn-primary btn-large">Confirmer</button>
                  </div>
              </form>
          </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import listPlugin from '@fullcalendar/list';
import api from '../services/api'; 

const currentTab = ref('planning');
const isDarkMode = ref(false);
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };
const fullCalendarRef = ref(null);
const employees = ref([]);

const newAppointment = reactive({
    employeeId: '',
    description: '',
    startTime: '',
    endTime: ''
});

onMounted(() => {
    loadEmployees();
});

// --- NOUVELLES ROUTES API ---

const loadEmployees = async () => {
    try {
        // Appel à la route CLIENT
        const res = await api.get('/client/employees');
        employees.value = res.data;
    } catch (e) { console.error("Erreur chargement employés", e); }
};

const fetchClientEvents = async (info, successCallback, failureCallback) => {
    try {
        // Appel à la route CLIENT (retourne déjà filtré par le backend)
        const res = await api.get('/client/appointments');
        
        const myEvents = res.data.map(appt => ({
            id: String(appt.id),
            title: `${appt.description} (avec ${appt.employee ? appt.employee.username : 'Pro'})`,
            start: appt.startTime,
            end: appt.endTime,
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb'
        }));

        successCallback(myEvents);
    } catch (e) { failureCallback(e); }
};

const requestAppointment = async () => {
    try {
        // Plus besoin d'envoyer clientId, le backend le prend du token
        await api.post('/client/appointments', {
            employeeId: Number(newAppointment.employeeId),
            startTime: newAppointment.startTime,
            endTime: newAppointment.endTime,
            description: newAppointment.description
        });

        alert('✅ Rendez-vous confirmé !');
        newAppointment.description = '';
        newAppointment.startTime = '';
        newAppointment.endTime = '';
        newAppointment.employeeId = '';

        currentTab.value = 'planning';
        setTimeout(() => { if(fullCalendarRef.value) fullCalendarRef.value.getApi().refetchEvents(); }, 100);
    } catch (e) { alert(e.response?.data?.message || "Erreur lors de la prise de rendez-vous."); }
};

const handleEventClick = async (info) => {
    if (confirm(`Annuler ce rendez-vous ?`)) {
        try {
            await api.delete(`/client/appointments/${info.event.id}`);
            info.event.remove();
            alert("Rendez-vous annulé.");
        } catch (e) { alert("Impossible d'annuler."); }
    }
};

const calendarOptions = reactive({
    plugins: [timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: 'fr',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' },
    slotMinTime: "08:00:00",
    slotMaxTime: "20:00:00",
    allDaySlot: false,
    height: 'auto',
    events: fetchClientEvents,
    eventClick: handleEventClick
});
</script>

<style scoped>
/* (Même style que précédemment) */
.page-wrapper {
    --bg-main: #f4f6f9;
    --bg-card: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e2e8f0;
    --input-bg: #ffffff;
    --accent-color: #3b82f6;
    min-height: 100vh; width: 100vw; background-color: var(--bg-main); color: var(--text-primary);
    padding: 40px 20px; box-sizing: border-box; overflow-x: hidden;
    transition: background-color 0.3s, color 0.3s;
}
.page-wrapper.dark-mode {
    --bg-main: #1a1a1a; --bg-card: #2d2d2d; --text-primary: #e0e0e0; --text-secondary: #a0a0a0; --border-color: #444444; --input-bg: #3a3a3a;
}
.dashboard-container { max-width: 1000px; margin: 0 auto; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.main-title { margin: 0; font-size: 2rem; }
.subtitle { margin: 5px 0 0 0; color: var(--text-secondary); }
.theme-toggle-btn { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 15px; border-radius: 20px; cursor: pointer; }
.tabs { display: flex; gap: 15px; margin-bottom: 25px; justify-content: center; }
.tabs button { padding: 12px 30px; cursor: pointer; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 30px; color: var(--text-secondary); }
.tabs button.active { background: var(--accent-color); color: white; border-color: var(--accent-color); }
.card { background: var(--bg-card); padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid var(--border-color); }
.booking-form { display: flex; flex-direction: column; gap: 20px; max-width: 600px; margin: 0 auto; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-row { display: flex; gap: 20px; } .form-group.half { flex: 1; }
input, select { padding: 12px; border: 1px solid var(--border-color); background-color: var(--input-bg); color: var(--text-primary); border-radius: 8px; }
.btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; width: 100%; }
:deep(.fc) { --fc-page-bg-color: var(--bg-card); --fc-neutral-bg-color: var(--bg-main); color: var(--text-primary); }
</style>