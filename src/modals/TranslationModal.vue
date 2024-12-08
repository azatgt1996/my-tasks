<template>
  <UiModal name="TranslationModal" icon="languageO" :title="`${tr.translation}: ${filled}/${all}`">
    <template #button>
      <IonButton @click="sendTranslation">{{ tr.send }}</IonButton>
    </template>
    <IonList lines="none" class="tr-list">
      <IonItem>
        <IonInput :label="tr.lang" v-model="trData._language" fill="outline" />
      </IonItem>
      <IonItem v-for="key in Object.keys(Translations.EN).slice(3)">
        <IonInput :value="Translations[lang][key].replaceAll('%s', ' ')" readonly fill="outline" />
        <IonInput v-model="trData[key]" style="margin-left: 5px" fill="outline" />
      </IonItem>
    </IonList>
  </UiModal>
</template>

<script setup>
import { IonItem, IonList, IonButton, IonInput } from '@ionic/vue';
import { useGlobalStore } from '@/stores/globalStore';
import { ref, computed, toRefs } from 'vue';
import { Translations } from "@/helpers/translations.js";
import { $bus, sendToEmail, delay } from "@/helpers/utils.js";
import UiModal from "@/components/UiModal.vue";

const { tr, errToast, alert } = useGlobalStore()
const { lang } = toRefs(useGlobalStore())

const trData = ref({})
const all = Object.keys(Translations.EN).length - 2
const filled = computed(() => Object.values(trData.value).filter(it => it?.trim()).length)

const sendTranslation = async () => {
  if (filled.value !== all) return errToast(tr.fillAllFields)

  trData.value._baseLang = lang.value
  const trText = JSON.stringify(trData.value, null, 2).replace(/"([^"]+)":/g, '$1:')
  sendToEmail(trText, tr.translation)
  $bus.close('TranslationModal')
  await delay(1000)
  alert('Your translation will send to the developer', 'Thanks 😊')
}
</script>

<style scoped lang="sass">
.tr-list ion-input
  min-height: 36px
</style>