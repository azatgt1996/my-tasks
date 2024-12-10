<template>
  <IonItem>
    <IonInput :placeholder="tr.search" v-model="keyword" :maxlength="50" clear-input :debounce="500" :disabled>
      <Ikon slot="start" color="medium" small :icon="params.searchInDesc ? 'searchCO' : 'searchS'" />
      <IconBtn slot="end" size="small" icon="funnel" @click="$('#filterSelect').click()" :disabled
        :color="filters.length === 3 && isEqual(filters, priorities) ? 'medium' : 'primary'" style="margin-left: 0" />
      <UiSelect v-show="false" id="filterSelect" v-model="filters" multiple :header="tr.filters">
        <OptionsGroup :label="tr.byPriorities" />
        <SelectOption v-for="val in priorities" :value="val" :label="tr[val]" :class="`${val}-item`" />
        <OptionsGroup :label="tr.others" />
        <SelectOption value="completed" :label="tr.completed" />
        <SelectOption value="notificated" :label="tr.notificated" />
      </UiSelect>
    </IonInput>
  </IonItem>
</template>

<script setup>
import { IonInput, IonItem } from '@ionic/vue';
import { OptionsGroup, SelectOption, IconBtn, Ikon } from "@/components/renderFunctions.js";
import { useGlobalStore } from '@/stores/globalStore';
import { useTaskStore } from "@/stores/taskStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { priorities, priorityNum } from "@/helpers/constants.js";
import UiSelect from "@/components/UiSelect.vue";
import { $, isEqual, isLater, getDT } from "@/helpers/utils.js";
import { onMounted, watch, ref, computed, toRefs } from "vue";

defineProps({
  disabled: Boolean,
})

const { tr, params, storage } = useGlobalStore()
const { category } = toRefs(useCategoryStore())
const { tasks } = useTaskStore()
const { filtered, listStatus } = toRefs(useTaskStore())

const keyword = ref('')
const filters = ref([])

watch(filters, (val) => storage.set('filters', JSON.stringify(val)))

onMounted(async () => {
  filters.value = JSON.parse(await storage.get('filters')) ?? priorities
})

const grouped = computed(() => {
  if (category.value === 'allCategories') return tasks
  return tasks.filter(it => it.category === category.value)
})

const _filtered = computed(() => {
  const _filters = filters.value
  const _keyword = keyword.value.toLowerCase().trim()
  const { sortBy, orderByDesc, searchInDesc } = params

  const $filtered = grouped.value.filter(it => {
    let res = it.title.toLowerCase().includes(_keyword)
    if (searchInDesc) res ||= it.description.toLowerCase().includes(_keyword)
    res &&= _filters.includes(it.priority)
    if (!_filters.includes('completed')) res &&= !it.completed
    if (_filters.includes('notificated')) res &&= isLater(it.notification)
    return res
  })
  return $filtered.sort((t1, t2) => {
    if (orderByDesc) [t1, t2] = [t2, t1]
    if (sortBy === 'created') return new Date(t1.created) - new Date(t2.created)
    if (sortBy === 'changed') return new Date(t1.changed) - new Date(t2.changed)
    if (sortBy === 'title') return t1.title.localeCompare(t2.title)
    if (sortBy === 'priority') return priorityNum[t1.priority] - priorityNum[t2.priority]
    if (sortBy === 'notification') return getDT(t1.notification) - getDT(t2.notification)
  })
})

const _listStatus = computed(() => {
  if (keyword.value.trim() && !_filtered.value.length) return tr.tasksNotFound
  if (!grouped.value.length) return tr.emptyList
})

watch(_filtered, (val) => filtered.value = val)
watch(_listStatus, (val) => listStatus.value = val)
</script>

<style lang="sass">
@each $pr, $color in (low: success, medium: warning, high: danger)
  .#{$pr}-item[aria-checked="true"]
    .alert-checkbox-icon
      border-color: var(--ion-color-#{$color}) !important
      background-color: var(--ion-color-#{$color}) !important
    .alert-radio-icon
      border-color: var(--ion-color-#{$color}) !important
      .alert-radio-inner
        background-color: var(--ion-color-#{$color})
</style>