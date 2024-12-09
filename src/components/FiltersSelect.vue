<template>
  <IconBtn slot="end" size="small" icon="funnel" @click="$('#filterSelect').click()" :disabled
    :color="filters.length === 3 && isEqual(filters, priorities) ? 'medium' : 'primary'" style="margin-left: 0" />
  <UiSelect v-show="false" id="filterSelect" v-model="filters" multiple :header="tr.filters">
    <OptionsGroup :label="tr.byPriorities" />
    <SelectOption v-for="val in priorities" :value="val" :label="tr[val]" :class="`${val}-item`" />
    <OptionsGroup :label="tr.others" />
    <SelectOption value="completed" :label="tr.completed" />
    <SelectOption value="notificated" :label="tr.notificated" />
  </UiSelect>
</template>

<script setup>
import { OptionsGroup, SelectOption, IconBtn } from "@/components/renderFunctions.js";
import { useGlobalStore } from '@/stores/globalStore';
import { priorities } from "@/helpers/constants.js";
import UiSelect from "@/components/UiSelect.vue";
import { $, isEqual } from "@/helpers/utils.js";
import { onMounted, watch } from "vue";

defineProps({
  disabled: Boolean
})

const { tr, storage } = useGlobalStore()

const filters = defineModel()

watch(filters, (val) => storage.set('filters', JSON.stringify(val)))

onMounted(async () => {
  filters.value = JSON.parse(await storage.get('filters')) ?? priorities
})
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