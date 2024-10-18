<template>
  <ion-modal :isOpen @didDismiss="isOpen = false">
    <ion-header>
      <ion-toolbar class="icon-modal">
        <ion-icon v-if="icon" slot="start" :icon />
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <slot name="button" />
          <IconBtn :icon="closeOutline" @click="isOpen = false" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <slot />
    </ion-content>
    <ion-footer style="display: flex">
      <slot name="footer" />
    </ion-footer>
  </ion-modal>
</template>

<script setup>
import { IonModal, IonHeader, IonToolbar, IonIcon, IonTitle, IonButtons, IonContent, IonFooter } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { IconBtn } from "@/components/renderFunctions.js";
import { ref } from 'vue';

defineProps({
  icon: { type: String },
  title: { type: String, required: true },
})

const isOpen = ref(false)

defineExpose({
  open: () => isOpen.value = true,
  close: () => isOpen.value = false,
})

</script>