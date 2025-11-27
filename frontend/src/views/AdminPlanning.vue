<template>
  <!-- page-wrapper ensures background covers the whole screen -->
  <div class="page-wrapper" :class="{ 'dark-mode': isDarkMode }">
    
    <div class="admin-dashboard-container">
      
      <div class="header-row">
        <h1 class="main-title">Administrator Dashboard</h1>
        <div class="header-actions">
            <button @click="toggleTheme" class="theme-toggle-btn">
            {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <button @click="logout" class="btn-logout">Logout</button>
        </div>
      </div>

      <div class="tabs">
        <button :class="{ active: currentTab === 'users' }" @click="currentTab = 'users'">User Management</button>
        <button :class="{ active: currentTab === 'planning' }" @click="switchToPlanning">Planning & Appointments</button>
        <button :class="{ active: currentTab === 'finance' }" @click="loadFinancials">Financials & Payroll</button>
      </div>

      <section v-if="currentTab === 'finance'" class="tab-content">
        <div class="card">
          <h2>Financial Overview</h2>
          <p class="hint-text">Automatic calculation based on appointment duration and client hourly rates.</p>
              
          <div class="finance-summary">
            <div class="summary-box income">
              <h3>Total Invoiced (Revenue)</h3>
              <p>{{ totalRevenue }} €</p>
            </div>
            <div class="summary-box expense">
              <h3>Total Wages (Estimated)</h3>
              <p>{{ totalWages }} €</p>
            </div>
            <div class="summary-box profit">
              <h3>Net Margin</h3>
              <p>{{ (parseFloat(totalRevenue) - parseFloat(totalWages)).toFixed(2) }} €</p>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Employee</th>
                <th>Duration</th>
                <th>Invoice (Client)</th>
                <th>Wage (Employee)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in financialData" :key="item.id">
                <td>{{ item.date }}</td>
                <td>{{ item.clientName }}</td>
                <td>{{ item.workerName }}</td>
                <td>{{ item.duration }}</td>
                <td style="color: #27ae60; font-weight:bold;">{{ item.invoiceAmount }} €</td>
                <td style="color: #d35400;">{{ item.wageAmount }} €</td>
                <td>
                  <button @click="printInvoice(item)" class="btn-icon">Invoice</button>
                  <button @click="printPayslip(item)" class="btn-icon">Payslip</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

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
                <option value="worker">Employee</option> 
                <option value="client">Client</option>
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
                    <option value="worker">employee</option>
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

            <button @click="downloadPlanningPDF" class="btn-pdf">
                📥 Download PDF
            </button>
          </div>
          <hr>
          
          <FullCalendar 
            ref="fullCalendarRef"
            :options="calendarOptions"
            class="full-calendar-custom"
          >
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
                    
                    <div class="event-line worker" v-if="arg.event.extendedProps.workerName">
                      {{ arg.event.extendedProps.workerName }}
                    </div>
                </div>
            </template>
          </FullCalendar>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; 
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import api from '../services/api'; 

const currentTab = ref('users'); 
const fullCalendarRef = ref(null);
const isDarkMode = ref(false);
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };
const router = useRouter();

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
});
const currentSort = ref('id'); 
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

const logout = () => {    
  localStorage.removeItem('userRole');
  router.push('/login');
};

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
            
            title: appt.description || 'Appointment', 
            
            start: appt.startTime, 
            end: appt.endTime, 
            
            backgroundColor: (String(appt.Worker_ID) === String(selectedWorkerId.value)) ? '#2ecc71' : '#3498db', 
            borderColor: '#2c3e50', 
            
            extendedProps: { 
                description: appt.description,
                clientName: clientName,
                clientPhone: appt.client?.Client_Phone || '',
                clientAddress: appt.client?.Client_Address || '',
                workerName: appt.worker ? `${appt.worker.Worker_FirstName}` : '',
                workerPhone: appt.worker?.Worker_Phone || '',
            } 
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

// FINANCIALS
const financialData = ref([]);
const totalRevenue = ref(0);
const totalWages = ref(0);

const loadFinancials = async () => {
    currentTab.value = 'finance';
    try {
        const res = await api.get('/admin/financials');
        financialData.value = res.data;

        totalRevenue.value = res.data.reduce((acc, item) => acc + parseFloat(item.invoiceAmount), 0).toFixed(2);
        totalWages.value = res.data.reduce((acc, item) => acc + parseFloat(item.wageAmount), 0).toFixed(2);
    } catch (e) {
        console.error("Error loading financial data", e);
    }
};

