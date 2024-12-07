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
        <IconText icon="mailO" :text="tr.contactUs" @click="sendToEmail('', 'Support')" />
        <IconText icon="shareSocialO" :text="tr.share" @click="shareApp" />
        <IconText icon="starO" :text="tr.rateApp" @click="rateApp" />
        <IconText icon="languageO" :text="tr.helpWithTranslation" @click="$bus.open('TranslationModal')" />
        <IconText icon="informationCO" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText icon="settingsO" :text="tr.settings" @click="$bus.open('SettingsModal')" />
        <IconText icon="powerO" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <SettingsModal />
  <TranslationModal :lang />
</template>

<script setup>
import { IonMenu, IonButton, IonContent, IonHeader, IonToolbar, IonList, IonTitle, IonSelectOption } from '@ionic/vue';
import { App } from '@capacitor/app';
import { $, $$, $bus, delay, str, sendToEmail } from "@/helpers/utils.js";
import { langs, Translations } from "@/helpers/translations.js";
import { ref, watch } from "vue";
import { useGlobalStore } from "@/stores/globalStore";
import { Share } from '@capacitor/share';
import { IconText, Ikon, MenuBtn } from "@/components/renderFunctions.js";
import UiSelect from "@/components/UiSelect.vue";
import TranslationModal from '@/modals/TranslationModal.vue';
import SettingsModal from '@/modals/SettingsModal.vue';

const { tr, alert } = useGlobalStore()

const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.mytasks'

const shareApp = () => Share.share({ text: tr.shareText, url: appLink, dialogTitle: tr.shareUsing })

const rateApp = () => window.location.href = appLink

const showAppInfo = () => {
  const trAuthors = Object.keys(Translations).map(key => ` ${Translations[key]._language}: ${Translations[key]._trAuthor}`).join('\n')
  const fullText = tr.aboutText + `${tr.translation}:\n` + trAuthors

  const msg = str(fullText, 'Galyautdinov Azat', 'Ionic Framework 8, VueJs 3', 'https://www.flaticon.com', 'https://mixkit.co/free-sound-effects')
  alert(msg, tr.appInfo)
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
</script>

<style lang="sass">
.flag-icon
  border-radius: 50%
  box-shadow: 0px 0px 2px 0px gray

.alert-radio-label
  display: flex
</style>