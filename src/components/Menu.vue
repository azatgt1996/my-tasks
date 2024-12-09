<template>
  <IonMenu content-id="main-content" id="main-menu">
    <IonHeader>
      <IonToolbar>
        <MenuBtn />
        <IonTitle>{{ tr.menu }}</IonTitle>
        <LangToggler />
        <DarkModeToggler />
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonList>
        <IconText icon="albumsO" :text="tr.categories" @click="$bus.open('CategoriesModal')" />
        <IconText icon="mailO" :text="tr.contactUs" @click="sendToEmail('', 'Support')" />
        <IconText icon="shareSocialO" :text="tr.share" @click="shareApp" />
        <IconText icon="starO" :text="tr.rateApp" @click="rateApp" />
        <IconText icon="languageO" :text="tr.helpWithTranslation" @click="$bus.open('TranslationModal')" />
        <IconText icon="informationCO" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText icon="settingsO" :text="tr.settings" @click="$bus.open('SettingsModal')" />
        <IconText icon="powerO" :text="tr.exit" @click="App.exitApp()" />
      </IonList>
    </IonContent>
  </IonMenu>

  <SettingsModal />
  <TranslationModal />
</template>

<script setup>
import { IonMenu, IonContent, IonHeader, IonToolbar, IonList, IonTitle } from '@ionic/vue';
import { IconText, MenuBtn } from "@/components/renderFunctions.js";
import { App } from '@capacitor/app';
import { $bus, str, sendToEmail } from "@/helpers/utils.js";
import { Translations } from "@/helpers/translations.js";
import { useGlobalStore } from "@/stores/globalStore";
import { Share } from '@capacitor/share';
import LangToggler from "@/components/LangToggler.vue";
import DarkModeToggler from "@/components/DarkModeToggler.vue";
import TranslationModal from '@/modals/TranslationModal.vue';
import SettingsModal from '@/modals/SettingsModal.vue';

const { tr, alert } = useGlobalStore()

const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.mytasks'

const shareApp = () => Share.share({ text: tr.shareText, url: appLink, dialogTitle: tr.shareUsing })

const rateApp = () => window.location.href = appLink

const showAppInfo = () => {
  const trAuthors = Object.keys(Translations).map(key => ` ${Translations[key]._language}: ${Translations[key]._trAuthor}`)
  const fullText = `${tr.aboutText}${tr.translation}:\n${trAuthors.join('\n')}`

  const msg = str(fullText, 'Galyautdinov Azat', 'Ionic Framework 8, VueJs 3', 'www.flaticon.com', 'mixkit.co/free-sound-effects')
  alert(msg, tr.appInfo)
}
</script>