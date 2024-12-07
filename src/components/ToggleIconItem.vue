<template>
  <ion-item>
    <Ikon :icon class="mr-10" />
    <ion-toggle :checked="modelValue" @ionChange="val => emit('update:modelValue', val.detail.checked)">
      {{ label }}
    </ion-toggle>
  </ion-item>
</template>

<script setup>
import { IonItem, IonToggle } from '@ionic/vue';
import { Ikon } from "@/components/renderFunctions.js";

defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

</script>