<template>
  <UiModal name="TaskModal" icon="readerO" :title="tr.detailInfo"
    @dblClick="!isEqual(originalCurrent, current) && saveTask(current)" @opened="openedModal"
    @swipedLeft="data.at(-1)?.id !== current.id && nextTask()" @swipedRight="data[0]?.id !== current.id && prevTask()">
    <template #button>
      <IconBtn icon="saveO" :disabled="isEqual(originalCurrent, current)" @click="saveTask(current)" />
    </template>
    <IonList @click.stop>
      <IonItem>
        <IonInput :label="tr.created" :value="localeDate(current.created)" readonly class="full-label" />
      </IonItem>
      <IonItem>
        <IonInput :label="tr.changed" :value="localeDate(current.changed)" readonly class="full-label" />
      </IonItem>
      <IonItem>
        <IonInput :label="tr.title" :placeholder="tr.typeTask" v-model="current.title" label-placement="fixed"
          :maxlength="50" />
      </IonItem>
      <IonItem>
        <IonTextarea :label="tr.description" v-model="current.description" :rows="4" :placeholder="tr.typeDescription"
          clear-input label-placement="fixed" :maxlength="300" />
      </IonItem>
      <IonItem>
        <UiSelect v-model="current.category" :label="tr.category" :header="tr.selectCategory">
          <SelectOption v-for="val in categories.slice(1)" :value="val" :label="getCategoryName(val)" />
        </UiSelect>
      </IonItem>
      <IonItem>
        <IonLabel>{{ tr.notification }}</IonLabel>
        <IonButton v-show="current.notification === emptyDatetime" color="light"
          @click="current.notification = getLateDate()" style="--box-shadow: 0">
          <Ikon icon="addO" />
          <Ikon icon="alarmO" small />
        </IonButton>
        <IonDatetimeButton v-show="current.notification !== emptyDatetime" datetime="datetime"
          :class="isLater(current.notification) ? '' : 'passed-date'" />
        <IconBtn v-show="current.notification !== emptyDatetime" color="danger" icon="closeCO"
          @click="current.notification = emptyDatetime" />
      </IonItem>
      <DateTimeModal id="datetime" v-model="current.notification" />
      <IonItem>
        <IonLabel>{{ tr.priority }}</IonLabel>
        <IonSegment v-model="current.priority" mode="ios">
          <IonSegmentButton v-for="value in priorities" :value="value">
            <IonLabel :color="priorityType[value]">{{ tr[value] }}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonItem>
      <IonItem>
        <IonCheckbox v-model="current.completed" justify="space-between" :class="{ primary: current.completed }">
          {{ tr.isCompleted }}
        </IonCheckbox>
      </IonItem>
      <IconText icon="trashO" :text="tr.delete" color="danger" @click="clickDelete(current)" />
    </IonList>
    <template v-if="data.length > 1" #footer>
      <IconTextBtn size="small" style="width: 100%" :text="tr.prev" icon="caretBackO"
        :disabled="data[0]?.id === current.id" @click="prevTask" />
      <IconTextBtn size="small" style="width: 100%" :text="tr.next" icon="caretForwardO"
        :disabled="data.at(-1)?.id === current.id" iconPlace="end" @click="nextTask" />
    </template>
  </UiModal>
</template>

<script setup>
import { IonDatetimeButton, IonList, IonItem, IonInput, IonTextarea, IonCheckbox, IonLabel, IonButton, IonSegment, IonSegmentButton } from '@ionic/vue';
import { IconTextBtn, IconBtn, IconText, Ikon, SelectOption } from "@/components/renderFunctions.js";
import { useGlobalStore } from '@/stores/globalStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { getLateDate, isLater, $bus, isEqual, clone } from "@/helpers/utils.js";
import { emptyDatetime, priorityType, priorities } from "@/helpers/constants.js";
import { ref, toRefs } from 'vue';
import UiModal from "@/components/UiModal.vue";
import UiSelect from "@/components/UiSelect.vue";
import DateTimeModal from "@/components/DateTimeModal.vue";

const props = defineProps({
  data: { type: Array, default: [] }
})

const emit = defineEmits(['delete', 'save'])

const { tr, params, localeDate } = useGlobalStore()
const { getCategoryName } = useCategoryStore()
const { categories } = toRefs(useCategoryStore())

const current = ref({})
let originalCurrent = {}

const saveTask = (task) => {
  emit('save', task)

  originalCurrent = clone(task)
  current.value = clone(task)

  if (params.autoClose) $bus.close('TaskModal')
}

const clickDelete = (task) => {
  $bus.close('TaskModal')
  emit('delete', task)
}

const openedModal = task => {
  originalCurrent = clone(task)
  current.value = clone(task)
}

const prevTask = () => {
  const idx = props.data.findIndex(it => it.id === current.value.id)
  const prev = idx === 0 ? props.data.at(-1) : props.data[idx - 1]
  originalCurrent = clone(prev)
  current.value = clone(prev)
}

const nextTask = () => {
  const idx = props.data.findIndex(it => it.id === current.value.id)
  const next = idx === (props.data.length - 1) ? props.data[0] : props.data[idx + 1]
  originalCurrent = clone(next)
  current.value = clone(next)
}
</script>

<style lang="sass">
.full-label > label
  justify-content: space-between
  & > .native-wrapper
    max-width: fit-content
</style>