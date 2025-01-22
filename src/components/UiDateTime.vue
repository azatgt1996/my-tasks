<template>
  <IonDatetimeButton
    :datetime="dtRef"
    :class="isLater(model) ? '' : 'passed-date'"
  >
    <IonModal keep-contents-mounted @willPresent="focus">
      <IonDatetime
        :id="dtRef"
        v-model="model"
        max="2100-12-31T00:00:00"
        :locale="tr._code"
        hour-cycle="h23"
        :firstDayOfWeek="new Intl.Locale(tr._code).weekInfo.firstDay ?? 1"
      />
    </IonModal>
  </IonDatetimeButton>
</template>

<script setup>
import { IonModal, IonDatetime, IonDatetimeButton } from '@ionic/vue';
import { useGlobalStore } from '@/stores/globalStore';
import { $, delay, isLater } from '@/helpers/utils.js';
import { ref } from 'vue';
import { nanoid } from 'nanoid';

const { tr } = useGlobalStore();

const dtRef = ref(nanoid());
const model = defineModel();

const focus = async () => {
  await delay(100);

  if (!$('ion-datetime').shadowRoot.querySelector('.datetime-calendar')) return;
  $('ion-datetime').shadowRoot.querySelector(
    '#toggle-wrapper'
  ).style.textTransform = 'capitalize';
  $('ion-datetime')
    .shadowRoot.querySelectorAll('.month-column ion-picker-column-option')
    .forEach((it) => {
      it.shadowRoot.querySelector('button').style.textTransform = 'capitalize';
    });
};
</script>

<style lang="sass">
.ion-datetime-button-overlay
  background-color: rgba(0, 0, 0, 0.3)
</style>
