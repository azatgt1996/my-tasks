<template>
    <!-- need install vite-svg-loader -->
    <component :is="defineAsyncComponent(() => import(`../assets/icons/${name}.svg`))"
        :width="size" :height="size" :data-name="name"/>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

defineProps({
    name: { type: String, required: true },
    size: { type: String, required: false }
})

</script>