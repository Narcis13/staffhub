<template>
    <div class="drawer-tabs q-pb-md">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="tab1" label="Tab 1" />
        <q-tab name="tab2" label="Tab 2" />
      </q-tabs>
  
      <q-separator />
  
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="tab1">
          <div class="text-h6">Tab 1 Content</div>
          <p>Content for first tab goes here.</p>
        </q-tab-panel>
  
        <q-tab-panel name="tab2">
          <div class="text-h6">Tab 2 Content</div>
          <p>Content for second tab goes here.</p>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const activeTab = ref('tab1');
  </script>
  
  <style scoped>
  .drawer-tabs {
    width: 100%;
  }
  </style>