<template>
  <!-- page-wrapper assure que le fond prend tout l'écran -->
  <div class="page-wrapper" :class="{ 'dark-mode': isDarkMode }">
    
    <div class="admin-dashboard-container">
      
      <div class="header-row">
          <h1 class="main-title">Administrator Dashboard</h1>
          <button @click="toggleTheme" class="theme-toggle-btn">
              {{ isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode' }}
          </button>
      </div>

      <div class="tabs">
          <button :class="{ active: currentTab === 'users' }" @click="currentTab = 'users'">User Management</button>
          <button :class="{ active: currentTab === 'planning' }" @click="switchToPlanning">Planning & Appointments</button>
      </div>

      <section v-if="currentTab === 'users'" class="tab-content">
        <div class="card add-section">
          <h2>Add New User</h2>
          <form @submit.prevent="addUser" class="inline-form-extended">
            <div class="form-group">
                <input v-model="newUser.email" type="email" placeholder="Email" required />
                <input v-model="newUser.password" type="password" placeholder="Password" required />
                <select v-model="newUser.users_type" required>
                    <option disabled value="">Select Role</option>
                    <option value="admin">Administrator</option>
                    <option value="worker">Employee</option> <option value="client">Client</option>
                </select>
            </div>

            <div v-if="newUser.users_type === 'worker' || newUser.users_type === 'client'" class="extended-fields">
                <hr>
                <p><strong>Profile Details:</strong></p>
                <div class="form-row-compact">
                    <input v-model="newUser.firstName" type="text" placeholder="First Name" required />
                    <input v-model="newUser.lastName" type="text" placeholder="Last Name" required />
                </div>
                <div class="form-row-compact">
                    <input v-model="newUser.phone" type="text" placeholder="Phone" required />
                    <input v-model="newUser.address" type="text" placeholder="Address" required />
                </div>
                <div v-if="newUser.users_type === 'client'" class="form-row-compact">
                  <div class="form-group">
                    <label>Hourly Rate (€):</label>
                    <input v-model="newUser.hourlyRate" type="number" step="0.01" placeholder="Ex: 50.00" />
                  </div>
                </div>
                <div v-if="newUser.users_type === 'client'" class="form-row-compact"></div>
            </div>

            <button type="submit" class="btn-primary full-width">Create User & Profile</button>
          </form>        
        </div>

        <div class="card list-section">
          <h3>User List ({{ users.length }})</h3>
          <p class="hint-text">Click column headers to sort.</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th @click="sort('email')" class="sortable">Email <span v-if="currentSort === 'email'">{{ currentSortDir === 'asc' ? '⬇' : '⬆' }}</span></th>
                <th @click="sort('users_type')" class="sortable">Role <span v-if="currentSort === 'users_type'">{{ currentSortDir === 'asc' ? '⬇' : '⬆' }}</span></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in sortedUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>
                    <span v-if="!user.isEditing">{{ user.email }}</span>
                    <input v-else v-model="user.email" type="email" class="edit-input"/>
                  </td>
                  <td>
                    <span v-if="!user.isEditing" :class="`badge ${user.users_type}`">{{ user.users_type }}</span>
                    <select v-else v-model="user.users_type" class="edit-input">
                      <option value="admin">admin</option>
                      <option value="employee">employee</option>
                      <option value="client">client</option>
                    </select>
                  </td>
                  <td class="actions-cell">
                    <div v-if="!user.isEditing">
                      <button @click="user.isEditing = true" class="btn-icon edit" title="Edit">✏️</button>
                      <button @click="deleteUser(user.id)" class="btn-icon delete" title="Delete">🗑️</button>
                    </div>
                    <div v-else>
                      <button @click="saveUser(user)" class="btn-icon save" title="Save">💾</button>
                      <button @click="user.isEditing = false" class="btn-icon cancel" title="Cancel">❌</button>
                    </div>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

<section v-if="currentTab === 'planning'" class="tab-content">
  <div class="card add-section">
      <h2>Schedule an Appointment</h2>
      <form @submit.prevent="addAppointment" class="appointment-form">
          <div class="form-row">
              <div class="form-group">
                  <label>Worker (Employee):</label>
                  <select v-model="newAppointment.workerId" required>
                      <option disabled value="">Select...</option>
                      <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                        {{ emp.title }}
                      </option>
                  </select>
              </div>
              <div class="form-group">
                  <label>Client:</label>
                  <select v-model="newAppointment.clientId" required>
                      <option disabled value="">Select...</option>
                      <option v-for="cl in clients" :key="cl.id" :value="cl.id">
                        {{ cl.name }}
                      </option>
                  </select>
              </div>
              <div class="form-group flex-grow">
                  <label>Description:</label>
                  <input v-model="newAppointment.description" placeholder="e.g., Haircut + Beard" required />
              </div>
          </div>
          <div class="form-row">
              <div class="form-group">
                  <label>Start:</label>
                  <input v-model="newAppointment.startTime" type="datetime-local" required />
              </div>
              <div class="form-group">
                  <label>End:</label>
                  <input v-model="newAppointment.endTime" type="datetime-local" required />
              </div>
              <div class="form-group button-container">
                  <button type="submit" class="btn-primary">Create Appointment</button>
              </div>
          </div>
      </form>
  </div>

  <div class="card calendar-section">
      <div class="filter-controls">
          <label><strong>Filter by Worker:</strong> </label>
          <select v-model="selectedWorkerId" @change="handleWorkerChange">
              <option value="">View all workers</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.title }}
              </option>
          </select>
      </div>
      <hr>
      <FullCalendar 
          ref="fullCalendarRef"
          :options="calendarOptions"
          class="full-calendar-custom"
      />
  </div>
