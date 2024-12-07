<template>
  <TransitionGroup v-show="data.length" ref="listRef" name="list" tag="ion-list">
    <IonItemSliding v-for="item in data" :key="item.id" :disabled="selected.length > 0" @ionDrag="onIonDrag">
      <IonItemOptions side="start" @ion-swipe="swipedTo('left', item)">
        <IonItemOption color="primary">
          <Ikon slot="icon-only" :icon="typeof leftIcon === 'string' ? leftIcon : leftIcon(item)" />
        </IonItemOption>
      </IonItemOptions>
      <IonItem button @click="clickItem(item)" @touchstart="checkItem(item)" @touchend="clearTimer"
        @touchmove="sliding = true">
        <Ikon v-show="selected.includes(item.id)" icon="checkmarkO" color="success" class="check-icon mr-10" />
        <slot name="item" v-bind="item" />
      </IonItem>
      <IonItemOptions side="end" @ion-swipe="swipedTo('right', item)">
        <IonItemOption color="danger">
          <Ikon slot="icon-only" :icon="typeof rightIcon === 'string' ? rightIcon : rightIcon(item)" />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  </TransitionGroup>
</template>

<script setup>
import { onClickOutside } from '@vueuse/core';
import { IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonList/*dont_remove*/ } from '@ionic/vue';
import { Ikon } from "@/components/renderFunctions.js";
import { watch, ref } from 'vue';
import { vibrate } from "@/helpers/utils.js";

const props = defineProps({
  data: Array, // example: [{id: '1', name: 'val1'}, {id: '2', name: 'val2'}] //id is required
  leftIcon: { type: [String, Function] },
  rightIcon: { type: [String, Function] },
  withVibro: Boolean,
})

const emit = defineEmits(['to-left', 'to-right', 'click-item'])

const swipedTo = (direction, item) => {
  listRef.value.$el.closeSlidingItems()
  emit(`to-${direction}`, item)
}

const listRef = ref()
onClickOutside(listRef, () => listRef.value.$el.closeSlidingItems())

let timer, notOpen = false, sliding = false, swiped = false

const selected = defineModel({ default: [] })
watch(selected, val => {
  if (!val.length) {
    notOpen = false
    swiped = false
  }
})

const select = (item) => {
  if (selected.value.includes(item.id)) {
    selected.value = selected.value.filter(id => id !== item.id)
  } else {
    selected.value.push(item.id)
    if (props.withVibro) vibrate(12)
  }
}

const clickItem = async (item) => {
  if (selected.value.length) {
    select(item)
    return notOpen = false
  }

  if (notOpen) return notOpen = false
  emit('click-item', item)
}

const clearTimer = () => {
  clearTimeout(timer)
  sliding = false
}

const selectAll = () => {
  if (props.data.length === selected.value.length) selected.value = []
  else {
    selected.value = props.data.map(item => item.id)
    if (props.withVibro) vibrate(14)
  }
}

const onIonDrag = (e) => {
  sliding = true

  const flag = /item-sliding-active-swipe-(start|end)/.test(e.target.className)
  if (flag !== swiped) {
    swiped = !swiped
    if (props.withVibro) vibrate(6)
  }
}

const checkItem = (item) =>
  timer = setTimeout(() => {
    if (sliding) return
    select(item)
    notOpen = true
  }, 700)

defineExpose({ selectAll })
</script>

<style lang="sass">
.check-icon
  --ionicon-stroke-width: 100px

.list-enter-active, .list-leave-active
  transition: all 0.4s ease
.list-enter-from, .list-leave-to
  opacity: 0

ion-item-sliding .item-options-start ion-item-option
  padding-right: 100%
ion-item-sliding .item-options-end ion-item-option
  padding-left: 100%

ion-item-sliding ion-item-options
  pointer-events: none

.item-sliding-active-options-start ion-item
  border-radius: 12px 0 0 12px
.item-sliding-active-options-end ion-item
  border-radius: 0 12px 12px 0
</style>