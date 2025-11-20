<template>
  <div class="user-management-dashboard">
    <h1 class="title">User Management</h1>
    
    <section class="add-user-section">
      <h2>Add New User</h2>
      <form @submit.prevent="addUser" class="add-user-form">
        <input v-model="newUser.username" placeholder="Nom d'utilisateur" required />
        <input v-model="newUser.email" type="email" placeholder="Email" required />
        <input v-model="newUser.password" type="password" placeholder="Password" required />
        <select v-model="newUser.users_type" required>
          <option disabled value="">Select a role</option>
          <option value="admin">Administrator</option>
          <option value="employee">Employee</option>
          <option value="client">Client</option>
        </select>          
        <button type="submit">Add User</button>
      </form>
    </section>

    <hr>
    
    <section class="user-list-section">
      <h2>User List (Total: {{ users.length }})</h2>
      
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            
            <td>
              <span v-if="!user.isEditing">{{ user.username }}</span>
              <input v-else v-model="user.username" />
            </td>
            
            <td>
              <span v-if="!user.isEditing">{{ user.email }}</span>
              <input v-else v-model="user.email" type="email" />
            </td>
            
            <td>
              <span v-if="!user.isEditing">{{ user.users_type }}</span>
              <select v-else v-model="user.users_type">
                  <option value="admin">Administrator</option>
                  <option value="employee">Employee</option>
                  <option value="client">Client</option>
              </select>
            </td>
            
            <td>
              <button v-if="!user.isEditing" @click="user.isEditing = true" class="edit-btn">Edit</button>
              
              <button v-else @click="saveUser(user)" class="save-btn">Save</button>
              
              <button @click="deleteUser(user.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <p v-if="users.length === 0">No users found.</p>
      
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import api from '../services/api';

const users = ref([]);
const newUser = reactive({ 
  username: '', 
  email: '', 
  password: '',
  users_type: 'normal'
});

const fetchUsers = async () => {
  try {
    const response = await api.get('/admin/users'); 
    users.value = response.data.map(user => ({ ...user, isEditing: false }));
  } catch (error) {
    console.error('Error retrieving users:', error);
    alert("Error: Unable to load the user list.");
  }
};

onMounted(fetchUsers); 


const addUser = async () => {
    try {
        if (!newUser.username || !newUser.email || !newUser.password || !newUser.users_type) {
            return alert("Please fill in all fields.");
    }
    const response = await api.post('/admin/users', newUser); 
    
    console.log("--- API creation response (response.data) ---");
    console.log(response.data); 
    console.log("-----------------------------------------------");
    
    const newUserObject = { ...response.data, isEditing: false };
    console.log("New user object added locally (Frontend):", newUserObject);
    
    users.value.push(newUserObject); 

    newUser.username = '';
    newUser.email = '';
    newUser.password = '';
    newUser.users_type = 'normal';

    alert(`User ${response.data.username} added successfully!`);
    } catch (error) {
        console.error('Error adding user:', error);
        alert(error?.response?.data?.message || 'Error adding user.');
    }
};

const saveUser = async (user) => {
  try {

    const updatedData = {
      username: user.username,
      email: user.email,
      users_type: user.users_type,

    };
    
    await api.put(`/admin/users/${user.id}`, updatedData); 
    
    user.isEditing = false; 
    alert(`Utilisateur ${user.username} mis à jour.`);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    alert('Erreur lors de la mise à jour de l\'utilisateur.');
  }
};

const deleteUser = async (userId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    return;
  }
  
  try {
    await api.delete(`/admin/users/${userId}`); 
    
    users.value = users.value.filter(user => user.id !== userId);
    alert('Utilisateur supprimé avec succès.');
    
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    alert('Erreur lors de la suppression de l\'utilisateur.');
  }
};

</script>

<style scoped>
.user-management-dashboard {
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.add-user-form {
  display: grid;
  grid-template-columns: repeat(5, 1fr) auto;
  gap: 10px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  margin-bottom: 20px;
}

.add-user-form input,
.add-user-form select,
.add-user-form button {
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.add-user-form button {
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-user-form button:hover {
  background-color: #36a473;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.users-table th,
.users-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.users-table th {
  background-color: #2c3e50;
  color: white;
}

.users-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.users-table input,
.users-table select {
  width: 90%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.edit-btn, .save-btn, .delete-btn {
  padding: 8px 12px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}
</style>