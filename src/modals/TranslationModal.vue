<template>
  <UiModal name="TranslationModal" icon="languageO" :title="translationModalTitle">
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
import { IonItem, IonList, IonButton, IonInput } from '@ionic/vue';
import { useGlobalStore } from '@/stores/global';
import { ref, computed } from 'vue';
import { Translations } from "@/helpers/translations.js";
import { $bus, sendToEmail } from "@/helpers/utils.js";
import UiModal from "@/components/UiModal.vue";

const props = defineProps({
  lang: String
})

const { tr, errToast } = useGlobalStore()
const trData = ref({})

const translationModalTitle = computed(() => {
  const filled = Object.values(trData.value).filter(it => it?.trim()).length
  const all = Object.keys(Translations[props.lang]).length - 2

  return `${tr.translation}: ${filled}/${all}`
})

const sendTranslation = () => {
  if (!trData.value._language?.trim()) return errToast(tr.fillAllFields)
  for (const key of Object.keys(Translations[props.lang]).slice(3))
    if (!trData.value[key]?.trim()) return errToast(tr.fillAllFields)

  trData.value._baseLang = props.lang
  const trText = JSON.stringify(trData.value, null, 2).replace(/"([^"]+)":/g, '$1:')
  sendToEmail(trText, tr.translation)
  $bus.close('TranslationModal')
}
</script>

<style scoped lang="sass">
.tr-list ion-input
  min-height: 36px
</style>