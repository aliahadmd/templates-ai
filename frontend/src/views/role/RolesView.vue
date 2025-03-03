<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header flex justify-between items-center">
        <h1 class="page-title">Roles Management</h1>
        <div class="flex gap-2">
          <Button @click="openCreateRoleModal" variant="primary" size="sm">
            <i class="fas fa-plus mr-2"></i> New Role
          </Button>
          <Button @click="refreshRoles" variant="outline" size="sm">
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
              <Button @click="refreshRoles" variant="outline" size="sm">Try Again</Button>
            </div>
            
            <div v-else>
              <!-- Roles Table -->
              <div class="overflow-x-auto">
                <table class="w-full table-auto">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="px-4 py-3 text-left">Name</th>
                      <th class="px-4 py-3 text-left">Description</th>
                      <th class="px-4 py-3 text-left">Permissions</th>
                      <th class="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="role in roles" :key="role.id" class="border-b border-border hover:bg-muted/50">
                      <td class="px-4 py-3 font-medium">{{ role.name }}</td>
                      <td class="px-4 py-3">
                        {{ role.description || 'No description' }}
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex flex-wrap gap-1">
                          <span 
                            v-for="permission in role.permissions" 
                            :key="permission.permission ? permission.permission.id : permission.id"
                            class="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                          >
                            {{ permission.permission ? permission.permission.name : permission.name }}
                          </span>
                          <span v-if="!role.permissions || role.permissions.length === 0" class="text-muted-foreground italic">
                            No permissions
                          </span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <div class="flex justify-end gap-2">
                          <Button @click="openManagePermissionsModal(role)" size="sm" variant="outline">
                            Permissions
                          </Button>
                          <Button @click="openEditRoleModal(role)" size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button 
                            @click="confirmDeleteRole(role)" 
                            size="sm" 
                            variant="outline" 
                            class="text-error"
                            :disabled="role.name === 'admin' || role.name === 'user'"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Role Modal -->
    <div v-if="showCreateRoleModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Create New Role</h3>
          <button @click="showCreateRoleModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createRole">
            <div class="mb-4">
              <Input
                v-model="createRoleForm.name"
                label="Role Name"
                placeholder="Enter role name"
                required
              />
            </div>
            <div class="mb-4">
              <Input
                v-model="createRoleForm.description"
                label="Description"
                placeholder="Enter role description"
              />
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <Button @click="showCreateRoleModal = false" type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" :loading="creating">
                Create Role
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
          <h3 class="text-lg font-medium">Edit Role</h3>
          <button @click="showEditRoleModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateRole">
            <div class="mb-4">
              <Input
                v-model="editRoleForm.name"
                label="Role Name"
                placeholder="Enter role name"
                required
                :disabled="editRoleForm.name === 'admin' || editRoleForm.name === 'user'"
              />
            </div>
            <div class="mb-4">
              <Input
                v-model="editRoleForm.description"
                label="Description"
                placeholder="Enter role description"
              />
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
    
    <!-- Manage Permissions Modal -->
    <div v-if="showManagePermissionsModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-lg font-medium">Manage Permissions for {{ selectedRole?.name }}</h3>
          <button @click="showManagePermissionsModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingPermissions" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
          <div v-else>
            <div class="mb-4">
              <label class="form-label mb-2 block">Available Permissions</label>
              <div class="max-h-60 overflow-y-auto border border-border rounded-md p-3">
                <div v-for="permission in availablePermissions" :key="permission.id" class="mb-2">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      :value="permission.id" 
                      v-model="selectedPermissions"
                      class="form-checkbox"
                    />
                    <span>{{ permission.name }}</span>
                    <span class="text-xs text-muted-foreground ml-2">{{ permission.description }}</span>
                  </label>
                </div>
                <div v-if="availablePermissions.length === 0" class="text-muted-foreground italic">
                  No permissions available
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <Button @click="showManagePermissionsModal = false" type="button" variant="outline">
                Cancel
              </Button>
              <Button @click="savePermissions" :loading="savingPermissions">
                Save Permissions
              </Button>
            </div>
          </div>
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
          <p class="mb-4">Are you sure you want to delete this role? This action cannot be undone.</p>
          <div class="flex justify-end gap-2 mt-6">
            <Button @click="showDeleteModal = false" type="button" variant="outline">
              Cancel
            </Button>
            <Button @click="deleteRole" variant="destructive" :loading="deleting">
              Delete Role
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
const roles = ref<any[]>([]);
const allPermissions = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