</section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import api from '../services/api'; 

const currentTab = ref('users'); 
const fullCalendarRef = ref(null);
const isDarkMode = ref(false);
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };

const users = ref([]);
const newUser = reactive({ 
    email: '', 
    password: '', 
    users_type: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    hourlyRate: '' 
});const currentSort = ref('id'); 
const currentSortDir = ref('asc'); 

const employees = ref([]);
const clients = ref([]);
const selectedWorkerId = ref(''); 
const newAppointment = reactive({ 
    workerId: '', 
    clientId: '', 
    startTime: '', 
    endTime: '', 
    description: '' 
});


const fetchUsers = async () => {
  try {
    const res = await api.get('/admin/users');
    users.value = res.data.map(u => ({ ...u, isEditing: false }));
  } catch (e) {
    console.error('Error loading users', e);
  }
};

const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    let modifier = 1;
    if (currentSortDir.value === 'desc') modifier = -1;
    const valA = a[currentSort.value] ? a[currentSort.value].toString().toLowerCase() : '';
    const valB = b[currentSort.value] ? b[currentSort.value].toString().toLowerCase() : '';
    if (valA < valB) return -1 * modifier;
    if (valA > valB) return 1 * modifier;
    return 0;
  });
});

const sort = (s) => {
  if (s === currentSort.value) {
    currentSortDir.value = currentSortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.value = s;
    currentSortDir.value = 'asc';
  }
};
const addUser = async () => {
  try {
    const res = await api.post('/admin/users', newUser);
    const userForDisplay = {
        id: res.data.userId,          
        email: newUser.email,       
        users_type: newUser.users_type,
        isEditing: false
    };

    users.value.push(userForDisplay);

    alert('User created successfully!');
    
    Object.assign(newUser, { 
        email: '', password: '', users_type: '', 
        firstName: '', lastName: '', address: '', phone: '', hourlyRate: '' 
    });

  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || 'Error adding user');
  }
};
const saveUser = async (user) => {
  try {
    await api.put(`/admin/users/${user.id}`, { 
        email: user.email, 
        users_type: user.users_type 
    });
    user.isEditing = false;
    alert('User updated successfully!');
  } catch (e) {
    console.error(e);
    alert('Error updating user');
  }
};

const deleteUser = async (id) => {
  if(!confirm('Are you sure you want to delete this user?')) return;
  try {
    await api.delete(`/admin/users/${id}`);
    users.value = users.value.filter(u => u.id !== id);
  } catch (e) {
    alert('Error deleting user');
  }
};

const switchToPlanning = async () => {
  currentTab.value = 'planning';
  await loadDropdownData();
  setTimeout(() => {
    if(fullCalendarRef.value) fullCalendarRef.value.getApi().render();
  }, 50);
};


const loadDropdownData = async () => {
  try {
    const resWorkers = await api.get('/admin/workers');
    employees.value = resWorkers.data.map(w => ({
        id: w.Worker_ID, 
        title: `${w.Worker_FirstName} ${w.Worker_LastName}`
    }));
    
    const resClients = await api.get('/admin/clients'); 
    clients.value = resClients.data.map(c => ({
        id: c.Client_ID, 
        name: `${c.Client_FirstName} ${c.Client_LastName}`
    }));

  } catch (e) {
    console.error('Error loading planning data (Workers/Clients)', e);
  }
};



