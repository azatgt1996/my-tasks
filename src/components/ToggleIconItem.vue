<template>
    <ion-item>
        <ion-icon :icon class="mr-10" />
        <ion-toggle :checked="modelValue" @ionChange="val => emit('update:modelValue', val.detail.checked)">
            {{ label }}
        </ion-toggle>
    </ion-item>
</template>

<script setup>
import { IonItem, IonIcon, IonToggle } from '@ionic/vue';

defineProps({
    icon: { type: String, required: true },
    label: { type: String, required: true },
    modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

</script>