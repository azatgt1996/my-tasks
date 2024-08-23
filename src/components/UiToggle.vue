<template>
    <ion-toggle :checked="modelValue" @ionChange="val => emit('update:modelValue', val.detail.checked)">
        {{ label }}
    </ion-toggle>
</template>

<script setup>
import { IonToggle } from '@ionic/vue';

const props = defineProps({
    label: { type: String, required: false },
    modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

</script>