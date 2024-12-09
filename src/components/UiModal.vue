<template>
  <IonModal :isOpen @didDismiss="isOpen = false" :style="sheet ? '--height: auto' : ''"
    v-bind="sheet ? { initialBreakpoint: 1, breakpoints: [0, 1] } : {}">
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
    <component :is="sheet ? 'div' : IonContent" @click="onClickContent" @swipedLeft="emit('swipedLeft')"
      @swipedRight="emit('swipedRight')">
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

const emit = defineEmits(['dblClick', 'swipedLeft', 'swipedRight', 'opened'])

const isOpen = ref(false)

$bus.on('openModal', (modalName, ...args) => {
  if (props.name === modalName) {
    isOpen.value = true
    emit('opened', ...args)
    setTimeout(() => $('#main-menu').close(), 400)
  }
})

$bus.on('closeModal', (modalName) => {
  if (props.name === modalName) isOpen.value = false
})

let tap
const onClickContent = () => {
  let now = new Date().getTime()
  let diff = now - tap
  if (diff < 600 && diff > 0) emit('dblClick')
  tap = new Date().getTime()
}
</script>