<template>
  <UiSelect v-show="false" v-model="lang" id="langSelect" :header="tr.selectLang">
    <IonSelectOption v-for="_lang in langs" :value="_lang">{{ _lang }}</IonSelectOption>
  </UiSelect>
  <IonButton slot="end" color="medium" shape="round" fill="clear" @click="langClick">
    <img slot="icon-only" class="flag-icon" :src="getFlagImg(lang)" :alt="lang" width="22" />
  </IonButton>
</template>

<script setup>
import { watch } from "vue";
import { IonButton, IonSelectOption } from '@ionic/vue';
import { langs, Translations } from "@/helpers/translations.js";
import { useGlobalStore } from "@/stores/globalStore";
import { $, $$, delay } from "@/helpers/utils.js";
import { storeToRefs } from "pinia";
import UiSelect from "@/components/UiSelect.vue";

const { tr } = useGlobalStore()
const { lang } = storeToRefs(useGlobalStore())

const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href

const navLang = window.navigator.language.split('-')[0].toUpperCase()
const _langs = Object.keys(Translations)
lang.value = ls.lang ?? (_langs.includes(navLang) ? navLang : _langs[0])
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