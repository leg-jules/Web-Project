<template>
  <div class="page-wrapper" :class="{ 'dark-mode': isDarkMode }">
    <div class="dashboard-container">
      <div class="header-row">
          <div class="header-text">
            <h1 class="main-title">Customer Area</h1>
            <p class="subtitle">Welcome, manage your appointments with ease.</p>
          </div>
          <div class="header-actions">
            <button @click="toggleTheme" class="theme-toggle-btn">
                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <button @click="logout" class="btn-logout">Logout</button>
          </div>
      </div>

      <div class="tabs">
          <button :class="{ active: currentTab === 'planning' }" @click="currentTab = 'planning'">My Appointments</button>
          <button :class="{ active: currentTab === 'booking' }" @click="currentTab = 'booking'">New Appointment</button>
          <button :class="{ active: currentTab === 'invoices' }" @click="loadMyInvoices">My Invoices</button>
      </div>

      <section v-if="currentTab === 'planning'" class="tab-content">
          <div class="card calendar-section">
              <h2 class="section-title">My Schedule</h2>
              <p class="hint-text">Your confirmed appointments. Click to cancel.</p>
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
              
                          <div class="event-line worker">
                              With {{ arg.event.extendedProps.employeeName }}
                          </div>
                      </div>
                  </template>
              </FullCalendar>

          </div>
      </section>

      <section v-if="currentTab === 'booking'" class="tab-content">
          <div class="card booking-section">
              <h2 class="section-title">Request an Appointment</h2>
              <form @submit.prevent="requestAppointment" class="booking-form">
                  <div class="form-group">
                      <label>Professional</label>
                      <select v-model="newAppointment.employeeId" required>
                          <option disabled value="">-- Choose --</option>
                          <option v-for="emp in employees" :key="emp.id" :value="emp.id">👤 {{ emp.name }}</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label>Service</label>
                      <input v-model="newAppointment.description" placeholder="Ex: Men's Haircut..." required />
                  </div>
                  <div class="form-row">
                      <div class="form-group half">
                          <label>Start</label>
                          <input v-model="newAppointment.startTime" type="datetime-local" required />
                      </div>
                      <div class="form-group half">
                          <label>End</label>
                          <input v-model="newAppointment.endTime" type="datetime-local" required />
                      </div>
                  </div>
                  <div class="form-actions">
                      <button type="submit" class="btn-primary btn-large">Confirm</button>
                  </div>
              </form>
          </div>
        </section>

        <section v-if="currentTab === 'invoices'" class="tab-content">
            <div class="card invoice-section">
                <h2 class="section-title">My Invoices</h2>
                <p class="hint-text">Find here the history of your past services.</p>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Service</th>
                            <th>Duration</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="inv in myInvoices" :key="inv.id">
                            <td>{{ new Date(inv.startTime).toLocaleDateString() }}</td>
                            <td>
                                <strong>{{ inv.description }}</strong><br>
                                <span class="sub-text">with {{ inv.employeeName }}</span>
                            </td>
                            <td>{{ calculateDuration(inv.startTime, inv.endTime) }}</td>
                            
                            <td class="price-cell">
                                {{ calculatePrice(inv.startTime, inv.endTime, inv.hourlyRate) }} €
                            </td>
                            
                            <td>
                                <span v-if="isPast(inv.endTime)" class="badge paid">Paid
                                </span>
                                <span v-else class="badge upcoming">Upcoming</span>
                            </td>
                        </tr>
                        
                        <tr v-if="myInvoices.length === 0">
                            <td colspan="5" style="text-align:center; padding: 20px;">No invoices available.</td>
                        </tr>
                    </tbody>             
                 </table>
            </div>
        </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 
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
const router = useRouter(); 

const newAppointment = reactive({
    employeeId: '',
    description: '',
    startTime: '',
    endTime: ''
});

const logout = () => {
    localStorage.removeItem('userRole');
    router.push('/login');
};

onMounted(() => {
    loadEmployees();
});


const loadEmployees = async () => {
    try {
        const res = await api.get('/client/employees');
        employees.value = res.data;
    } catch (e) { console.error("Error loading employees", e); }
};

