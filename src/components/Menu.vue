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
        <IconText :icon="shareSocialOutline" :text="tr.share" @click="shareApp" />
        <IconText :icon="starOutline" :text="tr.rateApp" @click="rateApp" />
        <IconText :icon="informationCircleOutline" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText :icon="settingsOutline" :text="tr.settings" @click="openSettingsModal" />
        <IconText :icon="powerOutline" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-modal :is-open="isOpen" @didDismiss="isOpen = false">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.settings }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveParams">
            <ion-icon :icon="saveSharp" />
          </ion-button>
          <ion-button @click="isOpen = false">
            <ion-icon :icon="closeCircleOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list class="params-list">
        <ion-item>
          <ion-icon :icon="radioOutline" />
          <ui-toggle :label="tr.vibro" v-model="$params.vibro" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="volumeLowOutline" />
          <ui-toggle :label="tr.sound" v-model="$params.sound" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="searchCircleOutline" />
          <ui-toggle :label="tr.searchInDescription" v-model="$params.searchInDesc" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="filterSharp" />
          <ion-select :label="tr.sortBy" v-model="$params.sortBy" v-bind="selectProps(tr.sortBy)">
            <ion-select-option v-for="val in sorts" :value="val">{{ tr[val].toLowerCase() }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-icon :icon="swapVerticalOutline" />
          <ui-toggle :label="tr.orderByDesc" v-model="$params.orderByDesc" />
        </ion-item>
        <ion-item button @click="$('#langSelect2').click()">
          <ion-icon :icon="languageOutline" />
          <ion-label>{{ tr.helpWithTranslation }}</ion-label>
          <ion-select v-show="false" v-model="lang" id="langSelect2" v-bind="selectProps(tr.selectExLang, tr.msg)"
            @ionChange="trModal = true">
            <ion-select-option v-for="lang in langs" :value="lang.value">{{ lang.label }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item button @click="emit('deleteAll')">
          <ion-icon :icon="trashOutline" color="danger" />
          <ion-label color="danger">{{ tr.deleteAll }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>

  <ion-modal :is-open="trModal" @didDismiss="trModal = false">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.translation }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="sendTranslation">{{ tr.send }}</ion-button>
          <ion-button @click="trModal = false">
            <ion-icon :icon="closeCircleOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="none">
        <ion-item class="tr-item">
          <ion-input :label="tr.lang" v-model="trData._language" fill="outline" />
        </ion-item>
        <ion-item class="tr-item">
          <ion-input :label="tr.trAuthor" v-model="trData._trAuthor" fill="outline" />
        </ion-item>
        <ion-item v-for="key in Object.keys(Translations[lang]).slice(2)" class="tr-item">
          <ion-input :value="Translations[lang][key]" readonly fill="outline" />
          <ion-input v-model="trData[key]" style="margin-left: 5px" fill="outline" />
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import {
  IonMenu, IonButton, IonContent, IonHeader, IonIcon, IonToolbar, IonModal, IonItem, IonList, IonTitle, IonButtons,
  IonSelect, IonSelectOption, IonLabel, IonInput
} from '@ionic/vue';
import {
  closeCircleOutline, mailOutline, powerOutline, informationCircleOutline, settingsOutline, starOutline, shareSocialOutline,
  trashOutline, radioOutline, searchCircleOutline, filterSharp, volumeLowOutline, swapVerticalOutline, saveSharp,
  languageOutline,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { $, str, sendToEmail } from "@/utils.js";
import { langs, Translations } from "@/translations.js";
import { onMounted, reactive, ref, watch } from "vue";
import { useGlobalStore } from "@/global.js"
import { Share } from '@capacitor/share';
import { IconText } from "@/components/renderFunctions.js";
import UiToggle from "@/components/UiToggle.vue";

const props = defineProps({
  language: String,
})

const emit = defineEmits(['deleteAll'])

const { tr, params, storage, selectProps, alert, toast } = useGlobalStore()

const sorts = ['created', 'changed', 'title', 'priority', 'notification']
const menuRef = ref()
const isOpen = ref(false)
const trModal = ref(false)
const lang = ref()
const trData = ref({})
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.mytasks'

watch(params, (val) => storage.set('params', JSON.stringify(val)), { deep: true })

const contactUs = () => sendToEmail('', 'Support')

const shareApp = () => Share.share({ text: tr.shareText, url: appLink })

const rateApp = () => window.location.href = appLink

const showAppInfo = () => {
  const author = 'Galyautdinov Azat'
  const techStack = 'Ionic Framework 8, VueJs 3'
  const flagIconsLink = 'https://www.flaticon.com'
  const soundsLink = 'https://mixkit.co/free-sound-effects'

  const trAuthors = Object.keys(Translations).map(key => ` ${Translations[key]._language}: ${Translations[key]._trAuthor}`).join('\n')
  const fullText = tr.aboutText + `${tr.translation}:\n` + trAuthors

  const msg = str(fullText, author, techStack, flagIconsLink, soundsLink)
  alert(msg, tr.appInfo)
}

const sendTranslation = () => {
  for (const key of Object.keys(Translations[lang.value]))
    if (!trData.value[key]?.trim()) return toast(tr.fillAllFields, 'warning')

  const trText = JSON.stringify(trData.value, null, 2).replace(/"([^"]+)":/g, '$1:')
  sendToEmail(trText, tr.translation)
  trModal.value = false
}

const $params = reactive({})

const openSettingsModal = () => {
  lang.value = props.language
  Object.assign($params, params)
  isOpen.value = true
}

const saveParams = () => {
  Object.assign(params, $params)
  isOpen.value = false
  toast(tr.paramsSaved)
}

onMounted(async () => {
  await storage.create()

  let _params = await storage.get('params')
  const defaultParams = {
    vibro: true, sound: false, searchInDesc: false,
    sortBy: 'created', orderByDesc: false,
  }
  _params = _params ? JSON.parse(_params) : defaultParams
  Object.assign(params, _params)
})
</script>

<style scoped>
.params-list ion-icon {
  margin-right: 10px;
}

.tr-item ion-input {
  min-height: 36px;
}

.tr-item ion-input label.input-wrapper {
  padding: 5px !important;
}
</style>