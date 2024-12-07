<template>
  <UiModal name="TranslationModal" icon="languageO" :title="translationModalTitle">
    <template #button>
      <IonButton @click="sendTranslation">{{ tr.send }}</IonButton>
    </template>
    <IonList lines="none" class="tr-list">
      <IonItem>
        <IonInput :label="tr.lang" v-model="trData._language" fill="outline" />
      </IonItem>
      <IonItem v-for="key in Object.keys(Translations[lang]).slice(3)">
        <IonInput :value="Translations[lang][key].replaceAll('%s', ' ')" readonly fill="outline" />
        <IonInput v-model="trData[key]" style="margin-left: 5px" fill="outline" />
      </IonItem>
    </IonList>
  </UiModal>
</template>

<script setup>
import { IonItem, IonList, IonButton, IonInput } from '@ionic/vue';
import { useGlobalStore } from '@/stores/globalStore';
import { ref, computed } from 'vue';
import { Translations } from "@/helpers/translations.js";
import { $bus, sendToEmail } from "@/helpers/utils.js";
import { storeToRefs } from "pinia";
import UiModal from "@/components/UiModal.vue";

const { tr, errToast } = useGlobalStore()
const { lang } = storeToRefs(useGlobalStore())
const trData = ref({})

const translationModalTitle = computed(() => {
  const filled = Object.values(trData.value).filter(it => it?.trim()).length
  const all = Object.keys(Translations[lang.value]).length - 2

  return `${tr.translation}: ${filled}/${all}`
})

const sendTranslation = () => {
  if (!trData.value._language?.trim()) return errToast(tr.fillAllFields)
  for (const key of Object.keys(Translations[lang.value]).slice(3))
    if (!trData.value[key]?.trim()) return errToast(tr.fillAllFields)

  trData.value._baseLang = lang.value
  const trText = JSON.stringify(trData.value, null, 2).replace(/"([^"]+)":/g, '$1:')
  sendToEmail(trText, tr.translation)
  $bus.close('TranslationModal')
}
</script>

<style scoped lang="sass">
.tr-list ion-input
  min-height: 36px
</style>