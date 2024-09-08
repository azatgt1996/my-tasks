<template>
  <ion-menu content-id="main-content" ref="menuRef">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.menu }}</ion-title>
        <img slot="end" :src="getFlagImg(lang)" :alt="lang" width="30" @click="$('#langSelect').click()"
          style="margin-right: 8px" />
        <ion-select v-show="false" v-model="lang" id="langSelect" v-bind="selectProps(tr.selectLang)">
          <ion-select-option v-for="({ label, value }) in langs" class="flag" :class="'flag-' + value" :value>
            {{ label }}
          </ion-select-option>
        </ion-select>
        <ion-icon :icon="darkMode ? moon : sunny" slot="end" size="large" @click="toggleDarkMode"
          style="margin-right: 8px" />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <IconText :icon="albumsOutline" :text="tr.categories" @click="closeMenu(); emit('openCategories')" />
        <IconText :icon="mailOutline" :text="tr.contactUs" @click="contactUs" />
        <IconText :icon="shareSocialOutline" :text="tr.share" @click="shareApp" />
        <IconText :icon="starOutline" :text="tr.rateApp" @click="rateApp" />
        <IconText :icon="languageOutline" :text="tr.helpWithTranslation" @click="trModal = true" />
        <!-- <IconText :icon="diamondOutline" :text="tr.buyPrem" @click="buyPremium" /> -->
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
          <IconBtn :icon="saveSharp" :disabled="isEqual($params, params)" @click="saveParams" />
          <IconBtn :icon="closeCircleOutline" @click="isOpen = false" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ToggleIconItem :icon="radioOutline" :label="tr.vibro" v-model="$params.vibro" />
        <ToggleIconItem :icon="volumeLowOutline" :label="tr.sound" v-model="$params.sound" />
        <ToggleIconItem :icon="alertCircleOutline" :label="tr.offToastAlerts" v-model="$params.offToastAlerts" />
        <ToggleIconItem :icon="searchCircleOutline" :label="tr.searchInDesc" v-model="$params.searchInDesc" />
        <ToggleIconItem :icon="returnUpBackOutline" :label="tr.autoClose" v-model="$params.autoClose" />
        <ToggleIconItem :icon="swapVerticalOutline" :label="tr.orderByDesc" v-model="$params.orderByDesc" />
        <ion-item>
          <ion-icon :icon="filterSharp" />
          <ion-select :label="tr.sortBy" v-model="$params.sortBy" v-bind="selectProps(tr.sortBy)">
            <ion-select-option v-for="val in sorts" :value="val">{{ tr[val].toLowerCase() }}</ion-select-option>
          </ion-select>
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
          <IconBtn :icon="closeCircleOutline" @click="trModal = false" />
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
        <ion-item v-for="key in Object.keys(Translations[lang]).slice(2)">
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
  trashOutline, radioOutline, searchCircleOutline, filterSharp, volumeLowOutline, swapVerticalOutline, saveSharp, returnUpBackOutline,
  languageOutline, sunny, moon, albumsOutline, alertCircleOutline, diamondOutline,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { $, str, isEqual, sendToEmail, delay } from "@/utils.js";
import { langs, Translations } from "@/translations.js";
import { onMounted, reactive, ref, watch } from "vue";
import { useGlobalStore } from "@/global.js";
import { Share } from '@capacitor/share';
import { IconText, IconBtn } from "@/components/renderFunctions.js";
import ToggleIconItem from "@/components/ToggleIconItem.vue";

const props = defineProps({
  taskLength: Number
})

const emit = defineEmits(['deleteAll', 'openCategories'])

const { tr, params, storage, selectProps, alert, toast } = useGlobalStore()

const ls = localStorage
const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href
const sorts = ['created', 'changed', 'title', 'priority', 'notification']
const menuRef = ref()
const isOpen = ref(false)
const trModal = ref(false)
const trData = ref({})
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.mytasks'

const closeMenu = () => menuRef.value.$el.close()

watch(params, (val) => storage.set('params', JSON.stringify(val)), { deep: true })

const contactUs = () => sendToEmail('', 'Support')

const shareApp = () => Share.share({ text: tr.shareText, url: appLink, dialogTitle: tr.shareUsing })

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

  trData.value._baseLang = lang.value
  const trText = JSON.stringify(trData.value, null, 2).replace(/"([^"]+)":/g, '$1:')
  sendToEmail(trText, tr.translation)
  trModal.value = false
}

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

// Dark mode
const _darkMode = (ls.darkMode ?? window.matchMedia?.('(prefers-color-scheme: dark)').matches.toString()) === 'true'
const darkMode = ref(_darkMode)
document.documentElement.classList.toggle('ion-palette-dark', _darkMode)

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  ls.darkMode = darkMode.value
  document.documentElement.classList.toggle('ion-palette-dark', darkMode.value)
}

// Language
const navLang = window.navigator.language.split('-')[0].toUpperCase()
const _langs = Object.keys(Translations)
const lang = ref(ls.lang ?? (_langs.includes(navLang) ? navLang : _langs[0]))
Object.assign(tr, Translations[lang.value])

watch(lang, (val) => {
  ls.lang = val
  Object.assign(tr, Translations[val])
})

onMounted(async () => {
  let _params = await storage.get('params')
  const defaultParams = {
    vibro: true, sound: false, offToastAlerts: false, searchInDesc: false,
    sortBy: 'created', orderByDesc: false, autoClose: true,
  }
  _params = _params ? JSON.parse(_params) : defaultParams
  Object.assign(params, _params)
})
</script>

<style scoped>
.tr-list ion-input {
  min-height: 36px;
}
</style>

<style>
.flag-EN .alert-radio-label::before { background: url(src/assets/flags/EN.png) }
.flag-ES .alert-radio-label::before { background: url(src/assets/flags/ES.png) }
.flag-RU .alert-radio-label::before { background: url(src/assets/flags/RU.png) }

.flag .alert-radio-label {
  display: flex;
  align-items: center;
}

.flag .alert-radio-label::before {
  width: 17px;
  height: 17px;
  content: "";
  background-size: 100%;
  margin-right: 8px;
}
</style>