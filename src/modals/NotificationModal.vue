<template>
  <UiModal
    name="NotificationModal"
    sheet
    @willPresent="groupNotification = getLateDate()"
  >
    <div style="display: grid; margin: 0 auto; padding: 30px 0 10px">
      <UiDateTime v-model="groupNotification" style="margin-bottom: 15px" />
      <IconTextBtn
        :text="tr.setNotification"
        icon="checkmarkCO"
        @click="emit('changeNotifications', groupNotification)"
      />
      <IconTextBtn
        :text="tr.deleteNotification"
        icon="closeCO"
        color="danger"
        @click="emit('changeNotifications', null)"
      />
    </div>
  </UiModal>
</template>

<script setup>
import { IconTextBtn } from '@/components/renderFunctions.js';
import { useGlobalStore } from '@/stores/globalStore';
import { getLateDate } from '@/helpers/utils.js';
import { ref } from 'vue';
import UiModal from '@/components/UiModal.vue';
import UiDateTime from '@/components/UiDateTime.vue';

const { tr } = useGlobalStore();

const emit = defineEmits(['changeNotifications']);

const groupNotification = ref();
</script>
