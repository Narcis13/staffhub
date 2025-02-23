

<template>
    <q-layout view="hHh lpR fFf" class="bg-grey-1">
      <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="58">
        <q-toolbar>
          <q-btn
         
            flat
            dense
            round
            @click="toggleLeftDrawer"
            aria-label="Menu"
            icon="menu"
       
          />
  

          <div class="q-ml-sm text-h6">
         StaffHUB
          </div>
          <q-space />
  

  
          <div class="q-gutter-sm row items-center no-wrap" >

            <q-btn round dense flat color="grey-8" icon="message" >
              <q-tooltip>Messages</q-tooltip>
            </q-btn>
            <q-btn round dense flat color="grey-8" icon="notifications">
              <q-badge color="red" text-color="white" floating>
                2
              </q-badge>
              <q-tooltip>Notifications</q-tooltip>
            </q-btn>
            <q-btn round flat >
              <q-avatar size="48px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png">
              </q-avatar>
              <usermenu />
              <q-tooltip>Account</q-tooltip>
            </q-btn>
          </div>
        </q-toolbar>
      </q-header>
  
      <q-drawer
        v-model="leftDrawerOpen"
        
        show-if-above 
        bordered
        class="bg-grey-2"
        :width="320"
      >
    
      

      </q-drawer>
  
      <q-page-container>
        <slot />
      </q-page-container>
    </q-layout>
  </template>
  
  <script setup>

  
const leftDrawerOpen = ref(false)
function toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }

  </script>