const addAppointment = async () => {
  try {
    if (!newAppointment.workerId || !newAppointment.clientId || !newAppointment.startTime || !newAppointment.endTime) {
        return alert("Please fill in all required fields.");
    }
    
    await api.post('/admin/appointments', { 
        ...newAppointment, 
        workerId: Number(newAppointment.workerId), 
        clientId: Number(newAppointment.clientId) 
    });
    
    alert('Appointment created successfully!');
    if (fullCalendarRef.value) fullCalendarRef.value.getApi().refetchEvents();
    
    newAppointment.description = '';
    newAppointment.clientId = '';
  } catch (e) {
    console.error(e);
    alert('Error creating appointment.');
  }
};

const fetchCalendarEvents = async (info, successCallback, failureCallback) => {
  try {
    let url = '/admin/appointments';
    if (selectedWorkerId.value) url += `?workerId=${selectedWorkerId.value}`;
    
    const res = await api.get(url);
    
    const events = res.data.map(appt => {
        const clientName = appt.client 
            ? `${appt.client.Client_FirstName} ${appt.client.Client_LastName}` 
            : 'Unknown Client';
            
        return { 
            id: String(appt.id), 
            title: `${clientName} ${appt.description ? '- ' + appt.description : ''}`, 
            start: appt.startTime, 
            end: appt.endTime, 
            backgroundColor: (String(appt.Worker_ID) === String(selectedWorkerId.value)) ? '#2ecc71' : '#3498db', 
            borderColor: '#2c3e50', 
            extendedProps: { description: appt.description } 
        };
    });
    successCallback(events);
  } catch (e) {
    failureCallback(e);
  }
};

const handleWorkerChange = () => {
  if (fullCalendarRef.value) fullCalendarRef.value.getApi().refetchEvents();
};

const handleEventDrop = async (info) => {
  const newEnd = info.event.end || new Date(info.event.start.getTime() + 3600000);
  try {
    await api.put(`/admin/appointments/${info.event.id}`, { 
        startTime: info.event.start.toISOString(), 
        endTime: newEnd.toISOString(), 
        description: info.event.extendedProps.description 
    });
  } catch(e) {
    info.revert();
    alert('Error moving appointment.');
  }
};

const handleEventClick = async (info) => {
  const action = prompt(`Action for "${info.event.title}":\nType 'del' to DELETE.\nType 'desc' to change DESCRIPTION.`);
  if (action === 'del') {
    if(confirm('Confirm deletion?')) {
        try {
            await api.delete(`/admin/appointments/${info.event.id}`);
            info.event.remove();
        } catch(e) { alert('Error deleting appointment'); }
    }
  } else if (action === 'desc') {
    const newDesc = prompt("New description:", info.event.extendedProps.description);
    if (newDesc) {
        try {
            await api.put(`/admin/appointments/${info.event.id}`, { 
                startTime: info.event.start, 
                endTime: info.event.end, 
                description: newDesc 
            });
            info.event.setExtendedProp('description', newDesc);
            fullCalendarRef.value.getApi().refetchEvents();
        } catch (e) { alert("Error updating description"); }
    }
  }
};

const calendarOptions = reactive({
    plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: 'en',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
    slotMinTime: "08:00:00",
    slotMaxTime: "20:00:00",
    allDaySlot: false,
    height: 'auto',
    editable: true,
    selectable: true,
    events: fetchCalendarEvents,
    eventClick: handleEventClick,
    eventDrop: handleEventDrop,
    eventResize: handleEventDrop
});

onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>


.page-wrapper {
    /* Light Theme */
    --bg-main: #f4f6f9;
    --bg-card: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e2e8f0;
    --input-bg: #ffffff;
    --table-header-bg: #f8f9fa;
    --table-header-text: #2c3e50;
    --table-row-hover: #f8f9fa;
    --tab-inactive-bg: #f1f1f1;
    --tab-inactive-text: #7f8c8d;

    background-color: var(--bg-main);
    color: var(--text-primary);
    transition: background-color 0.3s, color 0.3s;
    
    padding: 40px 20px;
    box-sizing: border-box;
    
    overflow-x: hidden;
}

/* DARK MODE OVERRIDES */
.page-wrapper.dark-mode {
    --bg-main: #1a1a1a;
    --bg-card: #2d2d2d;
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --border-color: #444444;
    --input-bg: #3a3a3a;
    --table-header-bg: #2d2d2d;
    --table-header-text: #ffffff;
    --table-row-hover: #363636;
    --tab-inactive-bg: #333333;
    --tab-inactive-text: #aaaaaa;
}

