<template>
  <ion-menu content-id="main-content" ref="menuRef">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title>{{ tr.menu }}</ion-title>
        <UiSelect v-show="false" v-model="lang" id="langSelect" :header="tr.selectLang">
          <ion-select-option v-for="_lang in langs" :value="_lang">{{ _lang }}</ion-select-option>
        </UiSelect>
        <ion-button slot="end" color="medium" shape="round" fill="clear" @click="langClick">
          <img slot="icon-only" class="flag-icon" :src="getFlagImg(lang)" :alt="lang" width="22" />
        </ion-button>
        <ion-button slot="end" color="medium" shape="round" fill="clear" @click="toggleDarkMode" class="mr-10">
          <ion-icon slot="icon-only" :icon="darkMode ? moon : sunny"
            :style="{ color: darkMode ? '#FFFF77' : 'orange' }" />
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <IconText :icon="albumsOutline" :text="tr.categories" @click="closeMenu(); emit('openCategories')" />
        <IconText :icon="mailOutline" :text="tr.contactUs" @click="contactUs" />
        <IconText :icon="shareSocialOutline" :text="tr.share" @click="shareApp" />
        <IconText :icon="starOutline" :text="tr.rateApp" @click="rateApp" />
        <IconText :icon="languageOutline" :text="tr.helpWithTranslation" @click="translationModal.open()" />
        <IconText :icon="informationCircleOutline" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText :icon="settingsOutline" :text="tr.settings" @click="openSettingsModal" />
        <IconText :icon="powerOutline" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <UiModal ref="settingsModal" :icon="settingsOutline" :title="tr.settings" @didPresent="closeMenu">
    <template #button>
      <IconBtn :icon="saveOutline" :disabled="isEqual($params, params)" @click="saveParams" />
    </template>
    <ion-list class="params-list">
      <ToggleIconItem :icon="radioOutline" :label="tr.vibro" v-model="$params.vibro" />
      <ToggleIconItem :icon="volumeMediumOutline" :label="tr.sound" v-model="$params.sound" />
      <ToggleIconItem :icon="alertCircleOutline" :label="tr.offToastAlerts" v-model="$params.offToastAlerts" />
      <ToggleIconItem :icon="searchCircleOutline" :label="tr.searchInDesc" v-model="$params.searchInDesc" />
      <ToggleIconItem :icon="returnUpBackOutline" :label="tr.autoClose" v-model="$params.autoClose" />
      <ToggleIconItem :icon="swapVerticalOutline" :label="tr.orderByDesc" v-model="$params.orderByDesc" />
      <ion-item>
        <ion-icon :icon="filterSharp" />
        <UiSelect :label="tr.sortBy" v-model="$params.sortBy">
          <ion-select-option v-for="val in sorts" :value="val">{{ tr[val].toLowerCase() }}</ion-select-option>
        </UiSelect>
      </ion-item>
      <ion-item button @click="emit('deleteAll')" :disabled="!tasksLength">
        <ion-icon :icon="trashOutline" color="danger" />
        <ion-label color="danger">{{ tr.deleteAll }}</ion-label>
      </ion-item>
      <ion-item button @click="emit('deleteAllCompleted')" :disabled="!completedTasksLength">
        <ion-icon :icon="trashBinOutline" color="danger" />
        <ion-label color="danger">{{ tr.deleteAllCompleted }}</ion-label>
      </ion-item>
    </ion-list>
  </UiModal>

  <UiModal ref="translationModal" :icon="languageOutline" @didPresent="closeMenu"
    :title="`${tr.translation}: ${Object.values(trData).filter(it => it?.trim()).length}/${Object.keys(Translations[lang]).length - 2}`">
    <template #button>
      <ion-button @click="sendTranslation">{{ tr.send }}</ion-button>
    </template>
    <ion-list lines="none" class="tr-list">
      <ion-item>
        <ion-input :label="tr.lang" v-model="trData._language" fill="outline" />
      </ion-item>
      <ion-item v-for="key in Object.keys(Translations[lang]).slice(3)">
        <ion-input :value="Translations[lang][key].replaceAll('%s', ' ')" readonly fill="outline" />
        <ion-input v-model="trData[key]" style="margin-left: 5px" fill="outline" />
      </ion-item>
    </ion-list>
  </UiModal>
</template>

<script setup>
import {
  IonMenu, IonButton, IonContent, IonHeader, IonIcon, IonToolbar, IonItem, IonList, IonTitle, IonButtons,
  IonSelectOption, IonLabel, IonInput, IonMenuButton
} from '@ionic/vue';
import {
  mailOutline, powerOutline, informationCircleOutline, settingsOutline, starOutline, shareSocialOutline,
  trashOutline, radioOutline, searchCircleOutline, filterSharp, volumeMediumOutline, swapVerticalOutline, saveOutline, returnUpBackOutline,
  languageOutline, sunny, moon, albumsOutline, alertCircleOutline, trashBinOutline,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { $, $$, delay, str, isEqual, sendToEmail } from "@/utils.js";
import { langs, Translations } from "@/translations.js";
import { onMounted, reactive, ref, watch } from "vue";
import { useGlobalStore } from "@/global.js";
import { Share } from '@capacitor/share';
import { IconText, IconBtn } from "@/components/renderFunctions.js";
import ToggleIconItem from "@/components/ToggleIconItem.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiModal from "@/components/UiModal.vue";

const props = defineProps({
  tasksLength: Number,
  completedTasksLength: Number,
})

const emit = defineEmits(['deleteAll', 'deleteAllCompleted', 'openCategories'])

const { tr, params, storage, alert, toast, errToast } = useGlobalStore()

const ls = localStorage
const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href
const sorts = ['created', 'changed', 'title', 'priority', 'notification']
const menuRef = ref()
const settingsModal = ref()
const translationModal = ref()
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
  if (!trData.value._language?.trim()) return errToast(tr.fillAllFields)
  for (const key of Object.keys(Translations[lang.value]).slice(3))
    if (!trData.value[key]?.trim()) return errToast(tr.fillAllFields)

  trData.value._baseLang = lang.value
  const trText = JSON.stringify(trData.value, null, 2).replace(/"([^"]+)":/g, '$1:')
  sendToEmail(trText, tr.translation)
  translationModal.value.close()
}

const $params = reactive({})

const openSettingsModal = () => {
  Object.assign($params, params)
  settingsModal.value.open()
}

const saveParams = () => {
  Object.assign(params, $params)
  settingsModal.value.close()
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

const langClick = async () => {
  $('#langSelect').click()
  await delay(50)

  for (const opt of $$('.alert-radio-label')) {
    const _lang = opt.innerHTML
    const flagHref = getFlagImg(_lang)
    opt.innerHTML = `<img src="${flagHref}" class="flag-icon mr-10" style="width: 20px"/>` + Translations[_lang]._language
  }
}

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

<style scoped lang="sass">
.tr-list ion-input
  min-height: 36px

.params-list ion-icon
  margin-right: 10px
</style>

<style lang="sass">
.flag-icon
  border-radius: 50%
  box-shadow: 0px 0px 2px 0px gray

.alert-radio-label
  display: flex

</style>