<template>
  <ion-menu content-id="main-content" ref="menuRef">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.menu }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list @click="menuRef.$el.close()">
        <IconText :icon="mailOutline" :text="tr.contactUs" @click="contactUs" />
        <IconText :icon="trashOutline" :text="tr.deleteAll" @click="emit('deleteAll')" />
        <IconText :icon="shareSocialOutline" :text="tr.share" @click="shareApp" />
        <IconText :icon="starOutline" :text="tr.rateApp" @click="rateApp" />
        <IconText :icon="informationCircleOutline" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText :icon="settingsOutline" :text="tr.settings" @click="isOpen = true" />
        <IconText :icon="powerOutline" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-modal :is-open="isOpen" @didDismiss="isOpen = false">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.settings }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="isOpen = false">
            <ion-icon :icon="close" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-icon :icon="radioOutline" style="margin-right: 7px" />
          <ui-toggle :label="tr.vibro" v-model="params.vibro" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="musicalNoteOutline" style="margin-right: 7px" />
          <ui-toggle :label="tr.sound" v-model="params.sound" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="searchCircleOutline" style="margin-right: 7px" />
          <ui-toggle :label="tr.searchInDescription" v-model="params.searchInDesc" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="filterSharp" style="margin-right: 7px" />
          <ion-select :label="tr.sortBy" v-model="params.sortBy" v-bind="selectParams(tr.sortBy)">
            <ion-select-option v-for="val in sorts" :value="val">{{ tr[val] }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import {
  IonMenu, IonButton, IonContent, IonHeader, IonIcon, IonToolbar, IonModal, IonItem, IonLabel, IonList,
  IonTitle, IonButtons, IonSelect, IonSelectOption
} from '@ionic/vue';
import {
  close, mailOutline, powerOutline, informationCircleOutline, settingsOutline, starOutline, shareSocialOutline,
  trashOutline, radioOutline, musicalNoteOutline, searchCircleOutline, filterSharp,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { Storage } from "@ionic/storage";
import { onMounted, ref, watch, h } from "vue";
import { useGlobalStore } from "@/global.js"
import { Share } from '@capacitor/share';
import UiToggle from "@/components/UiToggle.vue";

const emit = defineEmits(['deleteAll'])

const { tr, params, alert } = useGlobalStore()
const storage = new Storage()
const sorts = ['createdDate', 'changedDate', 'titles', 'priorities', 'notifications']

const IconText = ({ text, icon }) =>
  h(IonItem, { button: true }, () => [
    h(IonIcon, { icon, style: 'margin-right: 10px' }), h(IonLabel, () => text)
  ])

const selectParams = (label) => ({ cancelText: tr.cancel, interfaceOptions: { header: label } })

const menuRef = ref()
const isOpen = ref(false)
const contactLink = 'mailto:azatgt96@gmail.com?subject=My%20Tasks%20Support&body='
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.memorytraining'

watch(params, (val) => storage.set('params', JSON.stringify(val)), { deep: true })

const contactUs = () => window.location.href = contactLink

const shareApp = () => Share.share({ text: tr.shareText, url: appLink })

const rateApp = () => window.location.href = appLink

const showAppInfo = () => {
  const assetsLinks = `\n\n${tr.flagIcons}:\nhttps://www.flaticon.com\n${tr.sounds}:\nhttps://mixkit.co/free-sound-effects`
  alert(tr.aboutText + assetsLinks, tr.appInfo)
}

onMounted(async () => {
  await storage.create()

  let _params = await storage.get('params')
  _params = _params ? JSON.parse(_params) : { vibro: true, sound: false, searchInDesc: false, sortBy: 'createdDate' }
  Object.assign(params, _params)
})
</script>