.admin-dashboard-container {
    max-width: 1200px; 
    margin: 0 auto;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.main-title { 
    text-align: center; 
    color: var(--text-primary); 
    margin: 0;
}

.theme-toggle-btn {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
}
.theme-toggle-btn:hover { transform: scale(1.05); }

.tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); }
.tabs button { 
    padding: 12px 25px; 
    cursor: pointer; 
    background: var(--tab-inactive-bg); 
    border: none; 
    border-radius: 8px 8px 0 0; 
    font-size: 16px; 
    font-weight: 600; 
    color: var(--tab-inactive-text); 
    transition: all 0.3s; 
}
.tabs button:hover { opacity: 0.8; }
.tabs button.active { 
    background: #3498db; 
    color: white; 
    box-shadow: 0 -2px 5px rgba(0,0,0,0.1); 
}

.card { 
    background: var(--bg-card); 
    padding: 20px; 
    border-radius: 8px; 
    box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    margin-bottom: 25px; 
    border: 1px solid var(--border-color); 
}

h2, h3 { color: var(--text-primary); margin-top: 0; }
.hint-text { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px; font-style: italic; }

.inline-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) auto; gap: 10px; align-items: center; }
.appointment-form { display: flex; flex-direction: column; gap: 15px; }
.form-row { display: flex; gap: 20px; flex-wrap: wrap; }
.form-group { display: flex; flex-direction: column; flex: 1; }
.form-group.flex-grow { flex: 2; }

label { font-weight: 600; margin-bottom: 5px; font-size: 0.9rem; color: var(--text-primary); }

input, select { 
    padding: 10px; 
    border: 1px solid var(--border-color); 
    background-color: var(--input-bg);
    color: var(--text-primary);
    border-radius: 5px; 
    font-size: 14px; 
}
input:focus, select:focus {
    outline: 2px solid #3498db;
    border-color: #3498db;
}

.edit-input { width: 90%; padding: 5px; }

.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.data-table th, .data-table td { 
    padding: 12px 15px; 
    text-align: left; 
    border-bottom: 1px solid var(--border-color); 
    color: var(--text-primary);
}

.data-table th { 
    background-color: var(--table-header-bg); 
    color: var(--table-header-text); 
    font-weight: 600; 
    cursor: pointer; 
    user-select: none; 
}
.data-table th:hover { opacity: 0.9; }
.data-table th.sortable { position: relative; }

.data-table tr:hover { background-color: var(--table-row-hover); }

.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.85rem; text-transform: capitalize; }
.badge.admin { background: #e74c3c; color: white; }
.badge.employee { background: #3498db; color: white; }
.badge.client { background: #2ecc71; color: white; }

.btn-primary { 
    background-color: #27ae60; 
    color: white; 
    border: none; 
    padding: 10px 20px; 
    border-radius: 5px; 
    cursor: pointer; 
    font-weight: bold; 
}
.btn-primary:hover { background-color: #219150; }

.button-container { justify-content: flex-end; margin-top: auto; }

.btn-icon { border: none; background: none; cursor: pointer; font-size: 1.2rem; margin: 0 5px; transition: transform 0.2s; }
.btn-icon:hover { transform: scale(1.2); }

.filter-controls { margin-bottom: 15px; display: flex; align-items: center; gap: 10px; color: var(--text-primary); }
.full-calendar-custom { margin-top: 20px; min-height: 600px; }
.hint { margin-top: 10px; font-style: italic; color: var(--text-secondary); font-size: 0.9rem; text-align: center; }

:deep(.fc) {
    --fc-page-bg-color: var(--bg-card);
    --fc-neutral-bg-color: var(--bg-main);
    --fc-list-event-hover-bg-color: var(--table-row-hover);
    --fc-theme-standard-border-color: var(--border-color);
    color: var(--text-primary);
}

:deep(.fc-col-header-cell) {
    background-color: var(--table-header-bg);
    color: var(--text-primary);
}

:deep(.fc-timegrid-slot-label), :deep(.fc-timegrid-axis-cushion) {
    color: var(--text-secondary);
}

:deep(.fc-button-primary) {
    background-color: #3498db;
    border-color: #3498db;
}
:deep(.fc-button-primary:disabled) {
    background-color: var(--bg-main);
    color: var(--text-secondary);
    border-color: var(--border-color);
}
</style>