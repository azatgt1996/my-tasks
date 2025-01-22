<template>
  <IonButton
    class="mr-10"
    slot="end"
    color="medium"
    shape="round"
    fill="clear"
    @click="toggleDarkMode"
  >
    <Ikon
      :icon="darkMode ? 'moon' : 'sunny'"
      slot="icon-only"
      :style="{ color: darkMode ? 'yellow' : 'orange' }"
    />
  </IonButton>
</template>

<script setup>
import { IonButton } from '@ionic/vue';
import { Ikon } from '@/components/renderFunctions.js';
import { ref } from 'vue';

const prefersDark = window
  .matchMedia?.('(prefers-color-scheme: dark)')
  .matches.toString();
const _darkMode = (localStorage.darkMode ?? prefersDark) === 'true';

const darkMode = ref(_darkMode);
document.documentElement.classList.toggle('ion-palette-dark', _darkMode);

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  localStorage.darkMode = darkMode.value;
  document.documentElement.classList.toggle('ion-palette-dark', darkMode.value);
};
</script>
