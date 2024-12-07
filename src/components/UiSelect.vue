<template>
  <ion-select v-model="model" v-bind="$attrs" :label :cancelText="tr.cancel" :interfaceOptions="{ header }"
    :toggleIcon="iconMap.chevronDown" :expandedIcon="iconMap.chevronUp">
    <slot />
  </ion-select>
</template>

<script setup>
import { IonSelect } from '@ionic/vue';
import { useGlobalStore } from '@/stores/global';
import iconMap from '@/constants/iconMap';

const { tr } = useGlobalStore()

defineProps({
  label: { type: String },
  header: { type: String },
})

const model = defineModel()

</script>