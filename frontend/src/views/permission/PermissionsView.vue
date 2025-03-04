<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header flex justify-between items-center">
        <h1 class="page-title">Permissions Management</h1>
        <div class="flex gap-2">
          <Button @click="openCreatePermissionModal" variant="primary" size="sm">
            <i class="fas fa-plus mr-2"></i> New Permission
          </Button>
          <Button @click="refreshPermissions" variant="outline" size="sm">
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
              <Button @click="refreshPermissions" variant="outline" size="sm">Try Again</Button>
            </div>
            
            <div v-else>
              <!-- Permissions Table -->
              <div class="overflow-x-auto">
                <table class="w-full table-auto">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="px-4 py-3 text-left">Name</th>
                      <th class="px-4 py-3 text-left">Description</th>
                      <th class="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="permission in permissions" :key="permission.id" class="border-b border-border hover:bg-muted/50">
                      <td class="px-4 py-3 font-medium">{{ permission.name }}</td>
                      <td class="px-4 py-3">
                        {{ permission.description || 'No description' }}
                      </td>
                      <td class="px-4 py-3 text-right">
                        <div class="flex justify-end gap-2">
                          <Button @click="openEditPermissionModal(permission)" size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button 
                            @click="confirmDeletePermission(permission)" 
                            size="sm" 
                            variant="outline" 
                            class="text-error"
                          >
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
                  Showing {{ permissions.length }} permissions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Permission Modal -->
    <Modal 
      :isOpen="showCreatePermissionModal" 
      title="Create New Permission" 
      @close="showCreatePermissionModal = false"
    >
      <form @submit.prevent="createPermission">
        <div class="mb-4">
          <Input
            v-model="createPermissionForm.name"
            label="Permission Name"
            placeholder="Enter permission name"
            required
          />
          <p class="text-xs text-muted-foreground mt-1">
            Use a descriptive name like "create:users" or "delete:roles"
          </p>
        </div>
        <div class="mb-4">
          <Input
            v-model="createPermissionForm.description"
            label="Description"
            placeholder="Enter permission description"
          />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <Button @click="showCreatePermissionModal = false" type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" :loading="creating">
            Create Permission
          </Button>
        </div>
      </form>
    </Modal>
    
    <!-- Edit Permission Modal -->
    <Modal 
      :isOpen="showEditPermissionModal" 
      title="Edit Permission" 
      @close="showEditPermissionModal = false"
    >
      <form @submit.prevent="updatePermission">
        <div class="mb-4">
          <Input
            v-model="editPermissionForm.name"
            label="Permission Name"
            placeholder="Enter permission name"
            required
          />
        </div>
        <div class="mb-4">
          <Input
            v-model="editPermissionForm.description"
            label="Description"
            placeholder="Enter permission description"
          />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <Button @click="showEditPermissionModal = false" type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" :loading="updating">
            Update Permission
          </Button>
        </div>
      </form>
    </Modal>
    
    <!-- Delete Confirmation Modal -->
    <Modal 
      :isOpen="showDeleteModal" 
      title="Confirm Delete" 
      @close="showDeleteModal = false"
    >
      <p class="mb-4">Are you sure you want to delete this permission? This action cannot be undone and may affect roles that use this permission.</p>
      <div class="flex justify-end gap-2 mt-6">
        <Button @click="showDeleteModal = false" type="button" variant="outline">
          Cancel
        </Button>
        <Button @click="deletePermission" variant="destructive" :loading="deleting">
          Delete Permission
        </Button>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AppLayout from '../../components/layout/AppLayout.vue';
import Button from '../../components/ui/Button.vue';
import Input from '../../components/ui/Input.vue';
import { useAuthStore } from '../../stores/auth';
import Modal from '../../components/ui/Modal.vue';

const API_URL = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();

// State
const permissions = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

// Modal state
const showCreatePermissionModal = ref(false);
const showEditPermissionModal = ref(false);
const showDeleteModal = ref(false);
const createPermissionForm = ref({ name: '', description: '' });
const editPermissionForm = ref({ id: '', name: '', description: '' });
const selectedPermission = ref<any>(null);
const creating = ref(false);
const updating = ref(false);
const deleting = ref(false);

// Fetch permissions
const fetchPermissions = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`${API_URL}/api/permissions`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    permissions.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching permissions:', err);
    error.value = err.response?.data?.message || 'Failed to load permissions';
  } finally {
    loading.value = false;
  }
};

const refreshPermissions = () => {
  fetchPermissions();
};

// Create permission
const openCreatePermissionModal = () => {
  createPermissionForm.value = { name: '', description: '' };
  showCreatePermissionModal.value = true;
};

const createPermission = async () => {
  creating.value = true;
  
  try {
    await axios.post(`${API_URL}/api/permissions`, {
      name: createPermissionForm.value.name,
      description: createPermissionForm.value.description
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showCreatePermissionModal.value = false;
    fetchPermissions();
  } catch (err: any) {
    console.error('Error creating permission:', err);
    alert(err.response?.data?.message || 'Failed to create permission');
  } finally {
    creating.value = false;
  }
};

// Edit permission
const openEditPermissionModal = (permission: any) => {
  editPermissionForm.value = {
    id: permission.id,
    name: permission.name,
    description: permission.description || ''
  };
  showEditPermissionModal.value = true;
};

const updatePermission = async () => {
  updating.value = true;
  
  try {
    await axios.put(`${API_URL}/api/permissions/${editPermissionForm.value.id}`, {
      name: editPermissionForm.value.name,
      description: editPermissionForm.value.description
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showEditPermissionModal.value = false;
    fetchPermissions();
  } catch (err: any) {
    console.error('Error updating permission:', err);
    alert(err.response?.data?.message || 'Failed to update permission');
  } finally {
    updating.value = false;
  }
};

// Delete permission
const confirmDeletePermission = (permission: any) => {
  selectedPermission.value = permission;
  showDeleteModal.value = true;
};

const deletePermission = async () => {
  deleting.value = true;
  
  try {
    await axios.delete(`${API_URL}/api/permissions/${selectedPermission.value.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    showDeleteModal.value = false;
    fetchPermissions();
  } catch (err: any) {
    console.error('Error deleting permission:', err);
    alert(err.response?.data?.message || 'Failed to delete permission');
  } finally {
    deleting.value = false;
  }
};

// Initialize
onMounted(() => {
  fetchPermissions();
});
</script>

<style scoped>
/* Remove hardcoded styles - they're now in the global style.css */
</style> 