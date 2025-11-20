<template>
  <div class="admin-dashboard-container">
    <h1 class="main-title">Administrator Dashboard</h1>

    <div class="tabs">
        <button :class="{ active: currentTab === 'users' }" @click="currentTab = 'users'">User Management</button>
        <button :class="{ active: currentTab === 'planning' }" @click="switchToPlanning">Planning & Appointments</button>
    </div>

    <section v-if="currentTab === 'users'" class="tab-content">
      
      <div class="card add-section">
        <h2>Add New User</h2>
        <form @submit.prevent="addUser" class="inline-form">
          <input v-model="newUser.username" placeholder="Username" required />
          <input v-model="newUser.email" type="email" placeholder="Email" required />
          <input v-model="newUser.password" type="password" placeholder="Password" required />
          <select v-model="newUser.users_type" required>
             <option disabled value="">Select Role</option>
             <option value="admin">Administrator</option>
             <option value="employee">Employee</option>
             <option value="client">Client</option>
          </select>
          <button type="submit" class="btn-primary">Add</button>
        </form>
      </div>

      <div class="card list-section">
        <h3>User List ({{ users.length }})</h3>
        <p class="hint-text">Click column headers to sort.</p>
        
        <table class="data-table">
          <thead>
            <tr>
                <th>ID</th>
              <th @click="sort('username')" class="sortable">
                Name <span v-if="currentSort === 'username'">{{ currentSortDir === 'asc' ? '⬇' : '⬆' }}</span>
              </th>
              <th @click="sort('email')" class="sortable">
                Email <span v-if="currentSort === 'email'">{{ currentSortDir === 'asc' ? '⬇' : '⬆' }}</span>
              </th>
              <th @click="sort('users_type')" class="sortable">
                Role <span v-if="currentSort === 'users_type'">{{ currentSortDir === 'asc' ? '⬇' : '⬆' }}</span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in sortedUsers" :key="user.id">
                <td>{{ user.id }}</td>
                
                <td>
                  <span v-if="!user.isEditing">{{ user.username }}</span>
                  <input v-else v-model="user.username" class="edit-input"/>
                </td>

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
                    <button @click="user.isEditing = true" class="btn-icon edit" title="Edit">Edit</button>
                    <button @click="deleteUser(user.id)" class="btn-icon delete" title="Delete">Delete</button>
                  </div>
                  <div v-else>
                    <button @click="saveUser(user)" class="btn-icon save" title="Save">Save</button>
                    <button @click="user.isEditing = false" class="btn-icon cancel" title="Cancel">Cancel</button>
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
                        <label>Employee:</label>
                        <select v-model="newAppointment.employeeId" required>
                            <option disabled value="">Select...</option>
                            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.title }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Client:</label>
                        <select v-model="newAppointment.clientId" required>
                            <option disabled value="">Select...</option>
                            <option v-for="cl in clients" :key="cl.id" :value="cl.id">{{ cl.name }}</option>
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
                <label><strong>Filter by Employee:</strong> </label>
                <select v-model="selectedEmployeeId" @change="handleEmployeeChange">
                    <option value="">View all employees</option>
                    <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.title }}</option>
                </select>
            </div>
            <hr>
            <FullCalendar 
                ref="fullCalendarRef"
                :options="calendarOptions"
                class="full-calendar-custom"
            />
            <p class="hint">ℹTip: Click an event to delete it or edit its description. Drag and drop to reschedule.</p>
        </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import api from '../services/api'; 

// --- GLOBAL STATE ---
const currentTab = ref('users'); 
const fullCalendarRef = ref(null);

// --- USER STATE ---
const users = ref([]);
const newUser = reactive({ username: '', email: '', password: '', users_type: '' });

// --- SORTING STATE ---
const currentSort = ref('id'); 
const currentSortDir = ref('asc'); 

// --- PLANNING STATE ---
const employees = ref([]);
const clients = ref([]);
const selectedEmployeeId = ref('');
const newAppointment = reactive({ employeeId: '', clientId: '', startTime: '', endTime: '', description: '' });


// ==========================================
// 1. USER MANAGEMENT LOGIC
// ==========================================

const fetchUsers = async () => {
    try {
        const res = await api.get('/admin/users');
        users.value = res.data.map(u => ({ ...u, isEditing: false }));
    } catch (e) { 
        console.error('Error loading users', e);
    }
};

// --- SORTING LOGIC (Computed) ---
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

// --- CRUD USERS ---
const addUser = async () => {
    try {
        const res = await api.post('/admin/users', newUser);
        users.value.push({ ...res.data, isEditing: false });
        alert(`User ${res.data.username} added successfully!`);
        Object.assign(newUser, { username: '', email: '', password: '', users_type: '' });
    } catch (error) { 
        console.error(error);
        alert(error.response?.data?.message || 'Error adding user'); 
    }
};

