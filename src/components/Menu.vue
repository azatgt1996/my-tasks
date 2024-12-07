<template>
  <ion-menu content-id="main-content" id="main-menu">
    <ion-header>
      <ion-toolbar>
        <MenuBtn />
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
        <IconText icon="albumsO" :text="tr.categories" @click="$bus.open('CategoriesModal')" />
        <IconText icon="mailO" :text="tr.contactUs" @click="contactUs" />
        <IconText icon="shareSocialO" :text="tr.share" @click="shareApp" />
        <IconText icon="starO" :text="tr.rateApp" @click="rateApp" />
        <IconText icon="languageO" :text="tr.helpWithTranslation" @click="$bus.open('TranslationModal')" />
        <IconText icon="informationCO" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText icon="settingsO" :text="tr.settings" @click="$bus.open('SettingsModal')" />
        <IconText icon="powerO" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <UiModal name="SettingsModal" icon="settingsO" :title="tr.settings" @willPresent="Object.assign($params, params)">
    <template #button>
      <IconBtn icon="saveO" :disabled="isEqual($params, params)" @click="saveParams" />
    </template>
    <ion-list>
      <ToggleIconItem icon="radioO" :label="tr.vibro" v-model="$params.vibro" />
      <ToggleIconItem icon="volumeMediumO" :label="tr.sound" v-model="$params.sound" />
      <ToggleIconItem icon="alertCO" :label="tr.offToastAlerts" v-model="$params.offToastAlerts" />
      <ToggleIconItem icon="searchCO" :label="tr.searchInDesc" v-model="$params.searchInDesc" />
      <ToggleIconItem icon="returnUpBackO" :label="tr.autoClose" v-model="$params.autoClose" />
      <ToggleIconItem icon="swapVerticalO" :label="tr.orderByDesc" v-model="$params.orderByDesc" />
      <ion-item>
        <Ikon icon="filterS" class="mr-10" />
        <UiSelect :label="tr.sortBy" v-model="$params.sortBy">
          <ion-select-option v-for="val in sorts" :value="val">{{ tr[val].toLowerCase() }}</ion-select-option>
        </UiSelect>
      </ion-item>
      <IconText icon="trashO" :text="tr.deleteAll" color="danger" :disabled="!tasksLength" @click="emit('deleteAll')" />
      <IconText icon="trashBinO" :text="tr.deleteAllCompleted" color="danger" :disabled="!completedTasksLength"
        @click="emit('deleteAllCompleted')" />
    </ion-list>
  </UiModal>

  <TranslationModal :lang />
</template>

<script setup>
import {
  IonMenu, IonButton, IonContent, IonHeader, IonToolbar, IonItem, IonList, IonTitle, IonSelectOption
} from '@ionic/vue';
import { App } from '@capacitor/app';
import { $, $$, $bus, delay, str, isEqual, sendToEmail } from "@/helpers/utils.js";
import { langs, Translations } from "@/helpers/translations.js";
import { onMounted, reactive, ref, watch } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { Share } from '@capacitor/share';
import { IconText, IconBtn, Ikon, MenuBtn } from "@/components/renderFunctions.js";
import ToggleIconItem from "@/components/ToggleIconItem.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiModal from "@/components/UiModal.vue";
import TranslationModal from '@/modals/TranslationModal.vue';

const props = defineProps({
  tasksLength: Number,
  completedTasksLength: Number,
})

const emit = defineEmits(['deleteAll', 'deleteAllCompleted'])

const { tr, params, storage, alert, toast } = useGlobalStore()

const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href
const sorts = ['created', 'changed', 'title', 'priority', 'notification']
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.mytasks'

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

watch(params, (val) => storage.set('params', JSON.stringify(val)), { deep: true })

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

<style lang="sass">
.flag-icon
  border-radius: 50%
  box-shadow: 0px 0px 2px 0px gray

.alert-radio-label
  display: flex
</style>