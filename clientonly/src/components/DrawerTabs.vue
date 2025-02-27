<template>
  <div class="drawer-tabs q-pb-md">
 <!-- <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="tab1" label="Login" />
      <q-tab name="tab2" label="Profil" />
    </q-tabs> 

    <q-separator /> -->

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="tab1">
        <!-- Login Form -->
        <div class="login-form q-pa-md flex flex-center">
          <q-form @submit="onSubmit" class="q-gutter-y-md" style="width: 100%;">
            <q-input
              v-model="username"
              label="Username"
              outlined
              dense
              :rules="[val => !!val || 'Username este obligatoriu']"
            />
            
            <q-input
              v-model="password"
              label="Password"
              outlined
              dense
              type="password"
              :rules="[val => !!val || 'Password este obligatoriu']"
            />
            
            <div class="q-mt-md flex flex-center">
              <q-btn 
                label="Autentificare" 
                type="submit" 
                color="primary"
                class="q-mt-sm" 
              />
            </div>
          </q-form>
        </div>
      </q-tab-panel>

      <q-tab-panel name="tab2">
        <!-- User Info Card -->
        <q-card flat bordered class="q-pa-md">
          <q-card-section>
            <div class="text-h6 q-mb-xs">Informatii Utilizator </div>
            <q-separator />
          </q-card-section>
          
          <q-card-section>
            <div class="q-py-sm">
              <div class="text-subtitle2">Nume utilizator</div>
              <div>{{ userInfo.name || 'John Doe' }}</div>
            </div>
            
            <div class="q-py-sm">
              <div class="text-subtitle2">Rol</div>
              <div>{{ userInfo.role || 'Administrator' }}</div>
            </div>
            
            <div class="q-py-sm">
              <div class="text-subtitle2">Ultima conectare</div>
              <div>{{ userInfo.lastLogin || '2025-02-26 15:30' }}</div>
            </div>
          </q-card-section>
          
          <q-card-actions align="center">
            <q-btn 
              label="Inchide sesiunea" 
              color="negative" 
              @click="logout" 
            />
          </q-card-actions>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar'
import { useUtilizatorStore } from 'stores/useUtilizatorStores';
import { host } from '../config/api';
const activeTab = ref('tab1');
const username = ref('');
const password = ref('');
const utilizatorStore = useUtilizatorStore();
const $q = useQuasar()
console.log('host', host)
// Mock user information (replace with actual user data in your app)
const userInfo = ref({
  name: 'John Doe',
  role: 'Administrator',
  lastLogin: '2025-02-26 15:30'
});

function onSubmit() {
  // Handle login logic here
  console.log('Login attempt with:', username.value, password.value);

  // After successful login, you might want to switch to tab2
  activeTab.value = 'tab2';
}

function logout() {
  // Handle logout logic here
  console.log('Logging out');
  // After logout, you might want to switch to tab1
   activeTab.value = 'tab1';
}
</script>

<style scoped>
.drawer-tabs {
  width: 100%;
}

.login-form {
  max-width: 300px;
  margin: 0 auto;
}
</style>