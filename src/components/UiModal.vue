<template>
  <ion-modal :isOpen @didDismiss="isOpen = false" v-bind="sheet ? {initialBreakpoint: 1, breakpoints: [0, 1]} : {}">
    <ion-header v-if="title">
      <ion-toolbar class="icon-modal">
        <ion-icon v-if="icon" slot="start" :icon />
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <slot name="button" />
          <IconBtn :icon="closeOutline" @click="isOpen = false" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <component :is="sheet ? 'div' : 'ion-content'">
      <slot />
    </component>
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

defineProps({ icon: String, title: String, sheet: Boolean })

const isOpen = ref(false)

defineExpose({
  open: () => isOpen.value = true,
  close: () => isOpen.value = false,
})

</script>