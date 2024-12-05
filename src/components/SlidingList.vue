<template>
  <TransitionGroup v-show="data.length" ref="listRef" name="list" tag="ion-list">
    <ion-item-sliding v-for="item in data" :key="item.id" :disabled="selected.length > 0" @ionDrag="onIonDrag">
      <ion-item-options side="start" @ion-swipe="swipeTo('left', item)">
        <ion-item-option color="primary">
          <ion-icon slot="icon-only" :icon="leftIcon(item)" />
        </ion-item-option>
      </ion-item-options>
      <ion-item button @click="clickItem(item)" @touchstart="checkItem(item)" @touchend="clearTimer"
        @touchmove="sliding = true">
        <ion-icon v-show="selected.includes(item.id)" :icon="checkmarkOutline" color="success"
          class="check-icon mr-10" />
        <slot name="item" v-bind="item"/>
      </ion-item>
      <ion-item-options side="end" @ion-swipe="swipeTo('right', item)">
        <ion-item-option color="danger">
          <ion-icon slot="icon-only" :icon="rightIcon(item)" />
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </TransitionGroup>
</template>

<script setup>
import { onClickOutside } from '@vueuse/core';
import { Haptics } from "@capacitor/haptics";
import { IonIcon, IonItem, IonList/*dont_remove*/, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/vue';
import { checkmarkOutline } from 'ionicons/icons';
import { watch, ref } from 'vue';

const props = defineProps({
  data: Array, // example: [{id: '1', name: 'val1'}, {id: '2', name: 'val2'}] //id is required
  leftIcon: Function,
  rightIcon: Function,
  withVibro: Boolean,
})

const emit = defineEmits(['to-left', 'to-right', 'click-item'])

const swipeTo = (direction, item) => {
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
    if (props.withVibro) Haptics.vibrate({ duration: 12 })
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
  if (props.data.length == selected.value.length) selected.value = []
  else {
    selected.value = props.data.map(item => item.id)
    if (props.withVibro) Haptics.vibrate({ duration: 14 })
  }
}

const onIonDrag = (e) => {
  sliding = true

  const flag = /item-sliding-active-swipe-(start|end)/.test(e.target.className)
  if (flag !== swiped) {
    swiped = !swiped
    Haptics.vibrate({ duration: 6 })
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
  --ionicon-stroke-width: 80px
</style>