<template>
  <UiModal name="SettingsModal" icon="settingsO" :title="tr.settings" @willPresent="Object.assign($params, params)">
    <template #button>
      <IconBtn icon="saveO" :disabled="isEqual($params, params)" @click="saveParams" />
    </template>
    <IonList>
      <ToggleIconItem icon="radioO" :label="tr.vibro" v-model="$params.vibro" />
      <ToggleIconItem icon="volumeMediumO" :label="tr.sound" v-model="$params.sound" />
      <ToggleIconItem icon="alertCO" :label="tr.offToastAlerts" v-model="$params.offToastAlerts" />
      <ToggleIconItem icon="searchCO" :label="tr.searchInDesc" v-model="$params.searchInDesc" />
      <ToggleIconItem icon="returnUpBackO" :label="tr.autoClose" v-model="$params.autoClose" />
      <ToggleIconItem icon="swapVerticalO" :label="tr.orderByDesc" v-model="$params.orderByDesc" />
      <IonItem>
        <Ikon icon="filterS" class="mr-10" />
        <UiSelect :label="tr.sortBy" v-model="$params.sortBy">
          <IonSelectOption v-for="val in sorts" :value="val">{{ tr[val].toLowerCase() }}</IonSelectOption>
        </UiSelect>
      </IonItem>
      <IconText icon="trashO" :text="tr.deleteAll" color="danger" :disabled="!tasks.length"
        @click="$bus.emit('deleteAll')" />
      <IconText icon="trashBinO" :text="tr.deleteAllCompleted" color="danger"
        :disabled="!tasks.filter(it => it.completed).length" @click="$bus.emit('deleteAllCompleted')" />
    </IonList>
  </UiModal>
</template>

<script setup>
import { IonItem, IonList, IonSelectOption } from '@ionic/vue';
import { isEqual } from "@/helpers/utils.js";
import { useGlobalStore } from '@/stores/globalStore';
import { useTaskStore } from "@/stores/taskStore";
import { reactive, onMounted, watch } from 'vue';
import { IconText, IconBtn, Ikon } from "@/components/renderFunctions.js";
import { $bus } from "@/helpers/utils.js";
import UiModal from "@/components/UiModal.vue";
import ToggleIconItem from "@/components/ToggleIconItem.vue";
import UiSelect from "@/components/UiSelect.vue";

const { tr, params, storage, toast } = useGlobalStore()
const { tasks } = useTaskStore()
const $params = reactive({})
const sorts = ['created', 'changed', 'title', 'priority', 'notification']

watch(params, (val) => storage.set('params', JSON.stringify(val)), { deep: true })

const saveParams = () => {
  Object.assign(params, $params)
  $bus.close('SettingsModal')
  toast(tr.paramsSaved)
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