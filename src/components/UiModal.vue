<template>
  <IonModal :isOpen @didDismiss="isOpen = false" v-bind="sheet ? { initialBreakpoint: 1, breakpoints: [0, 1] } : {}">
    <IonHeader v-if="title">
      <IonToolbar class="icon-modal">
        <Ikon v-if="icon" slot="start" :icon />
        <IonTitle>{{ title }}</IonTitle>
        <IonButtons slot="end">
          <slot name="button" />
          <IconBtn icon="closeO" @click="isOpen = false" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <component :is="sheet ? 'div' : IonContent">
      <slot />
    </component>
    <IonFooter style="display: flex">
      <slot name="footer" />
    </IonFooter>
  </IonModal>
</template>

<script setup>
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonFooter } from '@ionic/vue';
import { IconBtn, Ikon } from "@/components/renderFunctions.js";
import { ref } from 'vue';
import { $, $bus } from "@/helpers/utils.js";

const props = defineProps({
  name: { type: String, required: true },
  icon: String,
  title: String,
  sheet: Boolean,
})

const isOpen = ref(false)

$bus.on('openModal', (modalName) => {
  if (props.name === modalName) {
    isOpen.value = true
    setTimeout(() => $('#main-menu').close(), 400)
  }
})

$bus.on('closeModal', (modalName) => {
  if (props.name === modalName) isOpen.value = false
})
</script>