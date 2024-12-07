<template>
  <ion-menu content-id="main-content" id="main-menu">
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
          <Ikon :icon="darkMode ? 'moon' : 'sunny'" slot="icon-only"
            :style="{ color: darkMode ? 'yellow' : 'orange' }" />
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <IconText icon="albums" :text="tr.categories" @click="$bus.open('CategoriesModal')" />
        <IconText icon="mail" :text="tr.contactUs" @click="contactUs" />
        <IconText icon="share" :text="tr.share" @click="shareApp" />
        <IconText icon="star" :text="tr.rateApp" @click="rateApp" />
        <IconText icon="language" :text="tr.helpWithTranslation" @click="$bus.open('TranslationModal')" />
        <IconText icon="information" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText icon="settings" :text="tr.settings" @click="$bus.open('SettingsModal')" />
        <IconText icon="power" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <UiModal name="SettingsModal" icon="settings" :title="tr.settings" @willPresent="Object.assign($params, params)">
    <template #button>
      <IconBtn icon="save" :disabled="isEqual($params, params)" @click="saveParams" />
    </template>
    <ion-list>
      <ToggleIconItem icon="radio" :label="tr.vibro" v-model="$params.vibro" />
      <ToggleIconItem icon="volume" :label="tr.sound" v-model="$params.sound" />
      <ToggleIconItem icon="alert" :label="tr.offToastAlerts" v-model="$params.offToastAlerts" />
      <ToggleIconItem icon="searchCircle" :label="tr.searchInDesc" v-model="$params.searchInDesc" />
      <ToggleIconItem icon="return" :label="tr.autoClose" v-model="$params.autoClose" />
      <ToggleIconItem icon="swapVertical" :label="tr.orderByDesc" v-model="$params.orderByDesc" />
      <ion-item>
        <Ikon icon="filter" class="mr-10" />
        <UiSelect :label="tr.sortBy" v-model="$params.sortBy">
          <ion-select-option v-for="val in sorts" :value="val">{{ tr[val].toLowerCase() }}</ion-select-option>
        </UiSelect>
      </ion-item>
      <IconText icon="trash" :text="tr.deleteAll" color="danger" :disabled="!tasksLength" @click="emit('deleteAll')" />
      <IconText icon="trashBin" :text="tr.deleteAllCompleted" color="danger" :disabled="!completedTasksLength"
        @click="emit('deleteAllCompleted')" />
    </ion-list>
  </UiModal>

  <UiModal name="TranslationModal" icon="language" :title="translationModalTitle">
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
  IonMenu, IonButton, IonContent, IonHeader, IonToolbar, IonItem, IonList, IonTitle, IonButtons,
  IonSelectOption, IonInput, IonMenuButton
} from '@ionic/vue';
import { App } from '@capacitor/app';
import { $, $$, $bus, delay, str, isEqual, sendToEmail } from "@/helpers/utils.js";
import { langs, Translations } from "@/helpers/translations.js";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { Share } from '@capacitor/share';
import { IconText, IconBtn, Ikon } from "@/components/renderFunctions.js";
import ToggleIconItem from "@/components/ToggleIconItem.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiModal from "@/components/UiModal.vue";

const props = defineProps({
  tasksLength: Number,
  completedTasksLength: Number,
})

const emit = defineEmits(['deleteAll', 'deleteAllCompleted'])

const { tr, params, storage, alert, toast, errToast } = useGlobalStore()

const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href
const sorts = ['created', 'changed', 'title', 'priority', 'notification']
const trData = ref({})
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.mytasks'

const translationModalTitle = computed(() => {
  const filled = Object.values(trData.value).filter(it => it?.trim()).length
  const all = Object.keys(Translations[lang.value]).length - 2

  return `${tr.translation}: ${filled}/${all}`
})

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
  $bus.close('TranslationModal')
}

const $params = reactive({})

const saveParams = () => {
  Object.assign(params, $params)
  $bus.close('SettingsModal')
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
</style>

<style lang="sass">
.flag-icon
  border-radius: 50%
  box-shadow: 0px 0px 2px 0px gray

.alert-radio-label
  display: flex
</style>