const fetchClientEvents = async (info, successCallback, failureCallback) => {
    try {
        const res = await api.get('/client/appointments');
        
        const myEvents = res.data.map(appt => ({
            id: String(appt.id),
            title: appt.description || 'Appointment',           
            start: appt.startTime,
            end: appt.endTime,
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            extendedProps: {
                employeeName: appt.employeeName || 'Unknown'
            }
        }));

        successCallback(myEvents);
    } catch (e) { failureCallback(e); }
};

const requestAppointment = async () => {
    try {
        await api.post('/client/appointments', {
            employeeId: Number(newAppointment.employeeId),
            startTime: newAppointment.startTime,
            endTime: newAppointment.endTime,
            description: newAppointment.description
        });

        alert('Appointment confirmed!');
        newAppointment.description = '';
        newAppointment.startTime = '';
        newAppointment.endTime = '';
        newAppointment.employeeId = '';

        currentTab.value = 'planning';
        setTimeout(() => { if(fullCalendarRef.value) fullCalendarRef.value.getApi().refetchEvents(); }, 100);
    } catch (e) { alert(e.response?.data?.message || "Error during appointment booking."); }
};

const handleEventClick = async (info) => {
    if (confirm(`Cancel this appointment?`)) {
        try {
            await api.delete(`/client/appointments/${info.event.id}`);
            info.event.remove();
            alert("Appointment cancelled.");
        } catch (e) { alert("Unable to cancel."); }
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
    events: fetchClientEvents,
    eventClick: handleEventClick
});

const myInvoices = ref([]);


const loadMyInvoices = async () => {
    currentTab.value = 'invoices';
    try {
        const res = await api.get('/client/appointments');
            myInvoices.value = res.data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
    } catch (e) { 
        console.error("Error loading invoices", e); 
    }
};

const isPast = (dateEnd) => {
    return new Date() > new Date(dateEnd);
};

const calculateDuration = (start, end) => {
    const durationMs = new Date(end) - new Date(start);
    const hours = durationMs / (1000 * 60 * 60);
    return hours.toFixed(1) + ' h'; 
};

const calculatePrice = (start, end, rate) => {
    const durationMs = new Date(end) - new Date(start);
    const hours = durationMs / (1000 * 60 * 60);
    const effectiveRate = rate ? parseFloat(rate) : 50; 
    return (hours * effectiveRate).toFixed(2);
};
</script>

<style scoped>
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

.header-actions { display: flex; align-items: center; gap: 10px; }

.theme-toggle-btn { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 15px; border-radius: 20px; cursor: pointer; }

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
.tabs button { padding: 12px 30px; cursor: pointer; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 30px; color: var(--text-secondary); }
.tabs button.active { background: var(--accent-color); color: white; border-color: var(--accent-color); }
.card { background: var(--bg-card); padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid var(--border-color); }
.booking-form { display: flex; flex-direction: column; gap: 20px; max-width: 600px; margin: 0 auto; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-row { display: flex; gap: 20px; } .form-group.half { flex: 1; }
input, select { padding: 12px; border: 1px solid var(--border-color); background-color: var(--input-bg); color: var(--text-primary); border-radius: 8px; }
.btn-primary { background-color: var(--accent-color); color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; width: 100%; }
:deep(.fc) { --fc-page-bg-color: var(--bg-card); --fc-neutral-bg-color: var(--bg-main); color: var(--text-primary); }
.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.data-table th { background: var(--border-color); padding: 10px; text-align: left; }
.data-table td { padding: 12px; border-bottom: 1px solid var(--border-color); }
.price-cell { font-weight: bold; color: var(--accent-color); font-size: 1.1rem; }
.badge.paid { background-color: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; }
.sub-text { font-size: 0.85rem; color: var(--text-secondary); }
.badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;}
.badge.paid { background-color: #27ae60; color: white; }
.badge.upcoming { background-color: #f39c12; color: white; }

:deep(.fc-event-main-frame) {
    display: block !important;
    white-space: normal !important;
    overflow: visible !important;
}

.custom-event-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 3px;
    font-family: 'Segoe UI', sans-serif;
}

.event-line.time {
    font-size: 0.75rem;
    font-weight: normal;
    opacity: 0.9;
}

.event-line.title {
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 2px;
}

.event-line.worker {
    font-size: 0.85rem;
    font-style: italic;
    border-top: 1px solid rgba(255,255,255,0.3);
    margin-top: 2px;
    padding-top: 2px;
}
</style>