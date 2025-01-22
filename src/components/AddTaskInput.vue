<template>
  <IonItem lines="none">
    <IonInput
      id="add-input"
      :placeholder="tr.newTask"
      v-model="title"
      :disabled
      :maxlength="50"
      clear-input
      @keyup.enter="onChange"
    >
      <IconBtn
        slot="end"
        size="small"
        icon="addC"
        :color="!title?.trim() ? 'secondary' : 'primary'"
        :disabled
        style="margin-left: 0"
        @click="onChange"
      />
    </IonInput>
  </IonItem>
</template>

<script setup>
import { IonItem, IonInput } from '@ionic/vue';
import { IconBtn } from '@/components/renderFunctions.js';
import { useGlobalStore } from '@/stores/globalStore';
import { $ } from '@/helpers/utils.js';
import { ref } from 'vue';

const { tr, errToast } = useGlobalStore();
const title = ref('');

const onChange = () => {
  title.value = title.value.trim();

  if (!title.value) {
    if ($('#add-input').className.includes('has-focus'))
      errToast(tr.titleIsEmpty);
    return $('#add-input').setFocus();
  }
  emit('change', title.value);
  title.value = '';
};

defineProps({ disabled: Boolean });

const emit = defineEmits(['change']);
</script>
