<template>
  <div class="page-wrapper" :class="{ 'dark-mode': isDarkMode }">
    <div class="dashboard-container">
      
      <div class="header-row">
          <div class="header-text">
            <h1 class="main-title">Employee Dashboard</h1>
            <p class="subtitle">Manage your schedule and track your earnings.</p>
          </div>
          <div class="header-actions">
            <button @click="toggleTheme" class="theme-toggle-btn">
                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <button @click="logout" class="btn-logout">Logout</button>
          </div>
      </div>

      <div class="tabs">
          <button :class="{ active: currentTab === 'planning' }" @click="currentTab = 'planning'">My Schedule</button>
          <button :class="{ active: currentTab === 'wages' }" @click="loadWages">My Wages</button>
      </div>

      <section v-if="currentTab === 'planning'" class="tab-content">
          <div class="card calendar-section">
            <div class="section-header">
                <h2 class="section-title">Schedule</h2>
            </div>
            <hr class="divider">
            
            <FullCalendar ref="fullCalendarRef" :options="calendarOptions" class="full-calendar-custom">
                <template #eventContent="arg">
                    <div class="custom-event-container">
                        <div class="event-line time">
                            {{ arg.timeText }}
                        </div>
                        
                        <div class="event-line title">
                            {{ arg.event.title }}
                        </div>

                        <div class="event-line client">
                            {{ arg.event.extendedProps.clientName }}
                        </div>

                        <div class="event-line info" v-if="arg.event.extendedProps.clientPhone">
                            {{ arg.event.extendedProps.clientPhone }}
                        </div> 

                        <div class="event-line info" v-if="arg.event.extendedProps.clientAddress">
                            {{ arg.event.extendedProps.clientAddress }}
                        </div>
                    </div>                  
                </template>
              </FullCalendar>
          </div>
      </section>

      <section v-if="currentTab === 'wages'" class="tab-content">
          <div class="card">
              <div class="finance-header">
                  <h2 class="section-title">Income Tracker</h2>
                  <div class="total-badge">
                      Estimated Total: <span>{{ totalEarnings }} €</span>
                  </div>
              </div>
              
              <table class="data-table">
                  <thead>
                      <tr>
                          <th>Date</th>
                          <th>Client</th>
                          <th>Service</th>
                          <th>Duration</th>
                          <th>Earnings (20€/h)</th>
                          <th>Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="item in wagesData" :key="item.id">
                          <td>{{ item.date }}</td>
                          <td>{{ item.client }}</td>
                          <td>{{ item.description }}</td>
                          <td>{{ item.duration }} h</td>
                          <td class="money-cell">+ {{ item.wage }} €</td>
                          <td>
                              <span :class="['badge', getStatusClass(item.status)]">
                                  {{ translateStatus(item.status) }}
                              </span>
                          </td>
                      </tr>
                      <tr v-if="wagesData.length === 0">
                          <td colspan="6" style="text-align:center; padding: 20px;">No data available.</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import listPlugin from '@fullcalendar/list';
import api from '../services/api'; 

const currentTab = ref('planning');
const isDarkMode = ref(false);
const wagesData = ref([]);
const router = useRouter(); 

const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };

const logout = () => {
    localStorage.removeItem('userRole');
    router.push('/login');
};

const translateStatus = (status) => {
    if (status === 'Validé' || status === 'Passé') return 'Paid';
    return 'Pending';
};

const getStatusClass = (status) => {
    if (status === 'Validé' || status === 'Passé') return 'paid';
    return 'pending';
};

const fetchWorkerEvents = async (info, successCallback, failureCallback) => {
    try {
        const res = await api.get('/worker/planning');
        successCallback(res.data);
    } catch (e) {
        console.error("Error fetching planning", e);
        failureCallback(e);
    }
};

const calendarOptions = reactive({
    plugins: [timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    
    locale: 'en', 
    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: false,
        hour12: false 
    },
    eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false,
        hour12: false 
    },

    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' },
    slotMinTime: "08:00:00",
    slotMaxTime: "20:00:00",
    allDaySlot: false,
    height: 'auto',
    events: fetchWorkerEvents,
    
    eventClick: (info) => {
        alert(`Client: ${info.event.extendedProps.clientName}\nService: ${info.event.title}`);
    }
});


const loadWages = async () => {
    currentTab.value = 'wages';
    try {
        const res = await api.get('/worker/wages');
        wagesData.value = res.data;
    } catch (e) {
        console.error("Error loading wages", e);
    }
};

