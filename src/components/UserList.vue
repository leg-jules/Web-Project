<template>
  <div class="user-list">
    <h2>User List</h2>
    
    <!-- List with events -->
    <ul>
      <li 
        v-for="user in users" 
        :key="user.id"
        @click="selectUser(user)"
        :class="{ 'selected': selectedUser?.id === user.id }"
      >
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>

    <!-- Table with properties -->
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="user in users" 
          :key="'table-' + user.id"
          :class="{ 'active': user.active }"
          @click="selectUser(user)"
        >
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.active ? 'Active' : 'Inactive' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Display selected user -->
    <div v-if="selectedUser" class="selected-info">
      <h3>Selected User: {{ selectedUser.name }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: true }
      ],
      selectedUser: null
    }
  },
  methods: {
    selectUser(user) {
      this.selectedUser = user
      console.log('User selected:', user.name)
    }
  }
}
</script>

<style scoped>
.selected {
  background-color: yellow;
}
.active {
  background-color: #e8f5e8;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.selected-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
}
</style>


