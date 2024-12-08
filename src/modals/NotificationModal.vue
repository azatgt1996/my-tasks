<template>
  <UiModal name="NotificationModal" sheet style="--height: auto" @willPresent="groupNotification = getLateDate()">
    <div style="display: grid; margin: 0 auto; padding: 30px 0 10px">
      <IonDatetimeButton datetime="group-dt" style="margin-bottom: 15px"
        :class="new Date() < getDT(groupNotification) ? '' : 'passed-date'" />
      <IconTextBtn :text="tr.setNotification" icon="checkmarkCO"
        @click="emit('changeNotifications', groupNotification)" />
      <IconTextBtn :text="tr.deleteNotification" icon="closeCO" @click="emit('changeNotifications', null)"
        color="danger" />
      <DateTimeModal id="group-dt" v-model="groupNotification" />
    </div>
  </UiModal>
</template>

<script setup>
import { IonDatetimeButton } from '@ionic/vue';
import { useGlobalStore } from '@/stores/globalStore';
import { IconTextBtn } from "@/components/renderFunctions.js";
import { getLateDate, getDT } from "@/helpers/utils.js";
import { ref } from 'vue';
import UiModal from "@/components/UiModal.vue";
import DateTimeModal from "@/components/DateTimeModal.vue";

const { tr } = useGlobalStore()

const emit = defineEmits(['changeNotifications'])

const groupNotification = ref()
</script>