const printInvoice = (item) => {
    alert(`Generating invoice for ${item.clientName}\nAmount: ${item.invoiceAmount}€`);
};

const printPayslip = (item) => {
    alert(`Generating payslip for ${item.workerName}\nWage: ${item.wageAmount}€`);
};


onMounted(() => {
    fetchUsers();
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
    min-height: 100vh;
}

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

.admin-dashboard-container { max-width: 1200px; margin: 0 auto; }

.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.main-title { margin: 0; color: var(--text-primary); }

.header-actions { display: flex; align-items: center; gap: 10px; }

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
.tabs button.active { background: #3498db; color: white; box-shadow: 0 -2px 5px rgba(0,0,0,0.1); }

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

.inline-form-extended { display: flex; flex-direction: column; gap: 15px; }
.appointment-form { display: flex; flex-direction: column; gap: 15px; }
.form-row { display: flex; gap: 20px; flex-wrap: wrap; }
.form-row-compact { display: flex; gap: 10px; margin-top: 10px; }
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
    width: 100%;
    box-sizing: border-box;
}
input:focus, select:focus { outline: 2px solid #3498db; border-color: #3498db; }

.edit-input { padding: 5px; width: 100%; }

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
.full-width { width: 100%; margin-top: 15px; }

.btn-icon { border: none; background: none; cursor: pointer; font-size: 1rem; margin: 0 5px; transition: transform 0.2s; }
.btn-icon:hover { transform: scale(1.1); }
.btn-icon.delete { color: #e74c3c; }
.btn-icon.edit { color: #f39c12; }
.btn-icon.save { color: #27ae60; }

.btn-pdf { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }

.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.data-table th, .data-table td { 
    padding: 12px 15px; 
    text-align: left; 
    border-bottom: 1px solid var(--border-color); 
    color: var(--text-primary);
}
.data-table th { background-color: var(--table-header-bg); color: var(--table-header-text); font-weight: 600; cursor: pointer; }
.data-table tr:hover { background-color: var(--table-row-hover); }

.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.85rem; text-transform: capitalize; color: white; font-weight: 600; }
.badge.admin { background: #e74c3c; }
.badge.worker { background: #3498db; } 
.badge.employee { background: #3498db; }
.badge.client { background: #2ecc71; }

.finance-summary { display: flex; gap: 20px; margin-bottom: 20px; }
.summary-box { flex: 1; padding: 20px; border-radius: 10px; color: white; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.summary-box h3 { margin: 0; font-size: 1rem; opacity: 0.9; color: white; }
.summary-box p { font-size: 2rem; font-weight: bold; margin: 10px 0 0 0; }
.income { background: #27ae60; }
.expense { background: #e67e22; }
.profit { background: #2980b9; }

.filter-controls { margin-bottom: 15px; display: flex; align-items: center; gap: 10px; color: var(--text-primary); }
.full-calendar-custom { margin-top: 20px; min-height: 600px; }

:deep(.fc) {
    --fc-page-bg-color: var(--bg-card);
    --fc-neutral-bg-color: var(--bg-main);
    --fc-list-event-hover-bg-color: var(--table-row-hover);
    --fc-theme-standard-border-color: var(--border-color);
    color: var(--text-primary);
}
:deep(.fc-col-header-cell) { background-color: var(--table-header-bg); color: var(--text-primary); }
:deep(.fc-timegrid-slot-label), :deep(.fc-timegrid-axis-cushion) { color: var(--text-secondary); }
:deep(.fc-button-primary) { background-color: #3498db; border-color: #3498db; }
:deep(.fc-button-primary:disabled) { background-color: var(--bg-main); color: var(--text-secondary); border-color: var(--border-color); }

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
    padding: 3px;
    font-family: 'Segoe UI', sans-serif;
    color: white; 
}

.event-line.time {
    font-size: 0.75rem;
    font-weight: normal;
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
    padding-top: 2px;
    margin-top: 2px;
}

.event-line.info {
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.95;
    display: flex;
    align-items: center;
    gap: 4px;
}

.event-line.worker {
    background-color: rgba(0,0,0,0.2);
    border-radius: 4px;
    padding: 2px 4px;
    margin-top: 3px;
    font-size: 0.75rem;
    text-align: center;
    font-weight: bold;
}
</style>