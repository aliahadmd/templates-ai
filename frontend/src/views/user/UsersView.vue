<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header flex justify-between items-center">
        <h1 class="page-title">Users Management</h1>
        <div class="flex gap-2">
          <Button @click="refreshUsers" variant="outline" size="sm">
            <i class="fas fa-sync-alt mr-2"></i> Refresh
          </Button>
        </div>
      </div>
      <div class="page-content">
        <div class="card">
          <div class="card-body">
            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            
            <div v-else-if="error" class="text-center py-8">
              <p class="text-error mb-4">{{ error }}</p>
              <Button @click="refreshUsers" variant="outline" size="sm">Try Again</Button>
            </div>
            
            <div v-else>
              <!-- Users Table -->
              <div class="overflow-x-auto">
                <table class="w-full table-auto">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="px-4 py-3 text-left">Name</th>
                      <th class="px-4 py-3 text-left">Email</th>
                      <th class="px-4 py-3 text-left">Role</th>
                      <th class="px-4 py-3 text-left">Verified</th>
                      <th class="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id" class="border-b border-border hover:bg-muted/50">
                      <td class="px-4 py-3">
                        {{ user.firstName || '' }} {{ user.lastName || '' }}
                        <span v-if="!user.firstName && !user.lastName" class="text-muted-foreground italic">Not set</span>
                      </td>
                      <td class="px-4 py-3">{{ user.email }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs font-medium" 
                              :class="user.role.name === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'">
                          {{ user.role.name }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <span v-if="user.isEmailVerified" class="text-success">
                          <i class="fas fa-check-circle"></i>
                        </span>
                        <span v-else class="text-warning">
                          <i class="fas fa-exclamation-circle"></i>
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <div class="flex justify-end gap-2">
                          <Button @click="openEditRoleModal(user)" size="sm" variant="outline">
                            Change Role
                          </Button>
                          <Button @click="openEditUserModal(user)" size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button @click="confirmDeleteUser(user)" size="sm" variant="outline" class="text-error">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div class="flex justify-between items-center mt-4">
                <div class="text-sm text-muted-foreground">
                  Showing {{ users.length }} of {{ totalUsers }} users
                </div>
                <div class="flex gap-2">
                  <Button 
                    @click="prevPage" 
                    :disabled="currentPage === 1" 
                    size="sm" 
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button 
                    @click="nextPage" 
                    :disabled="currentPage >= totalPages" 
                    size="sm" 
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Edit User</h3>
          <button @click="showEditUserModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateUser">
            <div class="mb-4">
              <Input
                v-model="editUserForm.firstName"
                label="First Name"
                placeholder="Enter first name"
              />
            </div>
            <div class="mb-4">
              <Input
                v-model="editUserForm.lastName"
                label="Last Name"
                placeholder="Enter last name"
              />
            </div>
            <div class="mb-4">
              <Input
                v-model="editUserForm.email"
                label="Email"
                type="email"
                placeholder="Enter email"
                required
              />
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <Button @click="showEditUserModal = false" type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" :loading="updating">
                Update User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Edit Role Modal -->
    <div v-if="showEditRoleModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Change User Role</h3>
          <button @click="showEditRoleModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateUserRole">
            <div class="mb-4">
              <label class="form-label">Select Role</label>
              <select 
                v-model="selectedRoleId" 
                class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <Button @click="showEditRoleModal = false" type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" :loading="updating">
                Update Role
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p class="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div class="flex justify-end gap-2 mt-6">
            <Button @click="showDeleteModal = false" type="button" variant="outline">
              Cancel
            </Button>
            <Button @click="deleteUser" variant="destructive" :loading="deleting">
              Delete User
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AppLayout from '../../components/layout/AppLayout.vue';
import Button from '../../components/ui/Button.vue';
import Input from '../../components/ui/Input.vue';
import { useAuthStore } from '../../stores/auth';

const API_URL = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();

// State
const users = ref<any[]>([]);
const roles = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const currentPage = ref(1);
const limit = ref(10);
const totalUsers = ref(0);
const totalPages = ref(1);

// Modal state
const showEditUserModal = ref(false);
const showEditRoleModal = ref(false);
const showDeleteModal = ref(false);
const editUserForm = ref({ id: '', firstName: '', lastName: '', email: '' });
const selectedUser = ref<any>(null);
const selectedRoleId = ref('');
const updating = ref(false);
const deleting = ref(false);

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      params: {
        page: currentPage.value,
        limit: limit.value
      }
    });
    
    users.value = response.data.data;
    totalUsers.value = response.data.pagination.total;
    totalPages.value = response.data.pagination.pages;
  } catch (err: any) {
    console.error('Error fetching users:', err);
    error.value = err.response?.data?.message || 'Failed to load users';
  } finally {
    loading.value = false;
  }
};

// Fetch roles
const fetchRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/roles`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    roles.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching roles:', err);
  }
};

// Pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchUsers();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchUsers();
  }
};

const refreshUsers = () => {
  fetchUsers();
};

// Edit user
const openEditUserModal = (user: any) => {
  editUserForm.value = {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email
  };
  showEditUserModal.value = true;
};

const updateUser = async () => {
  updating.value = true;
  
  try {
    await axios.put(`${API_URL}/api/users/${editUserForm.value.id}`, {
      firstName: editUserForm.value.firstName,
      lastName: editUserForm.value.lastName,
      email: editUserForm.value.email
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showEditUserModal.value = false;
    fetchUsers();
  } catch (err: any) {
    console.error('Error updating user:', err);
    alert(err.response?.data?.message || 'Failed to update user');
  } finally {
    updating.value = false;
  }
};

// Edit role
const openEditRoleModal = (user: any) => {
  selectedUser.value = user;
  selectedRoleId.value = user.role.id;
  showEditRoleModal.value = true;
};

const updateUserRole = async () => {
  updating.value = true;
  
  try {
    await axios.put(`${API_URL}/api/users/${selectedUser.value.id}/role`, {
      roleId: selectedRoleId.value
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showEditRoleModal.value = false;
    fetchUsers();
  } catch (err: any) {
    console.error('Error updating user role:', err);
    alert(err.response?.data?.message || 'Failed to update user role');
  } finally {
    updating.value = false;
  }
};

// Delete user
const confirmDeleteUser = (user: any) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  deleting.value = true;
  
  try {
    await axios.delete(`${API_URL}/api/users/${selectedUser.value.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showDeleteModal.value = false;
    fetchUsers();
  } catch (err: any) {
    console.error('Error deleting user:', err);
    alert(err.response?.data?.message || 'Failed to delete user');
  } finally {
    deleting.value = false;
  }
};

// Initialize
onMounted(() => {
  fetchUsers();
  fetchRoles();
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background-color: var(--color-background);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-body {
  padding: 1rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-muted-foreground);
}
</style> 