const totalEarnings = computed(() => {
    return wagesData.value
        .filter(item => item.status === 'Validé' || item.status === 'Passé') 
        .reduce((sum, item) => sum + parseFloat(item.wage), 0)
        .toFixed(2);
});
</script>

<style scoped>
.page-wrapper {
    --bg-main: #f4f6f9;
    --bg-card: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e2e8f0;
    --input-bg: #ffffff;
    --accent-color: #27ae60; 
    --table-header-bg: #f8f9fa;
    --table-row-hover: #f1f1f1;

    min-height: 100vh; 
    padding: 40px 20px; 
    background-color: var(--bg-main); 
    color: var(--text-primary);
    transition: background-color 0.3s, color 0.3s;
    box-sizing: border-box;
}

.page-wrapper.dark-mode {
    --bg-main: #1a1a1a; 
    --bg-card: #2d2d2d; 
    --text-primary: #e0e0e0; 
    --text-secondary: #a0a0a0; 
    --border-color: #444444; 
    --input-bg: #3a3a3a;
    --table-header-bg: #2d2d2d;
    --table-row-hover: #363636;
}

.dashboard-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; }

.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.main-title { margin: 0; font-size: 2rem; }
.subtitle { margin: 5px 0 0 0; color: var(--text-secondary); }

.header-actions { display: flex; align-items: center; gap: 10px; }

.theme-toggle-btn { 
    background: var(--bg-card); 
    border: 1px solid var(--border-color); 
    color: var(--text-primary); 
    padding: 8px 15px; 
    border-radius: 20px; 
    cursor: pointer; 
    transition: transform 0.2s;
}
.theme-toggle-btn:hover { transform: scale(1.05); }

.btn-logout {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}
.btn-logout:hover { background-color: #c0392b; }

.tabs { display: flex; gap: 15px; margin-bottom: 25px; justify-content: center; }
.tabs button { 
    padding: 12px 30px; 
    cursor: pointer; 
    background: var(--bg-card); 
    border: 1px solid var(--border-color); 
    border-radius: 30px; 
    color: var(--text-secondary); 
    font-weight: 600;
    transition: all 0.3s;
}
.tabs button.active { 
    background: var(--accent-color); 
    color: white; 
    border-color: var(--accent-color); 
}

.card { 
    background: var(--bg-card); 
    padding: 30px; 
    border-radius: 16px; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.05); 
    border: 1px solid var(--border-color);
}

.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-title { margin: 0; }
.divider { border: 0; border-top: 1px solid var(--border-color); margin: 20px 0; }
.btn-pdf { background: var(--accent-color); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }

.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.data-table th { 
    background: var(--table-header-bg); 
    padding: 12px; 
    text-align: left; 
    border-bottom: 2px solid var(--border-color); 
}
.data-table td { 
    padding: 12px; 
    border-bottom: 1px solid var(--border-color); 
}
.data-table tr:hover { background-color: var(--table-row-hover); }

.money-cell { color: var(--accent-color); font-weight: bold; }

.finance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.total-badge { 
    background: var(--accent-color); 
    color: white; 
    padding: 10px 20px; 
    border-radius: 10px; 
    font-weight: bold; 
    font-size: 1.1rem; 
}

.badge { padding: 5px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: capitalize; }
.badge.paid { background: #27ae60; color: white; } 
.badge.pending { background: #f39c12; color: white; } 

:deep(.fc-event-main-frame) {
    display: block !important;
    white-space: normal !important;
    overflow: visible !important;
    height: auto !important;
}

.custom-event-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    font-family: 'Segoe UI', sans-serif;
    color: white; 
}

.event-line.time {
    font-size: 0.75rem;
    opacity: 0.9;
    margin-bottom: 2px;
}

.event-line.title {
    font-weight: bold;
    font-size: 0.9rem;
    line-height: 1.2;
}

.event-line.client {
    font-size: 0.85rem;
    font-weight: 600;
    border-top: 1px solid rgba(255,255,255,0.3);
    margin-top: 4px;
    padding-top: 2px;
}

.event-line.info {
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.95;
    display: flex;
    align-items: center;
    gap: 4px;
}

:deep(.fc) { 
    --fc-page-bg-color: var(--bg-card); 
    --fc-neutral-bg-color: var(--bg-main); 
    color: var(--text-primary); 
}
:deep(.fc-col-header-cell) { background-color: var(--table-header-bg); }
</style>