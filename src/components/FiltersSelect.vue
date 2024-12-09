<template>
  <UiSelect v-show="false" id="filterSelect" v-model="filters" multiple :header="tr.filters">
    <OptionsGroup :label="tr.byPriorities" />
    <SelectOption v-for="val in priorities" :value="val" :label="tr[val]" :class="`${val}-item`" />
    <OptionsGroup :label="tr.others" />
    <SelectOption value="completed" :label="tr.completed" />
    <SelectOption value="notificated" :label="tr.notificated" />
  </UiSelect>
</template>

<script setup>
import { OptionsGroup, SelectOption } from "@/components/renderFunctions.js";
import { useGlobalStore } from '@/stores/globalStore';
import { priorities } from "@/helpers/constants.js";
import UiSelect from "@/components/UiSelect.vue";

const { tr } = useGlobalStore()

const filters = defineModel()
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