<template>
  <IonModal keep-contents-mounted @willPresent="focus">
    <IonDatetime :id v-model="model" max="2100-12-31T00:00:00" :locale="tr._code" hour-cycle="h23" :firstDayOfWeek />
  </IonModal>
</template>

<script setup>
import { IonModal, IonDatetime } from '@ionic/vue';
import { useGlobalStore } from '@/stores/globalStore';
import { $ } from "@/helpers/utils.js";
import { computed } from 'vue';

const { tr } = useGlobalStore()

const firstDayOfWeek = computed(() => new Intl.Locale(tr._code).weekInfo.firstDay ?? 1)

defineProps({ id: String })

const model = defineModel()

const focus = () => {
  $('ion-datetime').shadowRoot.querySelector('#toggle-wrapper').style.textTransform = 'capitalize'
  $('ion-datetime').shadowRoot.querySelectorAll('.month-column ion-picker-column-option').forEach(it => {
    it.shadowRoot.querySelector('button').style.textTransform = 'capitalize'
  })
}
</script>