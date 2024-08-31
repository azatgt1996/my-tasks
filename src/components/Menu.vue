<template>
  <ion-menu content-id="main-content" ref="menuRef">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.menu }}</ion-title>
        <img slot="end" :src="getFlagImg(lang)" :alt="lang" width="30" @click="$('#langSelect').click()"
          style="margin-right: 8px" />
        <ion-select v-show="false" v-model="lang" id="langSelect" v-bind="selectProps(tr.selectLang)">
          <ion-select-option v-for="lang in langs" :value="lang.value">{{ lang.label }}</ion-select-option>
        </ion-select>
        <ion-icon :icon="isDarkMode ? moon : sunny" slot="end" size="large" @click="toggleDarkMode"
          style="margin-right: 8px" />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <IconText :icon="mailOutline" :text="tr.contactUs" @click="contactUs" />
        <IconText :icon="shareSocialOutline" :text="tr.share" @click="shareApp" />
        <IconText :icon="starOutline" :text="tr.rateApp" @click="rateApp" />
        <IconText :icon="languageOutline" :text="tr.helpWithTranslation" @click="openSelect" />
        <ion-select v-show="false" v-model="baseLang" id="langSelect2" v-bind="selectProps(tr.selectExLang, tr.msg)"
          @ionChange="trModal = true">
          <ion-select-option v-for="lang in langs" :value="lang.value">{{ lang.label }}</ion-select-option>
        </ion-select>
        <IconText :icon="helpCircleOutline" :text="tr.guide" @click="showGuide" />
        <IconText :icon="diamondOutline" :text="tr.buyPrem" @click="buyPremium" />
        <IconText :icon="informationCircleOutline" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText :icon="settingsOutline" :text="tr.settings" @click="openSettingsModal" />
        <IconText :icon="powerOutline" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-modal :is-open="isOpen" @didDismiss="isOpen = false" @didPresent="closeMenu">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.settings }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveParams" :disabled="isEqual($params, params)">
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
        <ion-item>
          <ion-icon :icon="returnUpBackOutline" />
          <ui-toggle :label="tr.autoCloseAfterSave" v-model="$params.autoCloseAfterSave" />
        </ion-item>
        <ion-item button @click="emit('deleteAll')" :disabled="!taskLength">
          <ion-icon :icon="trashOutline" color="danger" />
          <ion-label color="danger">{{ tr.deleteAll }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>

  <ion-modal :is-open="trModal" @didDismiss="trModal = false" @didPresent="closeMenu">
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
      <ion-list lines="none" class="tr-list">
        <ion-item>
          <ion-input :label="tr.lang" v-model="trData._language" fill="outline" />
        </ion-item>
        <ion-item>
          <ion-input :label="tr.trAuthor" v-model="trData._trAuthor" fill="outline" />
        </ion-item>
        <ion-item v-for="key in Object.keys(Translations[baseLang]).slice(2)">
          <ion-input :value="Translations[baseLang][key]" readonly fill="outline" />
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
  trashOutline, radioOutline, searchCircleOutline, filterSharp, volumeLowOutline, swapVerticalOutline, saveSharp, returnUpBackOutline,
  languageOutline, helpCircleOutline, diamondOutline, sunny, moon,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { $, str, isEqual, sendToEmail, delay } from "@/utils.js";
import { langs, Translations } from "@/translations.js";
import { onMounted, reactive, ref, watch } from "vue";
import { useGlobalStore } from "@/global.js";
import { Share } from '@capacitor/share';
import { IconText } from "@/components/renderFunctions.js";
import UiToggle from "@/components/UiToggle.vue";

const props = defineProps({
  taskLength: Number
})

const emit = defineEmits(['deleteAll'])

const { tr, params, storage, selectProps, alert, toast } = useGlobalStore()

// #region Dark mode
const isDarkMode = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  storage.set('darkMode', isDarkMode.value)
  document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value)
}
// #endregion

const lang = ref()
watch(lang, (val) => {
  storage.set('lang', val)
  Object.assign(tr, Translations[val])
})

const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href
const sorts = ['created', 'changed', 'title', 'priority', 'notification']
const menuRef = ref()
const isOpen = ref(false)
const trModal = ref(false)
const baseLang = ref()
const trData = ref({})
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.mytasks'

const closeMenu = () => menuRef.value.$el.close()

watch(params, (val) => storage.set('params', JSON.stringify(val)), { deep: true })

const contactUs = () => sendToEmail('', 'Support')

const shareApp = () => Share.share({ text: tr.shareText, url: appLink, dialogTitle: tr.share.split(' ')[0] })

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

const openSelect = async () => {
  baseLang.value = lang.value
  await delay(100)
  $('#langSelect2').click()
}

const sendTranslation = () => {
  for (const key of Object.keys(Translations[baseLang.value]))
    if (!trData.value[key]?.trim()) return toast(tr.fillAllFields, 'warning')

  trData.value._baseLang = baseLang.value
  const trText = JSON.stringify(trData.value, null, 2).replace(/"([^"]+)":/g, '$1:')
  sendToEmail(trText, tr.translation)
  trModal.value = false
}

const showGuide = () => { }
const buyPremium = () => { }

const $params = reactive({})

const openSettingsModal = () => {
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
    sortBy: 'created', orderByDesc: false, autoCloseAfterSave: true,
  }
  _params = _params ? JSON.parse(_params) : defaultParams
  Object.assign(params, _params)

  isDarkMode.value = await storage.get('darkMode')
  document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value)

  const navLang = window.navigator.language.split('-')[0].toUpperCase()
  const _langs = Object.keys(Translations)
  lang.value = (await storage.get('lang')) ?? (_langs.includes(navLang) ? navLang : _langs[0])
})
</script>

<style scoped>
.params-list ion-icon {
  margin-right: 10px;
}

.tr-list ion-input {
  min-height: 36px; 
}
</style>