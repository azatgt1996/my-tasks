<template>
  <IonModal keep-contents-mounted @willPresent="focus">
    <IonDatetime :id v-model="model" max="2100-12-31T00:00:00" :locale="tr._code" hour-cycle="h23"
      :firstDayOfWeek="new Intl.Locale(tr._code).weekInfo.firstDay ?? 1" />
  </IonModal>
</template>

<script setup>
import { IonModal, IonDatetime } from '@ionic/vue';
import { useGlobalStore } from '@/stores/globalStore';
import { $, delay } from "@/helpers/utils.js";

const { tr } = useGlobalStore()

defineProps({ id: String })

const model = defineModel()

const focus = async () => {
  await delay(100)

  if (!$('ion-datetime').shadowRoot.querySelector('.datetime-calendar')) return
  $('ion-datetime').shadowRoot.querySelector('#toggle-wrapper').style.textTransform = 'capitalize'
  $('ion-datetime').shadowRoot.querySelectorAll('.month-column ion-picker-column-option').forEach(it => {
    it.shadowRoot.querySelector('button').style.textTransform = 'capitalize'
  })
}
</script>

<style lang="sass">
ion-datetime
  border: 1px solid lightgray
</style>