const saveUser = async (user) => {
    try {
        await api.put(`/admin/users/${user.id}`, { 
            username: user.username, 
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
    } catch (e) { alert('Error deleting user'); }
};


// ==========================================
// 2. PLANNING & CALENDAR LOGIC
// ==========================================

const loadDropdownData = async () => {
    try {
        const resUsers = await api.get('/admin/users');
        employees.value = resUsers.data
            .filter(u => u.users_type === 'employee' || u.users_type === 'admin')
            .map(u => ({ id: u.id, title: u.username }));
        
        const resClients = await api.get('/admin/clients').catch(() => ({ data: [] }));
        if (resClients.data.length > 0) {
            clients.value = resClients.data.map(c => ({ id: c.id, name: c.username }));
        } else {
             clients.value = resUsers.data
                .filter(u => u.users_type === 'client')
                .map(u => ({ id: u.id, name: u.username }));
        }
    } catch (e) { console.error('Error loading planning data', e); }
};

const switchToPlanning = async () => {
    currentTab.value = 'planning';
    await loadDropdownData();
    setTimeout(() => {
        if(fullCalendarRef.value) fullCalendarRef.value.getApi().render();
    }, 50);
};

const addAppointment = async () => {
    try {
        if (!newAppointment.employeeId || !newAppointment.clientId || !newAppointment.startTime || !newAppointment.endTime) {
            return alert("Please fill in all required fields.");
        }
        await api.post('/admin/appointments', {
            ...newAppointment,
            employeeId: Number(newAppointment.employeeId),
            clientId: Number(newAppointment.clientId)
        });
        alert('Appointment created successfully!');
        if (fullCalendarRef.value) fullCalendarRef.value.getApi().refetchEvents();
        newAppointment.description = '';
        newAppointment.clientId = '';
    } catch (e) { 
        console.error(e);
        alert('Error creating appointment. Please check the dates.'); 
    }
};

const fetchCalendarEvents = async (info, successCallback, failureCallback) => {
    try {
        let url = '/admin/appointments';
        if (selectedEmployeeId.value) url += `?employeeId=${selectedEmployeeId.value}`;
        const res = await api.get(url);
        const events = res.data.map(appt => ({
            id: String(appt.id),
            title: `${appt.client ? appt.client.username : 'Unknown Client'} ${appt.description ? '- ' + appt.description : ''}`,
            start: appt.startTime,
            end: appt.endTime,
            backgroundColor: (String(appt.employeeId) === String(selectedEmployeeId.value)) ? '#2ecc71' : '#3498db',
            borderColor: '#2c3e50',
            extendedProps: { description: appt.description }
        }));
        successCallback(events);
    } catch (e) { failureCallback(e); }
};

const handleEmployeeChange = () => {
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
    } catch(e) { info.revert(); alert('Error moving appointment.'); }
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
    locale: 'en', // Set locale to English
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
/* --- COMMON STYLES --- */
.admin-dashboard-container { max-width: 1200px; margin: 40px auto; padding: 20px; font-family: 'Segoe UI', sans-serif; color: #333; }
.main-title { text-align: center; color: #2c3e50; margin-bottom: 30px; }

.tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #ddd; }
.tabs button { padding: 12px 25px; cursor: pointer; background: #f1f1f1; border: none; border-radius: 8px 8px 0 0; font-size: 16px; font-weight: 600; color: #7f8c8d; transition: all 0.3s; }
.tabs button:hover { background: #e2e6ea; }
.tabs button.active { background: #3498db; color: white; box-shadow: 0 -2px 5px rgba(0,0,0,0.1); }

.card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid #eee; }
h2, h3 { color: #2c3e50; margin-top: 0; }
.hint-text { font-size: 0.9rem; color: #666; margin-bottom: 10px; font-style: italic; }

/* --- FORMS --- */
.inline-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) auto; gap: 10px; align-items: center; }
.appointment-form { display: flex; flex-direction: column; gap: 15px; }
.form-row { display: flex; gap: 20px; flex-wrap: wrap; }
.form-group { display: flex; flex-direction: column; flex: 1; }
.form-group.flex-grow { flex: 2; }
label { font-weight: 600; margin-bottom: 5px; font-size: 0.9rem; }
input, select { padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; }
.edit-input { width: 90%; padding: 5px; }

/* --- TABLE --- */
.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background-color: #f8f9fa; color: #2c3e50; font-weight: 600; cursor: pointer; user-select: none; }
.data-table th:hover { background-color: #e9ecef; }
.data-table th.sortable { position: relative; }

.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.85rem; text-transform: capitalize; }
.badge.admin { background: #e74c3c; color: white; }
.badge.employee { background: #3498db; color: white; }
.badge.client { background: #2ecc71; color: white; }

/* --- BUTTONS --- */
.btn-primary { background-color: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
.btn-primary:hover { background-color: #219150; }
.button-container { justify-content: flex-end; margin-top: auto; }
.btn-icon { border: none; background: none; cursor: pointer; font-size: 1.2rem; margin: 0 5px; transition: transform 0.2s; }
.btn-icon:hover { transform: scale(1.2); }

/* --- PLANNING --- */
.filter-controls { margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
.full-calendar-custom { margin-top: 20px; min-height: 600px; }
.hint { margin-top: 10px; font-style: italic; color: #7f8c8d; font-size: 0.9rem; text-align: center; }
</style>