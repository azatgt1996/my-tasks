<template>
  <UiModal name="NotificationModal" sheet @willPresent="groupNotification = getLateDate()">
    <div style="display: grid; margin: 0 auto; padding: 30px 0 10px">
      <IonDatetimeButton datetime="group-dt" style="margin-bottom: 15px"
        :class="isLater(groupNotification) ? '' : 'passed-date'" />
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
import { IconTextBtn } from "@/components/renderFunctions.js";
import { useGlobalStore } from '@/stores/globalStore';
import { getLateDate, isLater } from "@/helpers/utils.js";
import { ref } from 'vue';
import UiModal from "@/components/UiModal.vue";
import DateTimeModal from "@/components/DateTimeModal.vue";

const { tr } = useGlobalStore()

const emit = defineEmits(['changeNotifications'])

const groupNotification = ref()
</script>