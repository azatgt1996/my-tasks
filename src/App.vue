<template>
  <IonApp>
    <IonContent>
      <HomePage />
    </IonContent>
  </IonApp>
</template>

<script setup>
import { IonApp, IonContent } from '@ionic/vue';
import HomePage from './views/HomePage.vue';
import { onMounted } from 'vue';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useGlobalStore } from '@/stores/globalStore';

const { tr, errToast } = useGlobalStore();

onMounted(() => {
  LocalNotifications.checkPermissions().then((res) => {
    if (res?.display !== 'denied') return;
    LocalNotifications.requestPermissions().then((res) => {
      if (res?.display === 'denied') errToast(tr.needNotifyPermission);
    });
  });
});
</script>
