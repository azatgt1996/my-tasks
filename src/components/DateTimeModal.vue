<template>
  <ion-modal keep-contents-mounted>
    <ion-datetime :id v-model="model" max="2100-12-31T00:00:00" :locale="tr._code" hour-cycle="h23" :firstDayOfWeek />
  </ion-modal>
</template>

<script setup>
import { IonModal, IonDatetime } from '@ionic/vue';
import { useGlobalStore } from '@/stores/global';
import { computed } from 'vue';

const { tr } = useGlobalStore()

const firstDayOfWeek = computed(() => new Intl.Locale(tr._code).weekInfo.firstDay ?? 1)

defineProps({ id: String })

const model = defineModel()
</script>