// Modal state
const showCreateRoleModal = ref(false);
const showEditRoleModal = ref(false);
const showManagePermissionsModal = ref(false);
const showDeleteModal = ref(false);
const createRoleForm = ref({ name: '', description: '' });
const editRoleForm = ref({ id: '', name: '', description: '' });
const selectedRole = ref<any>(null);
const selectedPermissions = ref<string[]>([]);
const availablePermissions = ref<any[]>([]);
const creating = ref(false);
const updating = ref(false);
const deleting = ref(false);
const loadingPermissions = ref(false);
const savingPermissions = ref(false);

// Fetch roles
const fetchRoles = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`${API_URL}/api/roles`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    roles.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching roles:', err);
    error.value = err.response?.data?.message || 'Failed to load roles';
  } finally {
    loading.value = false;
  }
};

// Fetch permissions
const fetchPermissions = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/permissions`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    allPermissions.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching permissions:', err);
  }
};

const refreshRoles = () => {
  fetchRoles();
};

// Create role
const openCreateRoleModal = () => {
  createRoleForm.value = { name: '', description: '' };
  showCreateRoleModal.value = true;
};

const createRole = async () => {
  creating.value = true;
  
  try {
    await axios.post(`${API_URL}/api/roles`, {
      name: createRoleForm.value.name,
      description: createRoleForm.value.description
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showCreateRoleModal.value = false;
    fetchRoles();
  } catch (err: any) {
    console.error('Error creating role:', err);
    alert(err.response?.data?.message || 'Failed to create role');
  } finally {
    creating.value = false;
  }
};

// Edit role
const openEditRoleModal = (role: any) => {
  editRoleForm.value = {
    id: role.id,
    name: role.name,
    description: role.description || ''
  };
  showEditRoleModal.value = true;
};

const updateRole = async () => {
  updating.value = true;
  
  try {
    await axios.put(`${API_URL}/api/roles/${editRoleForm.value.id}`, {
      name: editRoleForm.value.name,
      description: editRoleForm.value.description
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showEditRoleModal.value = false;
    fetchRoles();
  } catch (err: any) {
    console.error('Error updating role:', err);
    alert(err.response?.data?.message || 'Failed to update role');
  } finally {
    updating.value = false;
  }
};

// Manage permissions
const openManagePermissionsModal = async (role: any) => {
  selectedRole.value = role;
  loadingPermissions.value = true;
  showManagePermissionsModal.value = true;
  
  try {
    // Get all permissions if not already loaded
    if (allPermissions.value.length === 0) {
      await fetchPermissions();
    }
    
    // Set available permissions
    availablePermissions.value = allPermissions.value;
    
    // Set selected permissions
    selectedPermissions.value = role.permissions
      ? role.permissions.map((p: any) => p.permission ? p.permission.id : p.id)
      : [];
  } catch (err) {
    console.error('Error loading permissions:', err);
  } finally {
    loadingPermissions.value = false;
  }
};

const savePermissions = async () => {
  savingPermissions.value = true;
  
  try {
    // Get current permissions
    const currentPermissions = selectedRole.value.permissions
      ? selectedRole.value.permissions.map((p: any) => p.permission ? p.permission.id : p.id)
      : [];
    
    // Find permissions to add
    const permissionsToAdd = selectedPermissions.value.filter(
      (p) => !currentPermissions.includes(p)
    );
    
    // Find permissions to remove
    const permissionsToRemove = currentPermissions.filter(
      (p: string) => !selectedPermissions.value.includes(p)
    );
    
    // Add new permissions
    for (const permissionId of permissionsToAdd) {
      await axios.post(`${API_URL}/api/roles/${selectedRole.value.id}/permissions`, {
        permissionId
      }, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
    }
    
    // Remove permissions
    for (const permissionId of permissionsToRemove) {
      await axios.delete(`${API_URL}/api/roles/${selectedRole.value.id}/permissions/${permissionId}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
    }
    
    showManagePermissionsModal.value = false;
    fetchRoles();
  } catch (err: any) {
    console.error('Error saving permissions:', err);
    alert(err.response?.data?.message || 'Failed to save permissions');
  } finally {
    savingPermissions.value = false;
  }
};

// Delete role
const confirmDeleteRole = (role: any) => {
  selectedRole.value = role;
  showDeleteModal.value = true;
};

const deleteRole = async () => {
  deleting.value = true;
  
  try {
    await axios.delete(`${API_URL}/api/roles/${selectedRole.value.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showDeleteModal.value = false;
    fetchRoles();
  } catch (err: any) {
    console.error('Error deleting role:', err);
    alert(err.response?.data?.message || 'Failed to delete role');
  } finally {
    deleting.value = false;
  }
};

// Initialize
onMounted(() => {
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

.form-checkbox {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-primary);
}
</style> 